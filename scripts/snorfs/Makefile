STORAGE_PATH = ../../libs/storage---raffs
INC = -I. -I$(STORAGE_PATH)
all:
	g++ $(INC) -DSNORFS_TEST=1 -include SNORFS-test.h -g -W -Wall -std=c++11 -o stest \
		SNORFS-test.cpp $(STORAGE_PATH)/SNORFS.cpp -ferror-limit=5
	./stest
