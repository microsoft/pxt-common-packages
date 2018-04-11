T = ../../libs
CFLAGS = -ffunction-sections -fno-rtti -fno-exceptions -std=c++11 -W -Wall -DX86_64 -I. -I$(T)/base 
PXT_SRC = $(T)/screen/image.cpp \
	$(T)/base/pxt.cpp \
	$(T)/base/core.cpp \

all:
	docker run --rm -it -v $$PWD/../..:/src -w /src/cpptests/screen -u build pext/yotta make inner

inner:
	gcc $(CFLAGS) -c $(PXT_SRC)
	ar r libpxt.a *.o
	rm -f *.o
	gcc $(CFLAGS) -o test main.cpp -L. -lpxt
	./test
	rm libpxt.a test
