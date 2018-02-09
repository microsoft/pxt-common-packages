//#include "pxt.h"

#define ROW_SZ(width) ((width * IMAGE_BITS + 7) / 8)

namespace image {
    /**
     * Create new empty (transparent) image
     */
    //%
    Image *create(int width, int height)
    {
        if (width < 0 || height < 0 || width > 2000 || height > 2000)
            return NULL;
        uint32_t sz = ROW_SZ(width) * height;
        Image r = new (::operator new(sizeof(BoxedString) + sz)) BoxedImage();
        r->width = width;
        r->height = height;
        memset(r->data, 0, sz);
        MEMDBG("mkImage: %d X %d => %p", width, height, r);
        return r;    
    }

    /**
     * Create new image from F1 or F4 buffer
     */
    //%
    Image *ofBuffer(Buffer buf)
    {
        if (!buf)
            return NULL ;

        auto src = buf->data;
        if (buf->length < 3)
            return NULL;        
        bool isMono = src[0] == 0xf1;
        if (!isMono && src[0] != 0xf4)
            return NULL;
        

        const w = src[1]
        const h = ((src.length - 2) / ((w + 1) >> 1)) | 0
        if (w == 0 || h == 0)
            return null
        const r = new Image(w, h)
        const dst = r.data

        let dstP = 0
        let srcP = 2

        for (let i = 0; i < h; ++i) {
            for (let j = 0; j < w >> 1; ++j) {
                const v = src[srcP++]
                dst[dstP++] = v >> 4
                dst[dstP++] = v & 0xf
            }
            if (w & 1)
                dst[dstP++] = src[srcP++] >> 4
        }

        return r

    }
}

namespace ImageMethods {

}