#include "pxt.h"

namespace ImageMethods {
void setPixel(Image_ img, int x, int y, int c);
int getPixel(Image_ img, int x, int y);
} // namespace ImageMethods

namespace gpu {

// Triangle indices. Triangles are wound counterclockwise.
static const int TRI0_INDICES[] = {0, 3, 2};
static const int TRI1_INDICES[] = {2, 1, 0};

struct Vec2 {
    Vec2(int x = 0, int y = 0) : x(x), y(y) {}
    void set(int x, int y) {
        this->x = x;
        this->y = y;
    }
    int x, y;
};

struct Vec3 {
    Vec3(int x = 0, int y = 0, int z = 0) : x(x), y(y), z(z) {}
    int x, y, z;
};

struct Vertex {
    Vec2 pos, uv;
};

#define GPU_FIXED_POINT

static inline int initFx(int v) {
#ifndef GPU_FIXED_POINT
    // Convert to int
    return (v + 128) >> 8;
#else
    // Already an int
    return v;
#endif
}

static inline int fx8FromInt(int v) {
#ifndef GPU_FIXED_POINT
    // Keep as int
    return v;
#else
    // Convert to fixed
    return (int)(v * 256);
#endif
}

static inline int fx8FromFloat(float v) {
#ifndef GPU_FIXED_POINT
    // Keep as int
    return (int)v;
#else
    // Convert to fixed
    return (int)(v * 256.f);
#endif
}

static inline int fxToInt(int v) {
#ifndef GPU_FIXED_POINT
    // Already an int
    return v;
#else
    // Convert to int
    return (v + 128) >> 8;
#endif
}

static inline int fxMul(int a, int b) {
#ifndef GPU_FIXED_POINT
    return a * b;
#else
    return a * (b >> 8);
#endif
}

static inline int fxDiv(int a, int b) {
#ifndef GPU_FIXED_POINT
    return a / b;
#else
    return (a << 8) / b;
#endif
}

static inline int min(int a, int b) {
    return (a < b ? a : b);
}
static inline int max(int a, int b) {
    return (a > b ? a : b);
}
static inline int edge(const Vec2 &a, const Vec2 &b, const Vec2 &c) {
    return fxMul((c.x - a.x), (b.y - a.y)) - fxMul((c.y - a.y), (b.x - a.x));
}
static inline int clamp(int v, int a, int b) {
    return min(b, max(v, a));
}
static inline int min3(int a, int b, int c) {
    return min(min(a, b), c);
}
static inline int max3(int a, int b, int c) {
    return max(max(a, b), c);
}
static inline void scaleToRef(const Vec2 &v, int s, Vec2 &ref) {
    ref.x = fxMul(v.x, s);
    ref.y = fxMul(v.y, s);
}
static inline void add3ToRef(const Vec2 &a, const Vec2 &b, const Vec2 &c, Vec2 &ref) {
    ref.x = a.x + b.x + c.x;
    ref.y = a.y + b.y + c.y;
}
static inline void divToRef(const Vec2 &a, const Vec2 &b, Vec2 &ref) {
    ref.x = fxDiv(a.x, b.x);
    ref.y = fxDiv(a.y, b.y);
}

static int shadeTexturedPixel(const Vec2 &area, const Vertex *v0, const Vertex *v1,
                              const Vertex *v2, int w0, int w1, int w2, Image_ tex, int texWidth,
                              int texHeight) {
    Vec2 _uv0, _uv1, _uv2, _uv;
    // Calculate uv coords from given barycentric coords.
    // TODO: Support different texture wrapping modes.
    scaleToRef(v0->uv, w0, _uv0);
    scaleToRef(v1->uv, w1, _uv1);
    scaleToRef(v2->uv, w2, _uv2);
    add3ToRef(_uv0, _uv1, _uv2, _uv);
    divToRef(_uv, area, _uv);
    // Sample texture at uv coords.
    const int x = fxToInt(fxMul(_uv.x, texWidth));
    const int y = fxToInt(fxMul(_uv.y, texHeight));
    return ImageMethods::getPixel(tex, x, y);
}

const int fxZero = fx8FromInt(0);
const int fxOne = fx8FromInt(1);
const int fxOneHalf = fx8FromFloat(0.5);

static void drawTexturedTri(const Vertex *verts[], const int indices[], Image_ dst, Image_ tex) {
    const Vertex *v0 = verts[indices[0]];
    const Vertex *v1 = verts[indices[1]];
    const Vertex *v2 = verts[indices[2]];
    const Vec2 &p0 = v0->pos;
    const Vec2 &p1 = v1->pos;
    const Vec2 &p2 = v2->pos;

    const int a = edge(p0, p1, p2);
    if (a <= fxZero)
        return;
    Vec2 area(a, a);

    const int dstWidth = fx8FromInt(dst->width());
    const int dstHeight = fx8FromInt(dst->height());
    const int texWidth = fx8FromInt(tex->width());
    const int texHeight = fx8FromInt(tex->height());

    // Get clipped bounds of tri. 0.5 offset to ensure we're sampling pixel center.
    const int left   = fxOneHalf + clamp(min3(p0.x, p1.x, p2.x), 0, dstWidth);
    const int top    = fxOneHalf + clamp(min3(p0.y, p1.y, p2.y), 0, dstHeight);
    const int right  = fxOneHalf + clamp(max3(p0.x, p1.x, p2.x), 0, dstWidth);
    const int bottom = fxOneHalf + clamp(max3(p0.y, p1.y, p2.y), 0, dstHeight);

    Vec2 p(left, top);

    // Get the barycentric interpolants
    const int A01 = p1.y - p0.y;
    const int B01 = p0.x - p1.x;
    const int A12 = p2.y - p1.y;
    const int B12 = p1.x - p2.x;
    const int A20 = p0.y - p2.y;
    const int B20 = p2.x - p0.x;

    int w0_row = edge(p1, p2, p);
    int w1_row = edge(p2, p0, p);
    int w2_row = edge(p0, p1, p);

    // This is a simplistic implementation that doesn't attempt to filter pixels outside the triangle. This results
    // in a lot of per-pixel evaluations outside the triangle. We should do some prefiltering.
    for (; p.y <= bottom; p.y += fxOne) {
        int w0 = w0_row;
        int w1 = w1_row;
        int w2 = w2_row;
        for (p.x = left; p.x <= right; p.x += fxOne) {
            // Fixed point math produces a seam at some rotations when this check is performed, so until that issue
            // is resolved, let the test always pass. Consequence is some performance degradation.
            if (true || (w0 | w1 | w2) >= 0) {
                const int color =
                    shadeTexturedPixel(area, v0, v1, v2, w0, w1, w2, tex, texWidth, texHeight);
                if (color) {
                    ImageMethods::setPixel(dst, fxToInt(p.x), fxToInt(p.y), color);
                }
            }
            w0 += A12;
            w1 += A20;
            w2 += A01;
        }
        w0_row += B12;
        w1_row += B20;
        w2_row += B01;
    }
}

static void drawTexturedQuad(Image_ dst, Image_ tex, RefCollection *args) {
    Vertex v0, v1, v2, v3;
    const Vertex *verts[4] = {&v0, &v1, &v2, &v3};

    v0.pos.set(initFx(pxt::toInt(args->getAt(0))), initFx(pxt::toInt(args->getAt(1))));
    v1.pos.set(initFx(pxt::toInt(args->getAt(2))), initFx(pxt::toInt(args->getAt(3))));
    v2.pos.set(initFx(pxt::toInt(args->getAt(4))), initFx(pxt::toInt(args->getAt(5))));
    v3.pos.set(initFx(pxt::toInt(args->getAt(6))), initFx(pxt::toInt(args->getAt(7))));

    v0.uv.set(fxZero, fxZero);
    v1.uv.set(fxOne, fxZero);
    v2.uv.set(fxOne, fxOne);
    v3.uv.set(fxZero, fxOne);

    drawTexturedTri(verts, TRI0_INDICES, dst, tex);
    drawTexturedTri(verts, TRI1_INDICES, dst, tex);
}

//%
void _drawTexturedQuad(Image_ dst, Image_ tex, RefCollection *args) {
    drawTexturedQuad(dst, tex, args);
}
} // namespace gpu
