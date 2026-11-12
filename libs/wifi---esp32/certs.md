# Certificates

The built-in certificate list is intersection of the 
[list used by Mozilla](https://hg.mozilla.org/releases/mozilla-release/raw-file/default/security/nss/lib/ckfw/builtins/certdata.txt)
with the [Microsoft Trusted Root Program](https://docs.microsoft.com/en-us/security/trusted-root/participants-list)

To re-generate the list do the following:

```bash
curl -fsSL https://curl.se/ca/cacert.pem > ca-bundle.crt
node filter-bundle.js ca-bundle.crt ca-bundle.pem
```

(`cacert.pem` is curl's pre-built output of `mk-ca-bundle.pl`; alternatively run
`perl mk-ca-bundle.pl -f` from https://github.com/curl/curl/blob/master/scripts/mk-ca-bundle.pl.)

`filter-bundle.js` also drops roots listed in `blockedSubjects`, even if Mozilla or Microsoft still include them,
since the device cannot enforce partial distrust or revocation. Currently this blocks eMudhra/emSign
(intermediate key compromise, October 2026).

The `ca-bundle.pem` file should be checked in. Once you have the commit sha, you need to update
`libs/core---esp32/certs.mk` (also used by `core---esp32s2`) to point at it.

