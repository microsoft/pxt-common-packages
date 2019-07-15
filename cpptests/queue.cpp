#include <stdint.h>
#include <stdio.h>
#include <string.h>
#include <stdlib.h>

#define LOG_QUEUE_SIZE 256

class LogQueue {
    void writeCore(const char *buf, int len);
  public:
    int ptr;
    char buffer[LOG_QUEUE_SIZE];
    int rdPtr;
    int numWrap;
    LogQueue();
    int write(const char *buf, int len);
    int read(char *buf, int len);
};

LogQueue::LogQueue() {
    ptr = 0;
    rdPtr = 0;
    numWrap = 0;
    memset(buffer, 0, sizeof(buffer));
}

void LogQueue::writeCore(const char *buf, int len) {
    memcpy(buffer + ptr, buf, len);
    // did we pass it?
    if (ptr < rdPtr && rdPtr <= ptr + len)
        rdPtr = -1;
    ptr += len;
}

int LogQueue::read(char *buf, int len) {
    if (rdPtr < 0) {
        if (numWrap == 0) {
            rdPtr = 0;
        } else {
            rdPtr = ptr + 1;
        }
    }

    if (rdPtr <= ptr) {
        int av = ptr - rdPtr;
        if (len > av)
            len = av;
        memcpy(buf, buffer + rdPtr, len);
        rdPtr += len;
    } else {
        int latter = sizeof(buffer) - rdPtr;

        if (latter >= len) {
            memcpy(buf, buffer + rdPtr, len);
            rdPtr += len;
        } else {
            memcpy(buf, buffer + rdPtr, latter);
            buf += latter;
            int len2 = len - latter;
            if (len2 > ptr)
                len2 = ptr;
            memcpy(buf, buffer, len2);
            rdPtr = len2;
            len = latter + len2;
        }
    }

    if (rdPtr >= (int)sizeof(buffer))
        rdPtr = 0;

    return len;
}

int LogQueue::write(const char *buf, int len) {
    if (len > (int)sizeof(buffer) / 2)
        return -1;

    int left = sizeof(buffer) - ptr;

    if (left < len + 1) {
        writeCore(buf, left);
        buf += left;
        len -= left;
        ptr = 0;
        numWrap++;
        if (rdPtr == 0)
            rdPtr = -1;
    }

    writeCore(buf, len);
    buffer[ptr] = 0;

    // printf("write %d -> ptr=%d rd=%d\n", len, ptr, rdPtr);

    return 0;
}

static uint32_t getrand(int max) {
    // see https://en.wikipedia.org/wiki/Xorshift
    static uint32_t x = 0xf01ba80;
    x ^= x << 13;
    x ^= x >> 17;
    x ^= x << 5;
    return x % max;
}

void testQ() {
    LogQueue *q = new LogQueue();
    char cache[10 * LOG_QUEUE_SIZE];
    char buf[LOG_QUEUE_SIZE];

    for (int i = 0; i < 1000000; ++i) {
        int wrSize = 0;
        int numWr = getrand(LOG_QUEUE_SIZE / 3);

        for (int j = 0; j < numWr; ++j) {
            int sz = getrand(10) + 1;
            if (wrSize + sz > (int)sizeof(cache) - 10)
                break;
            for (int k = 0; k < sz; ++k)
                cache[wrSize + k] = getrand(32) + 'a';
            q->write(cache + wrSize, sz);
            wrSize += sz;
        }

        int off = wrSize - (LOG_QUEUE_SIZE - 1);
        if (off < 0) {
            off = 0;
        } else {
            wrSize -= off;
        }

        // printf("test %d + %d p=%d rdPtr=%d\n", wrSize, off, q->ptr, q->rdPtr);

        int n = 0;
        if (getrand(2) == 0) {
            n = q->read(buf, LOG_QUEUE_SIZE);
        } else {
            for (;;) {
                int k = q->read(buf + n, getrand(10) + 1);
                n += k;
                if(!k) break;
            }
        }

       if (n != wrSize) {
                printf("size %d != %d", n, wrSize);
                exit(1);
            }
     
        for (int j = 0; j < wrSize; ++j)
            if (cache[off + j] != buf[j]) {
                printf("at %d %d != %d", j, cache[off + j], buf[j]);
                exit(1);
            }
    }
}


int main() {
    testQ();
    printf("OK\n");
}