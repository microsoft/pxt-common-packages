INC = -I. -I../../libs/storage -I../inc/drivers -I../inc/driver-models
all:
	g++ $(INC) -DSNORFS_TEST=1 -include SNORFS-test.h -g -W -Wall -std=c++11 -o stest SNORFS-test.cpp ../../libs/storage/SNORFS.cpp
	./stest
