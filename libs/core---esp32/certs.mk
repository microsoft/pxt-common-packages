certs/ca-bundle.pem:
	mkdir -p certs
	curl https://raw.githubusercontent.com/microsoft/pxt-common-packages/cc0fe4a5985eb92cfd153d31ed88d0721895b001/libs/wifi---esp32/ca-bundle.crt > $@
