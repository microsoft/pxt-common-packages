const fs = require("fs")
const tls = require('tls');
const net = require('net');
const https = require('https');

const msftTrusted = {}

// see https://docs.microsoft.com/en-us/security/trusted-root/participants-list
https.get('https://ccadb-public.secure.force.com/microsoft/IncludedCACertificateReportForMSFTCSV', (resp) => {
    let data = '';
    resp.on('data', (chunk) => { data += chunk; });
    resp.on('end', () => {
        for (const ln of data.split(/\n/)) {
            const words = JSON.parse("[" + ln + "]")
            if (/Server Authentication/i.test(words[8]) && /Included/.test(words[9]))
                msftTrusted[words[3]] = 1
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
    for (const ln of fs.readFileSync(process.argv[2], "utf8").split(/\n/)) {
        if (ln.startsWith("#"))
            outp += ln + "\n"
        else if (ln == "-----BEGIN CERTIFICATE-----") {
            cert = ln + "\n"
        } else if (ln == "-----END CERTIFICATE-----") {
            cert += ln + "\n"
            const info = certInfo(cert)
            const sha = info.fingerprint256.replace(/:/g, "")
            if (msftTrusted[sha]) {
                outp += "# " + subj(info.subject) + "\n"
                outp += "# " + info.valid_to + "\n"
                outp += "# " + sha + "\n"
                outp += cert + "\n"
            } else {
                console.log("skipping", sha, subj(info.subject), " (not in MSFT list)")
            }
            cert = ""
        } else if (cert) {
            cert += ln + "\n"
        }
    }

    fs.writeFileSync(process.argv[3], outp)
    console.log("written", process.argv[3])
}
