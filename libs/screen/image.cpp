#include "pxt.h"

#define ROW_SZ(width) ((width * IMAGE_BITS + 7) / 8)

#if IMAGE_BITS == 1
#define IMAGE_TAG 0xf1
#elif IMAGE_BITS == 4
#define IMAGE_TAG 0xf4
#else
#error "Invalid IMAGE_BITS"
#endif

namespace image {
/**
 * Create new empty (transparent) image
 */
//%
Image create(int width, int height) {
    if (width < 0 || height < 0 || width > 255 || height > 2000)
        return NULL;
    uint32_t sz = 2 + ROW_SZ(width) * height;
    Image r = new (::operator new(sizeof(BoxedImage) + sz)) BoxedImage();
    r->length = sz;
    r->data[0] = IMAGE_TAG;
    r->data[1] = width;
    memset(r->data + 2, 0, sz - 2);
    MEMDBG("mkImage: %d X %d => %p", width, height, r);
    return r;
}

/**
 * Create new image with given content
 */
//%
Image ofBuffer(Buffer buf) {
    if (!buf || buf->length < 3)
        return NULL;
    if (buf[0] != 0xf1 && buf[0] != IMAGE_TAG)
        return NULL;
    uint32_t sz = buf->length;
    Image r = new (::operator new(sizeof(BoxedImage) + sz)) BoxedImage();
    r->length = buf->length;
    memcpy(r->data, buf->data, sz);
    return r;
}


} // namespace image

namespace ImageMethods {}