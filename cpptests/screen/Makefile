T = ../../libs
CFLAGS = -ffunction-sections -fno-rtti -fno-exceptions -std=c++11 \
	-W -Wall -Wno-unused-const-variable \
	 -g -O3 \
	-DX86_64 -I. -I$(T)/base 
PXT_SRC = $(T)/screen/image.cpp \
	$(T)/base/pxt.cpp \
	$(T)/base/core.cpp \

all: inner

docker:
	docker run --rm -it -v $$PWD/../..:/src -w /src/cpptests/screen -u build pext/yotta make inner

build:
	rm -f libpxt.a
	gcc $(CFLAGS) -c $(PXT_SRC)
	ar r libpxt.a *.o
	rm -f *.o
	gcc $(CFLAGS) -o test imgtest.cpp -L. -lpxt

inner: build
	@echo; echo Testing...; echo
	@./test || :
	@echo
	@rm -rf libpxt.a test test.dSYM
