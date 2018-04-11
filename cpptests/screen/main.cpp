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
} // namespace ImageMethods

void golden_drawTransparentImage(Image_ img, Image_ from, int x, int y) {
    for (int i = 0; i < ImageMethods::width(from); ++i)
        for (int j = 0; j < ImageMethods::height(from); ++j) {
            auto pix = ImageMethods::getPixel(from, i, j);
            if (pix)
                ImageMethods::setPixel(img, x + i, y + j, pix);
        }
}

Image_ randomImg(int w, int h) {
    auto screen = mkImage(w, h, IMAGE_BITS);
    auto ptr = screen->pix();
    for (int i = 0; i < screen->pixLength(); ++i)
        *ptr++ = rand();
    return screen;
}

void assertSame(Image_ a, Image_ b) {
    if (!a || !b) {
        printf("Image null\n");
        abort();
    }

    auto aw = a->width();
    auto bw = b->width();
    auto ah = a->height();
    auto bh = b->height();

    if (aw != bw || ah != bh) {
        printf("Invalid sizes: %dx%d vs %dx%d\n", aw, ah, bw, bh);
        abort();
    }

    for (int i = 0; i < aw; ++i)
        for (int j = 0; j < ah; ++j) {
            auto ap = ImageMethods::getPixel(a, i, j);
            auto bp = ImageMethods::getPixel(b, i, j);
            if (ap != bp) {
                printf("Pixel mismatch at %d,%d: %d vs %d\n", i, j, ap, bp);
                abort();
            }
        }
}

int rr(int min, int max) {
    return rand() % (max - min) + min;
}

extern "C" int main() {
    auto s1 = randomImg(160, 128);
    auto s2 = ImageMethods::clone(s1);
    assertSame(s1, s2);
    auto sprite = randomImg(16, 16);
    //ImageMethods::fill(sprite, 4);

    for (int i = 0; i < 100; ++i) {
        auto x = rr(-30, 200);
        auto y = rr(-30, 200);
        printf("%d,%d\n", x, y);
        ImageMethods::drawTransparentImage(s1, sprite, x, y);
        golden_drawTransparentImage(s2, sprite, x, y);
        assertSame(s1, s2);
    }

    printf("OK\n");
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

extern "C" void target_panic(int code) {
    DMESG("PANIC %d", code);
    exit(1);
}