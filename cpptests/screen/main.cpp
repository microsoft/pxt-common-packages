#include "pxt.h"
#include <stdlib.h>

namespace ImageMethods {
    int width(Image_ img);
    int height(Image_ img);
    bool isMono(Image_ img);
    void setPixel(Image_ img, int x, int y, int c);
    int getPixel(Image_ img, int x, int y);
    void fill(Image_ img, int c);
    void _fillRect(Image_ img, int xy, int wh, int c);
    Image_ clone(Image_ img);
    void flipX(Image_ img);
    void flipY(Image_ img);
    void scroll(Image_ img, int dx, int dy);
    Image_ doubledX(Image_ img);
    Image_ doubledY(Image_ img);
    void replace(Image_ img, int from, int to);
    Image_ doubled(Image_ img);
    void drawImage(Image_ img, Image_ from, int x, int y);
    void drawTransparentImage(Image_ img, Image_ from, int x, int y);
    bool overlapsWith(Image_ img, Image_ other, int x, int y);
    void _drawIcon(Image_ img, Buffer icon, int xy, int c);
    void _drawLine(Image_ img, int xy, int wh, int c);
}

void golden_drawTransparentImage(Image_ img, Image_ from, int x, int y)
{
    for (int i = 0; i < ImageMethods::width(from); ++i)
    for (int j = 0; j < ImageMethods::height(from); ++j) {
        auto pix = ImageMethods::getPixel(from,i,j);
        if (pix)
            ImageMethods::setPixel(img, x+i,y+j);
    }
}

extern "C" int main() {
    auto screen = mkImage(160, 128, IMAGE_BITS);
    printf("%d\n", ImageMethods::getPixel(screen, 10, 10));
    return 0;
}

void *operator new(size_t sz) {
    return malloc(sz);
}
void *operator new[](size_t sz) {
    return malloc(sz);
}
void operator delete(void *p) {
    free(p);
}

extern "C" void target_panic(int code){
    DMESG("PANIC %d", code);
    exit(1);
}