#include "pxt.h"

/**
 * Quad layout (wound clockwise)
 * (i:0,uv:0,0) (i:1,uv:1,0)
 *   +------------+
 *   |\__         |
 *   |   \__      |
 *   |      \__   |
 *   |         \__|
 *   +------------+
 * (i:3,uv:0,1) (i:2,uv:1,1)
 */

namespace ImageMethods {
void setPixel(Image_ img, int x, int y, int c);
int getPixel(Image_ img, int x, int y);
} // namespace ImageMethods

namespace gpu {

const int FX_SHIFT = 16;
const int FX_ONE = 1 << FX_SHIFT;
const int FX_HALF = FX_ONE >> 1;

struct V2 {
    int x, y;
    V2() : x(0), y(0) {}
    V2(int x, int y) : x(x), y(y) {}
};

struct Vertex {
    V2 pos, uv;
};

inline int fxMul(int a, int b) {
    return (int)(((int64_t)a * b) >> FX_SHIFT);
}

inline int fxDiv(int a, int b) {
    return (int)(((int64_t)a << FX_SHIFT) / b);
}

inline int fxInit(int v) {
    return v << FX_SHIFT;
}

inline int fxToInt(int v) {
    return v >> FX_SHIFT;
}

inline int wrapFx(int v) {
    int r = v % FX_ONE;
    if (r < 0)
        r += FX_ONE;
    return r;
}

inline int min(int a, int b) {
    return a < b ? a : b;
}

inline int max(int a, int b) {
    return a > b ? a : b;
}

inline int min4(int a, int b, int c, int d) {
    return min(min(min(a, b), c), d);
}

inline int max4(int a, int b, int c, int d) {
    return max(max(max(a, b), c), d);
}

inline int clamp(int v, int a, int b) {
    return min(max(v, a), b);
}

inline __attribute__((always_inline)) int edge(const V2 &a, const V2 &b, int px, int py) {
    return fxMul(b.y - a.y, px - a.x) - fxMul(b.x - a.x, py - a.y);
}

inline __attribute__((always_inline)) bool isTopLeft(const V2 &a, const V2 &b) {
    return a.y < b.y || (a.y == b.y && a.x < b.x);
}

inline __attribute__((always_inline)) bool isInsideTriangle(int px, int py, const V2 &a,
                                                            const V2 &b, const V2 &c) {
    const int e0 = edge(a, b, px, py);
    const int e1 = edge(b, c, px, py);
    const int e2 = edge(c, a, px, py);
    return ((e0 > 0 || (e0 == 0 && isTopLeft(b, c))) && (e1 > 0 || (e1 == 0 && isTopLeft(c, a))) &&
            (e2 > 0 || (e2 == 0 && isTopLeft(a, b))));
}

inline __attribute__((always_inline)) void interpolateUV(int px, int py, const V2 &a, const V2 &b,
                                                         const V2 &c, const V2 &ua, const V2 &ub,
                                                         const V2 &uc, int invArea, int &outU,
                                                         int &outV) {
    const int w0 = fxMul(edge(b, c, px, py), invArea);
    const int w1 = fxMul(edge(c, a, px, py), invArea);
    const int w2 = fxMul(edge(a, b, px, py), invArea);
    outU = fxMul(ua.x, w0) + fxMul(ub.x, w1) + fxMul(uc.x, w2);
    outV = fxMul(ua.y, w0) + fxMul(ub.y, w1) + fxMul(uc.y, w2);
}

__attribute__((optimize("-O3"))) void drawInterpolatedQuad(const Vertex &v0, const Vertex &v1,
                                                           const Vertex &v2, const Vertex &v3,
                                                           Image_ dst, Image_ tex) {
    const V2 &p0 = v0.pos, &p1 = v1.pos, &p2 = v2.pos, &p3 = v3.pos;
    const V2 &uv0 = v0.uv, &uv1 = v1.uv, &uv2 = v2.uv, &uv3 = v3.uv;

    const int texW = tex->width();
    const int texH = tex->height();
    const int texWfx = fxInit(texW);
    const int texHfx = fxInit(texH);

    const int minX = min4(p0.x, p1.x, p2.x, p3.x);
    const int minY = min4(p0.y, p1.y, p2.y, p3.y);
    const int maxX = max4(p0.x, p1.x, p2.x, p3.x);
    const int maxY = max4(p0.y, p1.y, p2.y, p3.y);
    const int areaA = edge(p0, p3, p2.x, p2.y);
    const int invAreaA = areaA ? fxDiv(FX_ONE, areaA) : 0;
    const int areaB = edge(p2, p1, p0.x, p0.y);
    const int invAreaB = areaB ? fxDiv(FX_ONE, areaB) : 0;

    const int dstWfx = fxInit(dst->width());
    const int dstHfx = fxInit(dst->height());

    const int left = clamp(minX, 0, dstWfx);
    const int right = clamp(maxX, 0, dstWfx);
    const int top = clamp(minY, 0, dstHfx);
    const int bottom = clamp(maxY, 0, dstHfx);

    for (int py = top; py < bottom; py += FX_ONE) {
        for (int px = left; px < right; px += FX_ONE) {
            int u = 0, v = 0;
            if (invAreaA && isInsideTriangle(px, py, p0, p3, p2)) {
                interpolateUV(px, py, p0, p3, p2, uv0, uv3, uv2, invAreaA, u, v);
            } else if (invAreaB && isInsideTriangle(px, py, p2, p1, p0)) {
                interpolateUV(px, py, p2, p1, p0, uv2, uv1, uv0, invAreaB, u, v);
            } else {
                continue;
            }
            const int texX = fxToInt(fxMul(wrapFx(u), texWfx));
            const int texY = fxToInt(fxMul(wrapFx(v), texHfx));
            const int color = ImageMethods::getPixel(tex, texX, texY);
            if (color)
                ImageMethods::setPixel(dst, fxToInt(px), fxToInt(py), color);
        }
    }
}

//%
void _drawTexturedQuad(Image_ dst, Image_ tex, pxt::RefCollection *args) {
    Vertex v0, v1, v2, v3;
    v0.pos = {fxInit(pxt::toInt(args->getAt(0))), fxInit(pxt::toInt(args->getAt(1)))};
    v0.uv = {fxInit(pxt::toInt(args->getAt(2))), fxInit(pxt::toInt(args->getAt(3)))};

    v1.pos = {fxInit(pxt::toInt(args->getAt(4))), fxInit(pxt::toInt(args->getAt(5)))};
    v1.uv = {fxInit(pxt::toInt(args->getAt(6))), fxInit(pxt::toInt(args->getAt(7)))};

    v2.pos = {fxInit(pxt::toInt(args->getAt(8))), fxInit(pxt::toInt(args->getAt(9)))};
    v2.uv = {fxInit(pxt::toInt(args->getAt(10))), fxInit(pxt::toInt(args->getAt(11)))};

    v3.pos = {fxInit(pxt::toInt(args->getAt(12))), fxInit(pxt::toInt(args->getAt(13)))};
    v3.uv = {fxInit(pxt::toInt(args->getAt(14))), fxInit(pxt::toInt(args->getAt(15)))};

    drawInterpolatedQuad(v0, v1, v2, v3, dst, tex);
}

} // namespace gpu
