RAFFS = 1

ifeq ($(RAFFS),1)
STORAGE_PATH = ../../libs/storage---raffs
DEFS = -DRAFFS_TEST=1 -DSAMD51
SFILE = $(STORAGE_PATH)/RAFFS.cpp
else
STORAGE_PATH = ../../libs/storage---snorfs
DEFS = -DSNORFS_TEST=1
SFILE = $(STORAGE_PATH)/SNORFS.cpp
endif

INC = -I. -I$(STORAGE_PATH)

all: build run

build:
	g++ $(INC) $(DEFS) -include SNORFS-test.h -g -W -Wall -std=c++11 -o stest \
		SNORFS-test.cpp $(SFILE) -ferror-limit=5
run:
	./stest
