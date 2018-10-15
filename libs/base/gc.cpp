#include "pxtbase.h"

#ifdef PXT_GC

namespace pxt {

static Segment gcRoots;

static void removePtr(TValue v)
{
    auto len = gcRoots.getLength();
    auto data = gcRoots.getData();
    for (unsigned i = 0; i < len; ++i) {
        if (data[i] == v) {
            if (i == len - 1) {
                gcRoots.pop();                
            } else {
                data[i] = gcRoots.pop();
            }
            return;
        }
    }
    oops(40);
}

void registerGC(TValue *root, int numwords) {
    if (!numwords)
        return;

    if (numwords > 1) {
        while (numwords-- > 0) {
            registerGC(root++, 1);
        }
        return;
    }

    gcRoots.push((TValue)((uint32_t)root | 1));
}

void unregisterGC(TValue *root, int numwords) {
    if (!numwords)
        return;
    if (numwords > 1) {
        while (numwords-- > 0) {
            unregisterGC(root++, 1);
        }
        return;
    }

    removePtr((TValue)((uint32_t)root | 1));
}

void registerGCPtr(TValue ptr)
{
    if(isReadOnly(ptr))
        return;
    gcRoots.push(ptr);
}

void unregisterGCPtr(TValue ptr) {
    if(isReadOnly(ptr))
        return;
    removePtr(ptr);
    
}

} // namespace pxt

#endif