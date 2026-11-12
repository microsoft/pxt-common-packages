# Certificates

The built-in certificate list is intersection of the 
[list used by Mozilla](https://hg.mozilla.org/releases/mozilla-release/raw-file/default/security/nss/lib/ckfw/builtins/certdata.txt)
with the [Microsoft Trusted Root Program](https://docs.microsoft.com/en-us/security/trusted-root/participants-list)

To re-generate the list do the following:

```bash
curl -fsSL https://curl.se/ca/cacert.pem > ca-bundle.crt
node filter-bundle.js ca-bundle.crt ca-bundle.pem
```

`filter-bundle.js` explicitly excludes eMudhra/emSign roots following the October 2026
intermediate key compromise, even if the downloaded input snapshots still contain them.
Inclusion in those inputs does not establish current browser or operating-system trust.

The `ca-bundle.pem` file should be checked in. Once you have the commit sha, you need to update
`libs/core---esp32/certs.mk` (also used by `core---esp32s2`) to point at it.

