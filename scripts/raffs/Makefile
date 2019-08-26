STORAGE_PATH = ../../libs/settings
DEFS = -DRAFFS_TEST=1 -DSAMD51
SFILE = $(STORAGE_PATH)/RAFFS.cpp

INC = -I. -I$(STORAGE_PATH)

all: build run

build:
	g++ $(INC) $(DEFS) -include raffs-test.h -g -W -Wall -std=c++11 -o stest \
		raffs-test.cpp $(SFILE) -ferror-limit=5
run:
	./stest
