certs/ca-bundle.pem:
	mkdir -p certs
	curl https://raw.githubusercontent.com/microsoft/pxt-common-packages/9e8fdb8fd6e21c096f1fe2340652473ddab05d7e/libs/wifi---esp32/ca-bundle.pem > $@
