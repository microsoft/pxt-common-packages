include Makefile.inc

BUILD := bld-$(CROSS_TRIPLE)
SDL_OBJ := $(BUILD)/pxtapp/hw---vm/sdlmain.o
PXT_OBJS := $(PXT_OBJS:bld/%=$(BUILD)/%)
PXT_OBJS := $(PXT_OBJS:$(SDL_OBJ)=)

COMMON_FLAGS = -W -Wall -Wno-unused-parameter -Wno-unused-private-field -Ipxtapp \
	-fwrapv -fno-threadsafe-statics -ffunction-sections -fno-strict-aliasing -O2 \
	$(NPM_INCLUDES) -g
LIBS = -lm -lpthread
CFLAGS = $(COMMON_FLAGS) -std=c99
CXXFLAGS = $(COMMON_FLAGS) -std=c++11 -fno-rtti -fno-exceptions -fno-unwind-tables
LDFLAGS = -g

CC = $(PREF)gcc
LD = $(PREF)gcc
LIBSTDCPP = 
NPM_LIBS = $(wildcard node_modules/*/lib/*.a)
NPM_INCLUDES = $(addprefix -I, $(wildcard node_modules/*/include))


ifeq (darwin,$(findstring darwin,$(CROSS_TRIPLE)))
SOFLAGS := -dynamiclib
SONAME := libpxt.dylib
EXE := $(BUILD)/pxt-vm-cli
SDL_EXE = $(BUILD)/pxt-vm-sdl
else
ifeq (linux,$(findstring linux,$(CROSS_TRIPLE)))
SOFLAGS := -shared
SONAME := libpxt.so
EXE := $(BUILD)/pxt-vm-cli-linux
COMMON_FLAGS += -fPIC
SDL_EXE = skip
else
SOFLAGS := -shared -static
SONAME := pxt.dll
EXE := $(BUILD)/pxt-vm-cli.exe
SDL_EXE = $(BUILD)/pxt-vm-sdl.exe
endif
endif


DEPS = $(PXT_HEADERS) package.json Makefile Makefile.inc

all:
	CROSS_TRIPLE=osx crossbuild make -j8 build-one
	CROSS_TRIPLE=win64 crossbuild make -j8 build-one
	CROSS_TRIPLE=linux crossbuild make -j8 build-one
	rm -f bld/*.tgz bld/*.b64
	tar zcf bld/all.tgz bld/*
	base64 < bld/all.tgz > bld/all.tgz.b64
	@ls -l bld/
	@echo Build OK

create-dir:
	mkdir -p $(BUILD) bld

build-one: create-dir $(EXE)
ifneq ($(SDL_EXE),skip)
	$(MAKE) CXXFLAGS="$(CXXFLAGS) $(shell sdl2-config --cflags)" $(SDL_EXE)
endif

$(EXE) $(SONAME): $(PXT_OBJS)
	$(LD) -o $(EXE) $(LDFLAGS) $(PXT_OBJS) $(LIBSTDCPP) $(LIBS) $(NPM_LIBS)
	$(LD) -o $(SONAME) $(SOFLAGS) $(LDFLAGS) $(PXT_OBJS) $(LIBSTDCPP) $(LIBS) $(NPM_LIBS)
	cp $(EXE) $(SONAME) bld/

$(SDL_EXE): $(SDL_OBJ)
	$(LD) -o $(SDL_EXE) $(LDFLAGS) $(SDL_OBJ) $(LIBSTDCPP) $(LIBS) $(shell sdl2-config --static-libs)
	cp $(SDL_EXE) bld/

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
