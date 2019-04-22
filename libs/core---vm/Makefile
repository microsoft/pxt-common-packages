include Makefile.inc

CODAL_SRC =

CODAL_INC = \
	-Icodal-core/inc/streams \
	-Icodal-core/inc/types \
	-Icodal-core/inc/core \
	-Icodal-core/inc/drivers \
	-Icodal-core/inc/driver-models \

BUILD := bld-$(CROSS_TRIPLE)
PXT_OBJS := $(addprefix $(BUILD)/,$(CODAL_SRC:.cpp=.o)) $(PXT_OBJS:bld/%=$(BUILD)/%)

COMMON_FLAGS = -W -Wall -Wno-unused-parameter -Wno-unused-private-field -Ipxtapp \
	-fwrapv -fno-threadsafe-statics -ffunction-sections -fno-strict-aliasing -O2 \
	$(NPM_INCLUDES) -g \
	$(CODAL_INC)
LIBS = -lm -lpthread
CFLAGS = $(COMMON_FLAGS) -std=c99
CXXFLAGS = $(COMMON_FLAGS) -std=c++11 -fno-rtti -fno-exceptions -fno-unwind-tables
LDFLAGS = -g

CC = $(PREF)gcc
LD = $(PREF)gcc
#LIBSTDCPP = /usr/lib/gcc/arm-linux-gnueabi/4.9/libstdc++.a
LIBSTDCPP = 
NPM_LIBS = $(wildcard node_modules/*/lib/*.a)
NPM_INCLUDES = $(addprefix -I, $(wildcard node_modules/*/include))


ifeq (darwin,$(findstring darwin,$(CROSS_TRIPLE)))
SOFLAGS := -dynamiclib
SONAME := libpxt.dylib
EXE := $(BUILD)/pxt-vm-cli
else
ifeq (linux,$(findstring linux,$(CROSS_TRIPLE)))
SOFLAGS := -shared
SONAME := libpxt.so
EXE := $(BUILD)/pxt-vm-cli-linux
COMMON_FLAGS += -fPIC
else
SOFLAGS := -shared -static
SONAME := pxt.dll
EXE := $(BUILD)/pxt-vm-cli.exe
endif
endif

DEPS = $(PXT_HEADERS) package.json Makefile Makefile.inc

all: codal-core/.git
	CROSS_TRIPLE=osx crossbuild make -j8 build-one
	CROSS_TRIPLE=win64 crossbuild make -j8 build-one
	CROSS_TRIPLE=linux crossbuild make -j8 build-one
	cp /usr/x86_64-w64-mingw32/lib/libwinpthread-1.dll bld/
	rm -f bld/*.tgz bld/*.b64
	tar zcf bld/all.tgz bld/*
	base64 < bld/all.tgz > bld/all.tgz.b64
	@echo Build OK

create-dir:
	mkdir -p $(BUILD) bld

build-one: create-dir $(EXE)

codal-core/.git:
	git clone -b streamracefix-v0 https://github.com/lancaster-university/codal-core.git

$(EXE) $(SONAME): $(PXT_OBJS)
	$(LD) -o $(EXE) $(LDFLAGS) $(PXT_OBJS) $(LIBSTDCPP) $(LIBS) $(NPM_LIBS)
	$(LD) -o $(SONAME) $(SOFLAGS) $(LDFLAGS) $(PXT_OBJS) $(LIBSTDCPP) $(LIBS) $(NPM_LIBS)
	cp $(EXE) $(SONAME) bld/
	@ls -l $(EXE) $(SONAME)

clean:
	rm -rf bld bld-*

$(BUILD)/%.o: %.cpp $(DEPS)
	@mkdir -p $(dir $@)
	$(CC) $(CXXFLAGS) -c $< -o $@

$(BUILD)/%.o: %.s $(DEPS)
	@mkdir -p $(dir $@)
	$(CC) $(CFLAGS) -c $< -o $@

$(BUILD)/%.o: %.c $(DEPS)
	@mkdir -p $(dir $@)
	$(CC) $(CFLAGS) -c $< -o $@
