const fs = require("fs")

let frameBytes = []
let lastTime = 0

const dev_ids = {
    "119c5abca9fd6070": "JDM3.0-ACC-burned",
    "ffc91289c5dc5280": "JDM3.0-ACC",
    "766ccc5755a22eb4": "JDM3.0-LIGHT",
    "259ab02e98bc2752": "F840-0",
    "69a9eaeb1a7d2bc0": "F840-1",
    "08514ae8a1995a00": "KITTEN-0",
    "XEOM": "DEMO-ACC-L",
    "OEHM": "DEMO-ACC-M",
    "MTYV": "DEMO-LIGHT",
    "ZYQT": "DEMO-MONO",
    "XMMW": "MB-BLUE",
    "CJFN": "DEMO-CPB",
}

// Generic commands
const CMD_ADVERTISEMENT_DATA = 0x00

const JD_SERIAL_HEADER_SIZE = 16
const JD_SERIAL_MAX_PAYLOAD_SIZE = 236
const JD_SERVICE_NUMBER_MASK = 0x3f
const JD_SERVICE_NUMBER_INV_MASK = 0xc0
const JD_SERVICE_NUMBER_CRC_ACK = 0x3f
const JD_SERVICE_NUMBER_CTRL = 0x00

// the COMMAND flag signifies that the device_identifier is the recipent
// (i.e., it's a command for the peripheral); the bit clear means device_identifier is the source
// (i.e., it's a report from peripheral or a broadcast message)
const JD_FRAME_FLAG_COMMAND = 0x01
// an ACK should be issued with CRC of this package upon reception
const JD_FRAME_FLAG_ACK_REQUESTED = 0x02
// the device_identifier contains target service class number
const JD_FRAME_FLAG_IDENTIFIER_IS_SERVICE_CLASS = 0x04


const service_classes = {
    "<disabled>": -1,
    CTRL: 0,
    LOGGER: 0x12dc1fca,
    BATTERY: 0x1d2a2acd,
    ACCELEROMETER: 0x1f140409,
    BUTTON: 0x1473a263,
    TOUCHBUTTON: 0x130cf5be,
    LIGHT_SENSOR: 0x15e7a0ff,
    MICROPHONE: 0x1a5c5866,
    THERMOMETER: 0x1421bac7,
    SWITCH: 0x14218172,
    PIXEL: 0x1768fbbf,
    HAPTIC: 0x116b14a3,
    LIGHT: 0x126f00e0,
    KEYBOARD: 0x1ae4812d,
    MOUSE: 0x14bc97bf,
    GAMEPAD: 0x100527e8,
    MUSIC: 0x1b57b1d7,
    SERVO: 0x12fc9103,
    CONTROLLER: 0x188ae4b8,
    LCD: 0x18d5284c,
    MESSAGE_BUS: 0x115cabf5,
    COLOR_SENSOR: 0x14d6dda2,
    LIGHT_SPECTRUM_SENSOR: 0x16fa0c0d,
    PROXIMITY: 0x14c1791b,
    TOUCH_BUTTONS: 0x1acb49d5,
    SERVOS: 0x182988d8,
    ROTARY_ENCODER: 0x10fa29c9,
    DNS: 0x117729bd,
    PWM_LIGHT: 0x1fb57453,
    BOOTLOADER: 0x1ffa9948,
}

const generic_commands = {
    CMD_ADVERTISEMENT_DATA: 0x00,
    CMD_EVENT: 0x01,
    CMD_CALIBRATE: 0x02,
    CMD_GET_DESCRIPTION: 0x03,
    /*
    CMD_CTRL_NOOP: 0x80,
    CMD_CTRL_IDENTIFY: 0x81,
    CMD_CTRL_RESET: 0x82,
    */
}

const generic_regs = {
    REG_INTENSITY: 0x01,
    REG_VALUE: 0x02,
    REG_IS_STREAMING: 0x03,
    REG_STREAMING_INTERVAL: 0x04,
    REG_LOW_THRESHOLD: 0x05,
    REG_HIGH_THRESHOLD: 0x06,
    REG_MAX_POWER: 0x07,
    REG_READING: 0x101
}

const CMD_TOP_MASK = 0xf000
const CMD_REG_MASK = 0x0fff
const CMD_SET_REG = 0x2000
const CMD_GET_REG = 0x1000

const devices = {}

function reverseLookup(map, n) {
    for (let k of Object.keys(map)) {
        if (map[k] == n)
            return k
    }
    return toHex(n)
}

function serviceName(n) {
    return reverseLookup(service_classes, n)
}

function commandName(n) {
    let pref = ""
    if ((n & CMD_TOP_MASK) == CMD_SET_REG) pref = "SET["
    else if ((n & CMD_TOP_MASK) == CMD_GET_REG) pref = "GET["
    if (pref) {
        const reg = n & CMD_REG_MASK
        return pref + reverseLookup(generic_regs, reg) + "]"
    }
    return reverseLookup(generic_commands, n)
}

function crc(p) {
    let crc = 0xffff;
    for (let i = 0; i < p.length; ++i) {
        const data = p[i];
        let x = (crc >> 8) ^ data;
        x ^= x >> 4;
        crc = (crc << 8) ^ (x << 12) ^ (x << 5) ^ x;
        crc &= 0xffff;
    }
    return crc;
}

function toHex(n) {
    return "0x" + n.toString(16)
}

function ALIGN(n) { return (n + 3) & ~3 }

