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

__attribute__((optimize("-O3"))) void drawInterpolatedQuad(const V2 &p0, const V2 &p1, const V2 &p2,
                                                           const V2 &p3, Image_ dst, Image_ tex) {
    const int texW = tex->width();
    const int texH = tex->height();
    const int texWfx = fxInit(texW);
    const int texHfx = fxInit(texH);

    const int minX = min4(p0.x, p1.x, p2.x, p3.x);
    const int minY = min4(p0.y, p1.y, p2.y, p3.y);
    const int maxX = max4(p0.x, p1.x, p2.x, p3.x);
    const int maxY = max4(p0.y, p1.y, p2.y, p3.y);

    const int dstWfx = fxInit(dst->width());
    const int dstHfx = fxInit(dst->height());

    const int left = clamp(minX, 0, dstWfx);
    const int right = clamp(maxX, 0, dstWfx);
    const int top = clamp(minY, 0, dstHfx);
    const int bottom = clamp(maxY, 0, dstHfx);

    const int area0 = edge(p0, p3, p2.x, p2.y);
    const int area1 = edge(p2, p1, p0.x, p0.y);
    const int invArea0 = area0 ? fxDiv(FX_ONE, area0) : 0;
    const int invArea1 = area1 ? fxDiv(FX_ONE, area1) : 0;

    for (int py = top; py < bottom; py += FX_ONE) {
        for (int px = left; px < right; px += FX_ONE) {
            int u, v;
            if (isInsideTriangle(px, py, p0, p3, p2)) {
                int w1 = fxMul(edge(p2, p0, px, py), invArea0);
                int w2 = fxMul(edge(p0, p3, px, py), invArea0);
                u = w2;
                v = w1 + w2;
            } else if (isInsideTriangle(px, py, p2, p1, p0)) {
                int w0 = fxMul(edge(p1, p0, px, py), invArea1);
                int w1 = fxMul(edge(p0, p2, px, py), invArea1);
                u = w0 + w1;
                v = w0;
            } else {
                continue;
            }

            const int texX = fxToInt(fxMul(u, texWfx));
            const int texY = fxToInt(fxMul(v, texHfx));
            const int color = ImageMethods::getPixel(tex, texX, texY);
            if (color)
                ImageMethods::setPixel(dst, fxToInt(px), fxToInt(py), color);
        }
    }
}

//%
void _drawTexturedQuad(Image_ dst, Image_ tex, pxt::RefCollection *args) {
    V2 p0 = {fxInit(pxt::toInt(args->getAt(0))), fxInit(pxt::toInt(args->getAt(1)))};
    V2 p1 = {fxInit(pxt::toInt(args->getAt(4))), fxInit(pxt::toInt(args->getAt(5)))};
    V2 p2 = {fxInit(pxt::toInt(args->getAt(8))), fxInit(pxt::toInt(args->getAt(9)))};
    V2 p3 = {fxInit(pxt::toInt(args->getAt(12))), fxInit(pxt::toInt(args->getAt(13)))};

    drawInterpolatedQuad(p0, p1, p2, p3, dst, tex);
}

} // namespace gpu
