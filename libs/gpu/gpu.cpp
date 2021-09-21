#include "pxt.h"

namespace gpu {

// Triangle indices. Triangles are wound counterclockwise.
static const int TRI0_INDICES[] = {0, 3, 2};
static const int TRI1_INDICES[] = {2, 1, 0};

class Vec2 {
  public:
    Vec2(int x = 0, int y = 0) : x(x), y(y) {}
    void set(int x, int y) {
        this->x = x;
        this->y = y;
    }
    int x, y;
};

class Vec3 {
  public:
    Vec3(int x = 0, int y = 0, int z = 0) : x(x), y(y), z(z) {}
    int x, y, z;
};

class Vertex {
  public:
    Vec2 pos, uv;
};

static inline int min(int a, int b) {
    return (a < b ? a : b);
}
static inline int max(int a, int b) {
    return (a > b ? a : b);
}
static inline int edge(const Vec2 &a, const Vec2 &b, const Vec2 &c) {
    return (c.x - a.x) * (b.y - a.y) - (c.y - a.y) * (b.x - a.x);
}
static inline int clamp(int v, int a, int b) {
    return min(a, max(v, b));
}
static inline int min3(int a, int b, int c) {
    return min(min(a, b), c);
}
static inline int max3(int a, int b, int c) {
    return max(max(a, b), c);
}
static inline void scaleToRef(const Vec2 &v, int s, Vec2 &ref) {
    ref.x = v.x * s;
    ref.y = v.y * s;
}
static inline void add3ToRef(const Vec2 &a, const Vec2 &b, const Vec2 &c, Vec2 &ref) {
    ref.x = a.x + b.x + c.x;
    ref.y = a.y + b.y + c.y;
}
static inline void divToRef(const Vec2 &a, const Vec2 &b, Vec2 &ref) {
    ref.x = a.x / b.x;
    ref.y = a.y / b.y;
}
static inline bool barycentric(const Vec2 &p0, const Vec2 &p1, const Vec2 &p2, const Vec2 &p, Vec3 &out) {
    int w0 = edge(p1, p2, p);
    if (w0 < 0)
        return false;
    int w1 = edge(p2, p0, p);
    if (w1 < 0)
        return false;
    int w2 = edge(p0, p1, p);
    if (w2 < 0)
        return false;
    out.x = w0;
    out.y = w1;
    out.z = w2;
    // point is in triangle (or on an edge of it)
    return true;
}
static int shade(const Vec2 &area, const Vertex *V0, const Vertex *V1, const Vertex *V2,
                 const Vec3 &bary, Image_ tex) {
    Vec2 _uv0, _uv1, _uv2, _uv;
    // Calculate uv coords from given barycentric coords.
    // TODO: Support different texture wrapping modes.
    scaleToRef(V0->uv, bary.x, _uv0);
    scaleToRef(V1->uv, bary.y, _uv1);
    scaleToRef(V2->uv, bary.z, _uv2);
    add3ToRef(_uv0, _uv1, _uv2, _uv);
    divToRef(_uv, area, _uv);
    // Sample texture at uv coords.
    int x = floor(_uv.x * (tex->width() >> 8));
    int y = floor(_uv.y * (tex->height() >> 8));
    return ImageMethods::getPixel(tex, x << 8, y << 8);
}

static void drawTri(const Vertex *verts[], const int indices[], const Vec2 &area, Image_ dst,
                    Image_ tex) {
    const Vertex *V0 = verts[indices[0]];
    const Vertex *V1 = verts[indices[1]];
    const Vertex *V2 = verts[indices[2]];

    int left = clamp(min3(V0->pos.x, V1->pos.x, V2->pos.x), 0, dst->width());
    int top = clamp(min3(V0->pos.y, V1->pos.y, V2->pos.y), 0, dst->height());
    int right = clamp(max3(V0->pos.x, V1->pos.x, V2->pos.x), 0, dst->width());
    int bottom = clamp(max3(V0->pos.y, V1->pos.y, V2->pos.y), 0, dst->height());

    Vec2 p;
    Vec3 bary;

    // TODO: This is a simplistic implementation that doesn't attempt to filter pixels outside the
    // triangle. We should do some prefiltering. This can be done using a tiled rendering approach
    // for larger triangles.
    for (p.y = top; p.y < bottom; ++p.y) {
        for (p.x = left; p.x < right; ++p.x) {
            // TODO: This extremely expensive call to `barycentric` can be optimized out by
            // predetermining the gradients at setup and just adding them at each step. It's not as
            // precise, but at this small a screen resolution it should be unnoticable at even the
            // largest triangle size.
            // NOTE: This is already done in the ts implementation. Need to port that here.
            if (barycentric(V0->pos, V1->pos, V2->pos, p, bary)) {
                int color = shade(area, V0, V1, V2, bary, tex);
                if (color) {
                    ImageMethods::setPixel(dst, p.x, p.y, color);
                }
            }
        }
    }
}

static void drawQuad(Image_ dst, Image_ tex, RefCollection *args) {
    Vertex V0, V1, V2, V3;
    const Vertex *verts[4] = {&V0, &V1, &V2, &V3};

    // TODO: Keep everything fixed point until the last possible moment.

    V0.pos.set(toInt(args->getAt(0)), toInt(args->getAt(1)));
    V1.pos.set(toInt(args->getAt(2)), toInt(args->getAt(3)));
    V2.pos.set(toInt(args->getAt(4)), toInt(args->getAt(5)));
    V3.pos.set(toInt(args->getAt(6)), toInt(args->getAt(7)));

    V0.uv.set(0, 0);
    V1.uv.set(1 << 8, 0);
    V2.uv.set(1 << 8, 1 << 8);
    V3.uv.set(0, 1 << 8);

    int a =
        edge(verts[TRI0_INDICES[0]]->pos, verts[TRI0_INDICES[1]]->pos, verts[TRI0_INDICES[2]]->pos);
    if (a <= 0)
        return;

    Vec2 area(a, a);

    drawTri(verts, TRI0_INDICES, area, dst, tex);
    drawTri(verts, TRI1_INDICES, area, dst, tex);
}

//%
void _drawQuad(Image_ dst, Image_ tex, RefCollection *args) {
    drawQuad(dst, tex, args);
}
} // namespace gpu
