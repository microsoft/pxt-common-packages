#ifndef DEVICE_GHOSTSNORFS_H
#define DEVICE_GHOSTSNORFS_H

#include "GhostFAT.h"
#include "SNORFS.h"

namespace codal
{
    
class GhostSNORFS : public GhostFAT
{
protected:
    snorfs::FS &fs;
    snorfs::File *currFile;
    GFATEntry *currEntry;

    static void readFlash(GFATEntry *ent, unsigned blockAddr, char *dst);
    static void readFile(GFATEntry *ent, unsigned blockAddr, char *dst);

public:
    GhostSNORFS(snorfs::FS &fs);
    virtual void addFiles();
};

}

#endif

