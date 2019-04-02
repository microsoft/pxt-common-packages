include Makefile.inc

CODAL_SRC =

CODAL_INC = \
	-Icodal-core/inc/streams \
	-Icodal-core/inc/types \
	-Icodal-core/inc/core \
	-Icodal-core/inc/drivers \
	-Icodal-core/inc/driver-models \

PXT_OBJS := $(addprefix bld/,$(CODAL_SRC:.cpp=.o)) $(PXT_OBJS)

COMMON_FLAGS = -W -Wall -Wno-unused-parameter -Wno-unused-private-field -Ipxtapp \
	-fwrapv -fno-threadsafe-statics -ffunction-sections -O3 \
	$(NPM_INCLUDES) -g \
	$(CODAL_INC)
LIBS = -lm -lpthread
CFLAGS = $(COMMON_FLAGS) -std=c99
CXXFLAGS = $(COMMON_FLAGS) -std=c++11 -fno-rtti -fno-exceptions -fno-unwind-tables
LDFLAGS = -Wl,--gc-sections -Wl,--sort-common -Wl,--sort-section=alignment -g

CC = $(PREF)gcc
LD = $(PREF)gcc
#LIBSTDCPP = /usr/lib/gcc/arm-linux-gnueabi/4.9/libstdc++.a
LIBSTDCPP = 
NPM_LIBS = $(wildcard node_modules/*/lib/*.a)
NPM_INCLUDES = $(addprefix -I, $(wildcard node_modules/*/include))

EXE = bld/pxt-app.elf
HEX = $(EXE:.elf=.hex)

DEPS = $(PXT_HEADERS) package.json Makefile Makefile.inc

all: codal-core/.git $(EXE)

codal-core/.git:
	git clone -b streamracefix-v0 https://github.com/lancaster-university/codal-core.git

$(EXE): $(PXT_OBJS)
	$(LD) -o $(EXE) $(LDFLAGS) -Wl,-Map,$(EXE:.elf=.map) $(PXT_OBJS) $(LIBSTDCPP) $(LIBS) $(NPM_LIBS)
	cp $(EXE) $(EXE:.elf=.full)
	$(PREF)strip $(EXE)
	node -p 'require("fs").readFileSync("$(EXE)").toString("hex")' > $(HEX)
	@ls -l $(EXE)

clean:
	rm -rf bld

bld/%.o: %.cpp $(DEPS)
	@mkdir -p $(dir $@)
	$(CC) $(CXXFLAGS) -c $< -o $@

bld/%.o: %.s $(DEPS)
	@mkdir -p $(dir $@)
	$(CC) $(CFLAGS) -c $< -o $@

bld/%.o: %.c $(DEPS)
	@mkdir -p $(dir $@)
	$(CC) $(CFLAGS) -c $< -o $@
