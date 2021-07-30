all: certs/ca-bundle.pem
	LC_ALL=C.UTF-8 idf.py build
	base64 build/pxtapp.bin > build/pxtapp.b64

include certs.mk