include Makefile.inc

PDX_NAME = pxt.pdx

SCHED = playdate-scheduler
SDK = $(SCHED)/C_API

CPU_OPTIONS = -mthumb -mcpu=cortex-m7 -mfloat-abi=hard -mfpu=fpv4-sp-d16 -D__FPU_USED=1
DEFINES = \
  -DLIGHTWEIGHT_EVENTS=1 \
  -DDEVICE_DMESG_BUFFER_SIZE=4096 \
  -DDEVICE_DAL_VERSION='"playdate"' \
  -DTARGET_PLAYDATE=1 \
  -DTARGET_EXTENSION=1 \
  -DPD=1 
COMMON_FLAGS = -W -Wall -Wno-unused-parameter -Wno-cast-function-type -Ipxtapp \
	-I$(SCHED) -Ipxtapp -I. -I$(SDK) -fwrapv \
	-g $(CPU_OPTIONS) -O2 \
	-falign-functions=16 -fomit-frame-pointer -gdwarf-2 -Wno-unused \
	-Wno-unknown-pragmas -fverbose-asm -ffunction-sections -fdata-sections \
	$(DEFINES) $(NPM_INCLUDES)
LIBS = 
CFLAGS = $(COMMON_FLAGS) -Wstrict-prototypes
CXXFLAGS = $(COMMON_FLAGS) -std=c++11 -fno-rtti -fno-exceptions -fno-unwind-tables -fno-threadsafe-statics 
LDFLAGS = -Wl,--gc-sections,--cref,--no-warn-mismatch -g -T$(SDK)/buildsupport/link_map.ld $(CPU_OPTIONS)
PREF = arm-none-eabi-
CC = $(PREF)gcc
LD = $(PREF)gcc
LIBSTDCPP = 
NPM_LIBS = $(wildcard node_modules/*/lib/*.a)
NPM_INCLUDES = $(addprefix -I, $(wildcard node_modules/*/include))

SCHED_C_SRC = $(wildcard $(SCHED)/*.c)
SCHED_CPP_SRC = $(wildcard $(SCHED)/*.cpp)
PXT_OBJS += bld/$(SCHED)/CortexContextSwitch.o
PXT_OBJS += $(addprefix bld/,$(SCHED_C_SRC:.c=.o))
PXT_OBJS += $(addprefix bld/,$(SCHED_CPP_SRC:.cpp=.o))
PXT_OBJS += bld/setup.o

EXE = bld/pxt-app.elf
HEX = $(EXE:.elf=.hex)
BIN = $(EXE:.elf=.bin)

DEPS = $(PXT_HEADERS) package.json Makefile Makefile.inc $(wildcard $(SCHED)/*.h)

all: pdx

$(EXE): $(PXT_OBJS)
	$(LD) -o $(EXE) $(LDFLAGS) -Wl,-Map,$(EXE:.elf=.map) $(PXT_OBJS) $(LIBSTDCPP) $(LIBS) $(NPM_LIBS)
	$(PREF)objcopy  --set-section-flags .bss=alloc,load,contents -O binary $(EXE) $(BIN)
	node -p 'require("fs").readFileSync("$(BIN)").toString("hex")' > $(HEX)
	@ls -l $(BIN)

pdx: $(EXE)
	rm -rf $(PDX_NAME)
	mkdir -p $(PDX_NAME)
	cp $(BIN) $(PDX_NAME)/pdex.bin
	cp $(SCHED)/pdxinfo $(PDX_NAME)

PD_SERIAL = $(wildcard /dev/cu.usbmodem00000*1)
deploy: all
ifneq ($(PD_SERIAL),)
	echo datadisk > $(PD_SERIAL)
	sleep 3
endif
	cp -r $(PDX_NAME) /Volumes/PLAYDATE/Games
	diskutil eject /Volumes/PLAYDATE

r: deploy

clean:
	rm -rf bld

bld/setup.o: $(SDK)/buildsupport/setup.c
	@mkdir -p $(dir $@)
	$(CC) $(CFLAGS) -c $< -o $@

bld/%.o: %.cpp $(DEPS)
	@mkdir -p $(dir $@)
	$(CC) $(CXXFLAGS) -c $< -o $@

bld/%.o: %.s $(DEPS)
	@mkdir -p $(dir $@)
	$(CC) $(CFLAGS) -c $< -o $@

bld/%.o: %.c $(DEPS)
	@mkdir -p $(dir $@)
	$(CC) $(CFLAGS) -c $< -o $@
