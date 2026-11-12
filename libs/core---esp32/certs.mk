certs/ca-bundle.pem:
	mkdir -p certs
	curl https://raw.githubusercontent.com/microsoft/pxt-common-packages/884dc0160ee4555b3483604124a887ed3579e583/libs/wifi---esp32/ca-bundle.pem > $@
