#include "pxt.h"

namespace ImageMethods {
void setPixel(Image_ img, int x, int y, int c);
int getPixel(Image_ img, int x, int y);
} // namespace ImageMethods

namespace gpu {

struct Vec2 {
    int x, y;
    Vec2(int x = 0, int y = 0) : x(x), y(y) {}
};

struct Vertex {
    Vec2 pos, uv;
};

struct Bounds {
    int left, top, right, bottom;
};

constexpr int fxOne = 1 << 8;
constexpr int fxZero = 0;
constexpr int fxHalf = fxOne >> 1;

static inline int fxMul(int a, int b) {
    return (a * b) >> 8;
}
static inline int fxDiv(int a, int b) {
    return (a << 8) / b;
}
static inline int fxToInt(int v) {
    return v >> 8;
}
static inline int fxFromFloat(int v) {
    return v << 8;
}
static inline int fxWrap(int v) {
    int r = v % fxOne;
    return (r < fxZero) ? (r + fxOne) : r;
}
static inline int min(int a, int b) {
    return a < b ? a : b;
}
static inline int max(int a, int b) {
    return a > b ? a : b;
}
static inline int clamp(int v, int lo, int hi) {
    return max(lo, min(v, hi));
}
static inline int min4(int a, int b, int c, int d) {
    return min(min(min(a, b), c), d);
}
static inline int max4(int a, int b, int c, int d) {
    return max(max(max(a, b), c), d);
}
static inline bool isTopLeft(const Vec2 &a, const Vec2 &b) {
    return (a.y < b.y) || (a.y == b.y && a.x < b.x);
}
static inline int edge(const Vec2 &a, const Vec2 &b, const Vec2 &c) {
    return fxMul(b.y - a.y, c.x - a.x) - fxMul(b.x - a.x, c.y - a.y);
}
static inline bool isInsideTriangle(int px, int py, const Vec2 &a, const Vec2 &b, const Vec2 &c) {
    int e0 = edge(a, b, {px, py});
    int e1 = edge(b, c, {px, py});
    int e2 = edge(c, a, {px, py});

    return (e0 > 0 || (e0 == 0 && isTopLeft(b, c))) && (e1 > 0 || (e1 == 0 && isTopLeft(c, a))) &&
           (e2 > 0 || (e2 == 0 && isTopLeft(a, b)));
}
static inline Vec2 interpolateUV(int px, int py, const Vec2 &a, const Vec2 &b, const Vec2 &c,
                                 const Vec2 &ua, const Vec2 &ub, const Vec2 &uc) {
    int area = edge(a, b, c);
    if (area == fxZero)
        return {fxZero, fxZero};

    int w0 = fxDiv(edge(b, c, {px, py}), area);
    int w1 = fxDiv(edge(c, a, {px, py}), area);
    int w2 = fxDiv(edge(a, b, {px, py}), area);

    return {fxMul(ua.x, w0) + fxMul(ub.x, w1) + fxMul(uc.x, w2),
            fxMul(ua.y, w0) + fxMul(ub.y, w1) + fxMul(uc.y, w2)};
}

static void drawInterpolatedQuad(const Vertex &v0, const Vertex &v1, const Vertex &v2,
                                 const Vertex &v3, Image_ dst, Image_ tex) {
    const Vec2 &p0 = v0.pos, &p1 = v1.pos, &p2 = v2.pos, &p3 = v3.pos;
    const Vec2 &uv0 = v0.uv, &uv1 = v1.uv, &uv2 = v2.uv, &uv3 = v3.uv;

    int dx1 = p1.x - p0.x, dy1 = p1.y - p0.y;
    int dx2 = p3.x - p0.x, dy2 = p3.y - p0.y;

    int denom = fxMul(dx1, dy2) - fxMul(dx2, dy1);
    if (denom == fxZero)
        return;

    int minX = min4(p0.x, p1.x, p2.x, p3.x);
    int minY = min4(p0.y, p1.y, p2.y, p3.y);
    int maxX = max4(p0.x, p1.x, p2.x, p3.x);
    int maxY = max4(p0.y, p1.y, p2.y, p3.y);

    int dstW = fxFromFloat(dst->width());
    int dstH = fxFromFloat(dst->height());

    Bounds pbounds = {clamp(minX, 0, dstW), clamp(minY, 0, dstH), clamp(maxX, 0, dstW),
                      clamp(maxY, 0, dstH)};

    Vec2 p;
    for (p.y = pbounds.top; p.y < pbounds.bottom; p.y += fxOne) {
        for (p.x = pbounds.left; p.x < pbounds.right; p.x += fxOne) {
            int sampleX = p.x + fxHalf;
            int sampleY = p.y + fxHalf;

            if (isInsideTriangle(sampleX, sampleY, p0, p3, p2)) {
                // First triangle: (p0, p3, p2)
                Vec2 uv = interpolateUV(sampleX, sampleY, p0, p3, p2, uv0, uv3, uv2);
                int u = fxWrap(uv.x);
                int v = fxWrap(uv.y);

                int x = fxToInt(fxMul(u, fxFromFloat(tex->width())));
                int y = fxToInt(fxMul(v, fxFromFloat(tex->height())));
                int color = ImageMethods::getPixel(tex, x, y);

                if (color)
                    ImageMethods::setPixel(dst, fxToInt(p.x), fxToInt(p.y), color);
            } else if (isInsideTriangle(sampleX, sampleY, p2, p1, p0)) {
                // Second triangle: (p2, p1, p0)
                Vec2 uv = interpolateUV(sampleX, sampleY, p2, p1, p0, uv2, uv1, uv0);
                int u = fxWrap(uv.x);
                int v = fxWrap(uv.y);

                int x = fxToInt(fxMul(u, fxFromFloat(tex->width())));
                int y = fxToInt(fxMul(v, fxFromFloat(tex->height())));
                int color = ImageMethods::getPixel(tex, x, y);

                if (color)
                    ImageMethods::setPixel(dst, fxToInt(p.x), fxToInt(p.y), color);
            }
        }
    }
}

void _drawTexturedQuad(Image_ dst, Image_ tex, pxt::RefCollection *args) {
    Vertex v0 = {{fxFromFloat(args->getAt(0)), fxFromFloat(args->getAt(1))},
                 {fxFromFloat(args->getAt(2)), fxFromFloat(args->getAt(3))}};
    Vertex v1 = {{fxFromFloat(args->getAt(4)), fxFromFloat(args->getAt(5))},
                 {fxFromFloat(args->getAt(6)), fxFromFloat(args->getAt(7))}};
    Vertex v2 = {{fxFromFloat(args->getAt(8)), fxFromFloat(args->getAt(9))},
                 {fxFromFloat(args->getAt(10)), fxFromFloat(args->getAt(11))}};
    Vertex v3 = {{fxFromFloat(args->getAt(12)), fxFromFloat(args->getAt(13))},
                 {fxFromFloat(args->getAt(14)), fxFromFloat(args->getAt(15))}};

    drawInterpolatedQuad(v0, v1, v2, v3, dst, tex);
}

} // namespace gpu
