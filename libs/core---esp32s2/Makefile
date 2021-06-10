all:
	test -f sdkconfig || LC_ALL=C.UTF-8 idf.py set-target esp32s2
	LC_ALL=C.UTF-8 idf.py build
	base64 build/pxtapp.bin > build/pxtapp.b64
