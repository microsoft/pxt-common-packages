#include "GhostSNORFS.h"

#include "CodalCompat.h"
#include "CodalDmesg.h"
#include "CodalDevice.h"

#define LOG DMESG

using namespace codal::snorfs;

namespace codal {


GhostSNORFS::GhostSNORFS(FS &fs) : fs(fs)
{
    currFile = NULL;
    currEntry = NULL;
}

void GhostSNORFS::readFlash(GFATEntry *ent, unsigned blockAddr, char *dst)
{
    auto th = (GhostSNORFS*)ent->userdata;
    th->fs.readFlashBytes(blockAddr * 512, dst, 512);
}

void GhostSNORFS::readFile(GFATEntry *ent, unsigned blockAddr, char *dst)
{
    auto th = (GhostSNORFS*)ent->userdata;

    if (th->currEntry != ent)
    {
        th->currEntry = ent;
        if (th->currFile)
            delete th->currFile;
        th->currFile = th->fs.open(ent->filename);
    }

    th->currFile->seek(blockAddr * 512);
    th->currFile->read(dst, 512);
}


void GhostSNORFS::addFiles()
{
    // reading SPI directory can take some time, so we delay USB start
    CodalUSB::usbInstance->delayStart();

    GhostFAT::addFiles();

    addFile(readFlash, this, "spiflash.bin", fs.rawSize());
    addDirectory(20, "SPIFLASH");

    fs.dirRewind();
    auto d = fs.dirRead();
    while (d)
    {
        addFile(readFile, this, d->name, d->size, 20);
        d = fs.dirRead();
    }

    CodalUSB::usbInstance->start();
}

}
