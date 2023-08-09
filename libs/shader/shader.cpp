#include "pxt.h"

#define XX(v) (int)(((int16_t)(v)))
#define YY(v) (int)(((int16_t)(((int32_t)(v)) >> 16)))

namespace ShaderMethods {

void mapImage(Image_ toShade, Image_ shadeLevels, int x, int y, Buffer map) {
    if (x >= toShade->width() || y >= toShade->height())
        return;

    if (toShade->bpp() != 4 || shadeLevels->bpp() != 4 || map->length < 16 || map->length % 16 != 0)
        return;

    int maxShadeLevel = map->length >> 4;

    int x2 = x + shadeLevels->width() - 1;
    int y2 = y + shadeLevels->height() - 1;

    if (x2 < 0 || y2 < 0)
        return;

    int x0 = x;
    int y0 = y;

    toShade->clamp(&x2, &y2);
    toShade->clamp(&x, &y);
    int w = x2 - x + 1;
    int h = y2 - y + 1;

    toShade->makeWritable();

    auto mapData = map->data;

    auto toShadeByteHeight = toShade->byteHeight();
    uint8_t *toShadeAddr = toShade->pix(x, y);

    auto shadeLevelsByteHeight = shadeLevels->byteHeight();
    uint8_t *shadeLevelsAddr = shadeLevels->pix(x - x0, y - y0);

    while (w-- > 0) {
        auto ptr1 = toShadeAddr;
        auto ptr2 = shadeLevelsAddr;
        unsigned shift1 = y & 1;
        unsigned shift2 = (y - y0) & 1;
        uint8_t shadeLevel = 0;
        for (int i = 0; i < h; i++) {
            if (shift2) {
                shadeLevel = min(*ptr2 >> 4, maxShadeLevel);
                ptr2++;
                shift2 = 0;
            } else {
                shadeLevel = min(*ptr2 & 0x0f, maxShadeLevel);
                shift2 = 1;
            }

            if (shift1) {
                *ptr1 = (mapData[(*ptr1 >> 4) + (shadeLevel << 4)] << 4) | (*ptr1 & 0x0f);
                ptr1++;
                shift1 = 0;
            } else {
                *ptr1 = (mapData[(*ptr1 & 0xf) + (shadeLevel << 4)] & 0xf) | (*ptr1 & 0xf0);
                shift1 = 1;
            }
        }
        toShadeAddr += toShadeByteHeight;
        shadeLevelsAddr += shadeLevelsByteHeight;
    }
}

void mergeImage(Image_ dst, Image_ src, int x, int y) {
    if (x >= dst->width() || y >= dst->height())
        return;

    if (dst->bpp() != 4 || src->bpp() != 4)
        return;

    int x2 = x + src->width() - 1;
    int y2 = y + src->height() - 1;

    if (x2 < 0 || y2 < 0)
        return;

    int x0 = x;
    int y0 = y;

    dst->clamp(&x2, &y2);
    dst->clamp(&x, &y);
    int w = x2 - x + 1;
    int h = y2 - y + 1;

    dst->makeWritable();

    auto dstByteHeight = dst->byteHeight();
    uint8_t *dstAddr = dst->pix(x, y);

    auto srcByteHeight = src->byteHeight();
    uint8_t *srcAddr = src->pix(x - x0, y - y0);

    while (w-- > 0) {
        auto ptr1 = dstAddr;
        auto ptr2 = srcAddr;
        unsigned shift1 = y & 1;
        unsigned shift2 = (y - y0) & 1;
        int srcValue = 0;
        for (int i = 0; i < h; i++) {
            if (shift2) {
                srcValue = *ptr2 >> 4;
                ptr2++;
                shift2 = 0;
            } else {
                srcValue = *ptr2 & 0x0f;
                shift2 = 1;
            }

            if (shift1) {
                *ptr1 = (min(*ptr1 >> 4, srcValue) << 4) | (*ptr1 & 0x0f);
                ptr1++;
                shift1 = 0;
            } else {
                *ptr1 = (min(*ptr1 & 0xf, srcValue) & 0xf) | (*ptr1 & 0xf0);
                shift1 = 1;
            }
        }
        dstAddr += dstByteHeight;
        srcAddr += srcByteHeight;
    }
}

//%
void _mapImage(Image_ toShade, Image_ shadeLevels, int xy, Buffer c) {
    mapImage(toShade, shadeLevels, XX(xy), YY(xy), c);
}

//%
void _mergeImage(Image_ toShade, Image_ shadeLevels, int xy) {
    mergeImage(toShade, shadeLevels, XX(xy), YY(xy));
}

}