function splitIntoPackets(frame) {
    const res = []
    if (frame.length != 12 + frame[2])
        console.log("unexpected packet len: " + frame.length)
    for (let ptr = 12; ptr < 12 + frame[2];) {
        const psz = frame[ptr] + 4
        const sz = ALIGN(psz)
        const pkt = Buffer.concat([frame.slice(0, 12), frame.slice(ptr, ptr + psz)])
        if (ptr + sz > 12 + frame[2]) {
            console.log(`invalid frame compression, res len=${res.length}`)
            res.push(pkt)
            break
        }
        res.push(pkt)
        ptr += sz
    }

    return res
}


function shortDeviceId(devid) {
    function fnv1(data) {
        let h = 0x811c9dc5
        for (let i = 0; i < data.length; ++i) {
            h = Math.imul(h, 0x1000193) ^ data[i]
        }
        return h
    }

    function hash(buf, bits) {
        bits |= 0
        if (bits < 1)
            return 0
        const h = fnv1(buf)
        if (bits >= 32)
            return h >>> 0
        else
            return ((h ^ (h >>> bits)) & ((1 << bits) - 1)) >>> 0
    }

    function idiv(x, y) { return ((x | 0) / (y | 0)) | 0 }

    const h = hash(Buffer.from(devid, "hex"), 30)
    return String.fromCharCode(0x41 + h % 26) +
        String.fromCharCode(0x41 + idiv(h, 26) % 26) +
        String.fromCharCode(0x41 + idiv(h, 26 * 26) % 26) +
        String.fromCharCode(0x41 + idiv(h, 26 * 26 * 26) % 26)
}

function num2str(n) {
    return n + " (0x" + n.toString(16) + ")"
}

function showPkt(pkt) {
    const dev_id = pkt.slice(4, 12).toString("hex")
    const size = pkt[12]
    const service_number = pkt[13]
    const service_cmd = pkt[14] | (pkt[15] << 8)
    const frame_flags = pkt[3]
    let dev = devices[dev_id]
    if (!dev) {
        dev = devices[dev_id] = { id: dev_id, service_names: ["CTRL"] }
    }

    const devname = dev_ids[dev_id] ||
        dev_ids[shortDeviceId(dev_id)] ||
        (dev_id + ":" + shortDeviceId(dev_id))

    const service_name =
        (service_number == JD_SERVICE_NUMBER_CRC_ACK ? "CRC-ACK" : (dev.service_names[service_number] || "")) +
        ` (${service_number})`
    let pdesc = `${devname}/${service_name}: ${commandName(service_cmd)}; sz=${size}`
    if (frame_flags & JD_FRAME_FLAG_COMMAND)
        pdesc = 'to ' + pdesc
    else
        pdesc = 'from ' + pdesc
    if (frame_flags & JD_FRAME_FLAG_ACK_REQUESTED)
        pdesc = `[ack:0x${pkt.readUInt16LE(0).toString(16)}] ` + pdesc
    if (frame_flags & JD_FRAME_FLAG_IDENTIFIER_IS_SERVICE_CLASS)
        pdesc = "[mul] " + pdesc
    const d = pkt.slice(16, 16 + size)

    if (service_number == 0 && service_cmd == CMD_ADVERTISEMENT_DATA) {
        if (dev.services && dev.services.equals(d)) {
            pdesc = " ====== " + pdesc
            //   pdesc = ""
        } else {
            dev.services = d
            const services = []
            dev.service_names = services
            for (let i = 0; i < d.length; i += 4) {
                services.push(serviceName(d.readInt32LE(i)))
            }
            pdesc += "; " + "Announce services: " + services.join(", ")
        }
    } else {
        let v0 = null, v1 = null
        if (d.length == 1) {
            v0 = d.readUInt8(0)
            v1 = d.readInt8(0)
        } else if (d.length == 2) {
            v0 = d.readUInt16LE(0)
            v1 = d.readInt16LE(0)
        } else if (d.length == 4) {
            v0 = d.readUInt16LE(0)
            v1 = d.readInt16LE(0)
        }

        if (v0 != null) {
            pdesc += "; " + num2str(v0)
            if (v0 != v1)
                pdesc += "; signed: " + num2str(v1)
        } else if (d.length) {
            pdesc += "; " + d.toString("hex")
        }
    }
    if (pdesc)
        console.log(Math.round(lastTime * 1000) + "ms: " + pdesc)

}

function displayPkt(msg) {
    if (frameBytes.length == 0)
        return
    const frame = Buffer.from(frameBytes)
    const size = frame[2] || 0
    if (frame.length < size + 12) {
        console.log(`got only ${frame.length} bytes; expecting ${size + 12}; end=${msg}`)
    } else if (size < 4) {
        console.log(`empty packet`)
    } else {
        const c = crc(frame.slice(2, size + 12))
        if (frame.readUInt16LE(0) != c) {
            console.log(`crc mismatch; msg=${msg} sz=${size} got:${frame.readUInt16LE(0)}, exp:${c}`)
        } else {
            if (msg) console.log(msg)
            splitIntoPackets(frame).forEach(showPkt)
        }
    }
    frameBytes = []
    lastTime = 0
}

for (let ln of fs.readFileSync(process.argv[2], "utf8").split(/\r?\n/)) {
    const m = /^([\d\.]+),Async Serial,.*(0x[A-F0-9][A-F0-9])/.exec(ln)
    if (!m)
        continue
    const tm = parseFloat(m[1])
    if (lastTime && tm - lastTime > 0.1) {
        // timeout
        displayPkt("timeout")
    }

    lastTime = tm

    if (ln.indexOf("framing error") > 0) {
        displayPkt("")
    } else {
        frameBytes.push(parseInt(m[2]))
    }
}
