const fs = require("fs")
const tls = require('tls');
const net = require('net');
const https = require('https');

const msftTrusted = {}

// CAs that must never be shipped, even if still listed by Mozilla or Microsoft.
// Embedded TLS stacks cannot enforce partial distrust (SCTNotAfter / NotBefore)
// or revocation (OneCRL), so these roots are removed outright.
const blockedSubjects = [
    // eMudhra / emSign - intermediate CA key compromise, October 2026
    // https://emudhra.com/en/post/certificate-security-incident
    /eMudhra/i,
    /emSign/i,
]

function parseCsv(text) {
    const rows = []
    let row = []
    let field = ""
    let quoted = false
    for (let i = 0; i < text.length; ++i) {
        const c = text[i]
        if (quoted) {
            if (c == '"') {
                if (text[i + 1] == '"') {
                    field += '"'
                    i++
                } else {
                    quoted = false
                }
            } else {
                field += c
            }
        } else if (c == '"') {
            quoted = true
        } else if (c == ",") {
            row.push(field)
            field = ""
        } else if (c == "\n" || c == "\r") {
            if (c == "\r" && text[i + 1] == "\n") i++
            row.push(field)
            rows.push(row)
            row = []
            field = ""
        } else {
            field += c
        }
    }
    if (field || row.length) {
        row.push(field)
        rows.push(row)
    }
    return rows.filter(r => r.length > 1 || r[0])
}

// see https://learn.microsoft.com/en-us/security/trusted-root/participants-list
https.get('https://ccadb.my.salesforce-sites.com/microsoft/IncludedCACertificateReportForMSFTCSV', (resp) => {
    if (resp.statusCode != 200) {
        console.error("failed to fetch Microsoft CA list: HTTP " + resp.statusCode)
        process.exit(1)
    }
    let data = '';
    resp.on('data', (chunk) => { data += chunk; });
    resp.on('end', () => {
        const rows = parseCsv(data)
        const hd = rows.shift()
        const col = name => {
            const idx = hd.indexOf(name)
            if (idx < 0) {
                console.error("missing column in Microsoft CA list: " + name)
                process.exit(1)
            }
            return idx
        }
        const statusIdx = col("Microsoft Status")
        const shaIdx = col("SHA-256 Fingerprint")
        const ekuIdx = col("Microsoft EKUs")
        for (const words of rows) {
            if (/Server Authentication/i.test(words[ekuIdx]) && words[statusIdx] == "Included")
                msftTrusted[words[shaIdx].toUpperCase()] = 1
        }

        // These keys share public key, but for whatever reason were re-issued and
        // Mozilla and Microsoft have different versions.
        //
        // Use https://crt.sh/?q=1A0D20445DE5BA1862D19EF880858CBCE50102B36E8F0A040C3C69E74522FE6E etc
        // to see the certs.

        // COMODO Certification Authority
        if (msftTrusted["1A0D20445DE5BA1862D19EF880858CBCE50102B36E8F0A040C3C69E74522FE6E"])
            msftTrusted["0C2CD63DF7806FA399EDE809116B575BF87989F06518F9808C860503178BAF66"] = 1

        // Network Solutions Certificate Authority
        if (msftTrusted["001686CD181F83A1B1217D305B365C41E3470A78A1D37B134A98CD547B92DAB3"])
            msftTrusted["15F0BA00A3AC7AF3AC884C072B1011A077BD77C097F40164B2F8598ABD83860C"] = 1

        main()
    });
})

function certInfo(pem) {
    const secureContext = tls.createSecureContext({
        cert: pem
    });

    const secureSocket = new tls.TLSSocket(new net.Socket(), { secureContext });

    return secureSocket.getCertificate();
}

function subj(inf) {
    const keys = Object.keys(inf)
    keys.reverse()
    return keys.map(k => inf[k]).join(", ")
}

function main() {

    let outp = ""
    let cert = ""
    for (const ln of fs.readFileSync(process.argv[2], "utf8").split(/\r?\n/)) {
        if (ln.startsWith("##"))
            outp += ln + "\n"
        else if (ln == "-----BEGIN CERTIFICATE-----") {
            cert = ln + "\n"
        } else if (ln == "-----END CERTIFICATE-----") {
            cert += ln + "\n"
            const info = certInfo(cert)
            const sha = info.fingerprint256.replace(/:/g, "")
            const subject = subj(info.subject)
            if (blockedSubjects.some(re => re.test(subject))) {
                console.log("skipping", sha, subject, " (blocked)")
            } else if (msftTrusted[sha]) {
                outp += "# " + subject + "\n"
                outp += "# " + info.valid_to + "\n"
                outp += "# " + sha + "\n"
                outp += cert + "\n"
            } else {
                console.log("skipping", sha, subject, " (not in MSFT list)")
            }
            cert = ""
        } else if (cert) {
            cert += ln + "\n"
        }
    }

    fs.writeFileSync(process.argv[3], outp)
    console.log("written", process.argv[3])
}
