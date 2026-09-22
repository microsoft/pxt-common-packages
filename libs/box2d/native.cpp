#include "pxt.h"
#include "native-api.h"
#include "vendor/box2d-2.4.1/include/box2d/box2d.h"
#include <math.h>

using namespace pxt;

namespace pxt {
void gcScan(TValue value);
}

namespace box2d_native {

struct Kind {
    static const int World = 0;
    static const int Body = 1;
    static const int Shape = 2;
    static const int Fixture = 3;
    static const int Joint = 4;
};

class RefBox2D : public RefObject {
  public:
    int kind;
    void *pointer;
    RefBox2D *world;
    RefBox2D *bodyA;
    RefBox2D *bodyB;
    RefCollection *joints;

    RefBox2D(int kind, void *pointer, RefBox2D *world = nullptr,
             RefBox2D *bodyA = nullptr, RefBox2D *bodyB = nullptr);
    void dispose();

    static void destroy(RefBox2D *object);
    static void print(RefBox2D *object);
    static void scan(RefBox2D *object);
    static unsigned gcsize(RefBox2D *object);
};

#ifdef PXT_VM
const VTable RefBox2D_vtable = {
    sizeof(RefBox2D), ValType::Object, VTABLE_MAGIC, 0,
    BuiltInType::User0, BuiltInType::User0, 0, 0,
    {(void *)&RefBox2D::destroy, (void *)&RefBox2D::print,
     (void *)&RefBox2D::scan, (void *)&RefBox2D::gcsize}
};
#else
const VTable RefBox2D_vtable = {
    sizeof(RefBox2D), ValType::Object, VTABLE_MAGIC, 0,
    BuiltInType::User0, 0, 0,
    {(void *)&RefBox2D::destroy, (void *)&RefBox2D::print,
     (void *)&RefBox2D::scan, (void *)&RefBox2D::gcsize}
};
#endif

RefBox2D::RefBox2D(int kind, void *pointer, RefBox2D *world,
                   RefBox2D *bodyA, RefBox2D *bodyB)
    : PXT_VTABLE_INIT(RefBox2D), kind(kind), pointer(pointer),
      world(world), bodyA(bodyA), bodyB(bodyB), joints(nullptr) {}

void RefBox2D::destroy(RefBox2D *object) {
    object->dispose();
}

void RefBox2D::print(RefBox2D *object) {
    DMESG("RefBox2D %p kind=%d value=%p", object, object->kind, object->pointer);
}

void RefBox2D::scan(RefBox2D *object) {
    gcScan((TValue)object->world);
    gcScan((TValue)object->bodyA);
    gcScan((TValue)object->bodyB);
    gcScan((TValue)object->joints);
}

unsigned RefBox2D::gcsize(RefBox2D *object) {
    return TOWORDS(sizeof(*object));
}

static void require(bool condition) {
    if (!condition)
        target_panic(906);
}

static float scalar(double value) {
    // Avoid finite doubles overflowing Box2D's single-precision calculations.
    require(value >= -1000000.0 && value <= 1000000.0);
    return (float)value;
}

static float nonnegative(double value) {
    float result = scalar(value);
    require(result >= 0);
    return result;
}

static float positive(double value) {
    float result = scalar(value);
    require(result >= b2_linearSlop);
    return result;
}

static int integer(double value, int low, int high) {
    require(value >= low && value <= high);
    int result = (int)value;
    require(value == result);
    return result;
}

static b2Vec2 vector(double x, double y) {
    return b2Vec2(scalar(x), scalar(y));
}

static RefBox2D *lookup(RefBox2D *handle, int kind) {
    require(handle && handle->vtable == &RefBox2D_vtable &&
            handle->kind == kind && handle->pointer);
    return handle;
}

static RefBox2D *allocate(int kind, void *pointer, RefBox2D *world = nullptr,
                          RefBox2D *bodyA = nullptr, RefBox2D *bodyB = nullptr) {
    require(pointer);
    return NEW_GC(RefBox2D, kind, pointer, world, bodyA, bodyB);
}

static RefBox2D *bodyObject(b2Body *value) {
    return reinterpret_cast<RefBox2D *>(value->GetUserData().pointer);
}

static RefBox2D *fixtureObject(b2Fixture *value) {
    return reinterpret_cast<RefBox2D *>(value->GetUserData().pointer);
}

static RefBox2D *jointObject(b2Joint *value) {
    return reinterpret_cast<RefBox2D *>(value->GetUserData().pointer);
}

static void retainJoint(RefBox2D *body, RefBox2D *joint) {
    if (!body->joints)
        body->joints = Array_::mk();
    TValue reference = (TValue)(uintptr_t)joint;
    registerGC(&reference);
    Array_::push(body->joints, reference);
    unregisterGC(&reference);
}

static void releaseJoint(RefBox2D *body, RefBox2D *joint) {
    if (!body || !body->joints)
        return;
    for (int i = Array_::length(body->joints) - 1; i >= 0; --i) {
        if ((RefBox2D *)(uintptr_t)Array_::getAt(body->joints, i) == joint) {
            Array_::removeAt(body->joints, i);
            return;
        }
    }
}

static void detachJoint(RefBox2D *object) {
    releaseJoint(object->bodyA, object);
    releaseJoint(object->bodyB, object);
    object->world = nullptr;
    object->bodyA = nullptr;
    object->bodyB = nullptr;
}

static void invalidateFixture(b2Fixture *value) {
    RefBox2D *object = fixtureObject(value);
    if (object) {
        object->pointer = nullptr;
        object->world = nullptr;
        object->bodyA = nullptr;
    }
}

static void invalidateJoint(b2Joint *value) {
    RefBox2D *object = jointObject(value);
    if (object) {
        object->pointer = nullptr;
        detachJoint(object);
    }
}

static b2World *world(RefBox2D *handle) {
    b2World *result = static_cast<b2World *>(lookup(handle, Kind::World)->pointer);
    require(!result->IsLocked());
    return result;
}

static b2Body *body(RefBox2D *handle) {
    return static_cast<b2Body *>(lookup(handle, Kind::Body)->pointer);
}

static b2Fixture *fixture(RefBox2D *handle) {
    return static_cast<b2Fixture *>(lookup(handle, Kind::Fixture)->pointer);
}

static b2Joint *joint(RefBox2D *handle, b2JointType type) {
    b2Joint *result = static_cast<b2Joint *>(lookup(handle, Kind::Joint)->pointer);
    require(result->GetType() == type);
    return result;
}

void RefBox2D::dispose() {
    if (!pointer)
        return;

    if (kind == Kind::World) {
        b2World *value = static_cast<b2World *>(pointer);
        pointer = nullptr;
        for (b2Joint *joint = value->GetJointList(); joint; joint = joint->GetNext())
            invalidateJoint(joint);
        for (b2Body *body = value->GetBodyList(); body; body = body->GetNext()) {
            for (b2Fixture *fixture = body->GetFixtureList(); fixture; fixture = fixture->GetNext())
                invalidateFixture(fixture);
            RefBox2D *object = bodyObject(body);
            if (object) {
                object->pointer = nullptr;
                object->world = nullptr;
            }
        }
        delete value;
    }
    else if (kind == Kind::Body) {
        b2Body *value = static_cast<b2Body *>(pointer);
        RefBox2D *owner = world;
        pointer = nullptr;
        for (b2JointEdge *edge = value->GetJointList(); edge; edge = edge->next)
            invalidateJoint(edge->joint);
        for (b2Fixture *fixture = value->GetFixtureList(); fixture; fixture = fixture->GetNext())
            invalidateFixture(fixture);
        if (owner && owner->pointer)
            static_cast<b2World *>(owner->pointer)->DestroyBody(value);
        world = nullptr;
    }
    else if (kind == Kind::Shape) {
        delete static_cast<b2Shape *>(pointer);
        pointer = nullptr;
    }
    else if (kind == Kind::Fixture) {
        b2Fixture *value = static_cast<b2Fixture *>(pointer);
        RefBox2D *owner = bodyA;
        pointer = nullptr;
        if (owner && owner->pointer)
            static_cast<b2Body *>(owner->pointer)->DestroyFixture(value);
        world = nullptr;
        bodyA = nullptr;
    }
    else {
        b2Joint *value = static_cast<b2Joint *>(pointer);
        RefBox2D *owner = world;
        pointer = nullptr;
        if (owner && owner->pointer)
            static_cast<b2World *>(owner->pointer)->DestroyJoint(value);
        detachJoint(this);
    }
}

static void push(RefCollection *array, double value) {
    TValue boxed = fromDouble(value);
    registerGC(&boxed);
    Array_::push(array, boxed);
    unregisterGC(&boxed);
}

static RefCollection *newArray() {
    RefCollection *result = Array_::mk();
    registerGCObj(result);
    return result;
}

static RefCollection *finishArray(RefCollection *result) {
    unregisterGCObj(result);
    return result;
}

static double at(RefCollection *array, int index) {
    return toDouble(Array_::getAt(array, index));
}

static int vertices(RefCollection *array, b2Vec2 *output, int min, int max) {
    require(array != nullptr);
    int length = Array_::length(array);
    require(length % 2 == 0 && length >= min * 2 && length <= max * 2);
    int count = length / 2;
    for (int i = 0; i < count; ++i)
        output[i] = vector(at(array, 2 * i), at(array, 2 * i + 1));
    return count;
}

static void separated(const b2Vec2 &a, const b2Vec2 &b) {
    require(b2DistanceSquared(a, b) > b2_linearSlop * b2_linearSlop);
}

static void pushObject(RefCollection *array, RefBox2D *value) {
    TValue reference = (TValue)(uintptr_t)value;
    registerGC(&reference);
    Array_::push(array, reference);
    unregisterGC(&reference);
}

RefBox2D *createWorld(double gravityX, double gravityY) {
    return allocate(Kind::World, new b2World(vector(gravityX, gravityY)));
}

void destroyWorld(RefBox2D *handle) {
    lookup(handle, Kind::World);
    world(handle);
    handle->dispose();
}

bool isValid(RefBox2D *handle) {
    return handle && handle->vtable == &RefBox2D_vtable && handle->pointer;
}

void setGravity(RefBox2D *handle, double x, double y) {
    world(handle)->SetGravity(vector(x, y));
}

void step(RefBox2D *handle, double seconds, double velocityIterations, double positionIterations) {
    float dt = scalar(seconds);
    require(dt > 0 && dt <= 1);
    int velocity = integer(velocityIterations, 1, 100);
    int position = integer(positionIterations, 1, 100);
    world(handle)->Step(dt, velocity, position);
}

void setWorldSleepingAllowed(RefBox2D *handle, bool allowed) {
    world(handle)->SetAllowSleeping(allowed);
}

RefBox2D *createBody(RefBox2D *worldHandle, double type, double x, double y, double angle) {
    b2World *owner = world(worldHandle);
    b2BodyDef def;
    def.type = (b2BodyType)integer(type, 0, 2);
    def.position = vector(x, y);
    def.angle = scalar(angle);
    b2Body *value = owner->CreateBody(&def);
    RefBox2D *result = allocate(Kind::Body, value, worldHandle);
    value->GetUserData().pointer = reinterpret_cast<uintptr_t>(result);
    return result;
}

void destroyBody(RefBox2D *handle) {
    lookup(handle, Kind::Body)->dispose();
}

RefCollection *getBodyState(RefBox2D *handle) {
    b2Body *value = body(handle);
    RefCollection *result = newArray();
    push(result, value->GetPosition().x);
    push(result, value->GetPosition().y);
    push(result, value->GetAngle());
    push(result, value->GetLinearVelocity().x);
    push(result, value->GetLinearVelocity().y);
    push(result, value->GetAngularVelocity());
    push(result, value->GetMass());
    push(result, value->GetInertia());
    return finishArray(result);
}

void readBodyTransform(RefBox2D *handle, RefCollection *output) {
    b2Body *value = body(handle);
    require(output && Array_::length(output) >= 3);
    registerGCObj(output);
    // Capacity is already sufficient: only boxing the three values can allocate.
    Array_::setAt(output, 0, fromDouble(value->GetPosition().x));
    Array_::setAt(output, 1, fromDouble(value->GetPosition().y));
    Array_::setAt(output, 2, fromDouble(value->GetAngle()));
    unregisterGCObj(output);
}

static double renderScalar(RefCollection *array, int index) {
    double value = at(array, index);
    scalar(value);
    return value;
}

static int pixel(double value) {
    // Match Math.round, including negative half-pixels, and stay within Arcade's line range.
    double rounded = floor(value + 0.5);
    require(rounded >= -30000 && rounded <= 30000);
    return (int)rounded;
}

void readBodyBoxVertices(RefBox2D *handle, RefCollection *box, RefCollection *view, RefCollection *output) {
    b2Body *value = body(handle);
    require(box && Array_::length(box) == 4);
    require(view && Array_::length(view) == 3);
    require(output && Array_::length(output) >= 8);
    double halfWidth = renderScalar(box, 0);
    double halfHeight = renderScalar(box, 1);
    positive(halfWidth);
    positive(halfHeight);
    double offsetX = renderScalar(box, 2);
    double offsetY = renderScalar(box, 3);
    double scale = renderScalar(view, 0);
    require(scale > 0);
    double originX = renderScalar(view, 1);
    double originY = renderScalar(view, 2);

    double cosine = cos((double)value->GetAngle());
    double sine = sin((double)value->GetAngle());
    double x = originX + (value->GetPosition().x + cosine * offsetX - sine * offsetY) * scale;
    double y = originY + (value->GetPosition().y + sine * offsetX + cosine * offsetY) * scale;
    double ux = cosine * halfWidth * scale;
    double uy = sine * halfWidth * scale;
    double vx = -sine * halfHeight * scale;
    double vy = cosine * halfHeight * scale;
    // Validate every corner before touching the caller's output.
    int corners[8] = {
        pixel(x - ux - vx), pixel(y - uy - vy),
        pixel(x + ux - vx), pixel(y + uy - vy),
        pixel(x + ux + vx), pixel(y + uy + vy),
        pixel(x - ux + vx), pixel(y - uy + vy)
    };
    registerGCObj(output);
    for (int i = 0; i < 8; ++i)
        Array_::setAt(output, i, fromInt(corners[i]));
    unregisterGCObj(output);
}

void setTransform(RefBox2D *handle, double x, double y, double angle) {
    b2Vec2 position = vector(x, y);
    float rotation = scalar(angle);
    body(handle)->SetTransform(position, rotation);
}

void setLinearVelocity(RefBox2D *handle, double x, double y) {
    body(handle)->SetLinearVelocity(vector(x, y));
}

void setAngularVelocity(RefBox2D *handle, double velocity) {
    body(handle)->SetAngularVelocity(scalar(velocity));
}

void setBodyType(RefBox2D *handle, double type) {
    body(handle)->SetType((b2BodyType)integer(type, 0, 2));
}

void setDamping(RefBox2D *handle, double linear, double angular) {
    float l = nonnegative(linear);
    float a = nonnegative(angular);
    b2Body *value = body(handle);
    value->SetLinearDamping(l);
    value->SetAngularDamping(a);
}

void setGravityScale(RefBox2D *handle, double scale) {
    body(handle)->SetGravityScale(scalar(scale));
}

void setBodyFlag(RefBox2D *handle, double flag, bool enabled) {
    int index = integer(flag, 0, 4);
    b2Body *value = body(handle);
    switch (index) {
    case 0: value->SetBullet(enabled); break;
    case 1: value->SetFixedRotation(enabled); break;
    case 2: value->SetSleepingAllowed(enabled); break;
    case 3: value->SetAwake(enabled); break;
    case 4: value->SetEnabled(enabled); break;
    }
}

bool getBodyFlag(RefBox2D *handle, double flag) {
    int index = integer(flag, 0, 4);
    b2Body *value = body(handle);
    switch (index) {
    case 0: return value->IsBullet();
    case 1: return value->IsFixedRotation();
    case 2: return value->IsSleepingAllowed();
    case 3: return value->IsAwake();
    default: return value->IsEnabled();
    }
}

void applyForce(RefBox2D *handle, double x, double y, double pointX, double pointY, bool wake) {
    b2Vec2 force = vector(x, y);
    b2Vec2 point = vector(pointX, pointY);
    body(handle)->ApplyForce(force, point, wake);
}

void applyForceToCenter(RefBox2D *handle, double x, double y, bool wake) {
    body(handle)->ApplyForceToCenter(vector(x, y), wake);
}

void applyLinearImpulse(RefBox2D *handle, double x, double y, double pointX, double pointY, bool wake) {
    b2Vec2 impulse = vector(x, y);
    b2Vec2 point = vector(pointX, pointY);
    body(handle)->ApplyLinearImpulse(impulse, point, wake);
}

void applyLinearImpulseToCenter(RefBox2D *handle, double x, double y, bool wake) {
    body(handle)->ApplyLinearImpulseToCenter(vector(x, y), wake);
}

void applyTorque(RefBox2D *handle, double torque, bool wake) {
    body(handle)->ApplyTorque(scalar(torque), wake);
}

void applyAngularImpulse(RefBox2D *handle, double impulse, bool wake) {
    body(handle)->ApplyAngularImpulse(scalar(impulse), wake);
}

RefCollection *getWorldPoint(RefBox2D *handle, double x, double y) {
    b2Vec2 point = body(handle)->GetWorldPoint(vector(x, y));
    RefCollection *result = newArray();
    push(result, point.x);
    push(result, point.y);
    return finishArray(result);
}

RefCollection *getLocalPoint(RefBox2D *handle, double x, double y) {
    b2Vec2 point = body(handle)->GetLocalPoint(vector(x, y));
    RefCollection *result = newArray();
    push(result, point.x);
    push(result, point.y);
    return finishArray(result);
}

RefBox2D *createCircleShape(double radius, double centerX, double centerY) {
    float r = positive(radius);
    b2Vec2 center = vector(centerX, centerY);
    b2CircleShape *value = new b2CircleShape();
    value->m_radius = r;
    value->m_p = center;
    return allocate(Kind::Shape, value);
}

RefBox2D *createBoxShape(double halfWidth, double halfHeight, double centerX, double centerY, double angle) {
    float width = positive(halfWidth);
    float height = positive(halfHeight);
    b2Vec2 center = vector(centerX, centerY);
    float rotation = scalar(angle);
    b2PolygonShape *value = new b2PolygonShape();
    value->SetAsBox(width, height, center, rotation);
    return allocate(Kind::Shape, value);
}

RefBox2D *createPolygonShape(RefCollection *points) {
    b2Vec2 polygon[b2_maxPolygonVertices];
    int count = vertices(points, polygon, 3, b2_maxPolygonVertices);
    // Require a strictly convex ordered boundary, rather than letting Box2D
    // silently replace a degenerate hull with a box.
    float direction = b2Cross(polygon[1] - polygon[0], polygon[2] - polygon[0]);
    require(b2Abs(direction) > b2_linearSlop * b2_linearSlop);
    for (int i = 0; i < count; ++i) {
        int next = (i + 1) % count;
        separated(polygon[i], polygon[next]);
        for (int j = 0; j < count; ++j) {
            if (j == i || j == next)
                continue;
            float cross = b2Cross(polygon[next] - polygon[i], polygon[j] - polygon[i]);
            require(direction > 0 ? cross > b2_linearSlop * b2_linearSlop
                                  : cross < -b2_linearSlop * b2_linearSlop);
        }
    }
    b2PolygonShape *value = new b2PolygonShape();
    value->Set(polygon, count);
    return allocate(Kind::Shape, value);
}

RefBox2D *createEdgeShape(double x1, double y1, double x2, double y2) {
    b2Vec2 a = vector(x1, y1);
    b2Vec2 b = vector(x2, y2);
    separated(a, b);
    b2EdgeShape *value = new b2EdgeShape();
    value->SetTwoSided(a, b);
    return allocate(Kind::Shape, value);
}

RefBox2D *createChainShape(RefCollection *points, bool loop) {
    b2Vec2 chain[128];
    int count = vertices(points, chain, loop ? 3 : 2, 128);
    for (int i = 1; i < count; ++i)
        separated(chain[i - 1], chain[i]);
    if (loop)
        separated(chain[count - 1], chain[0]);
    b2ChainShape *value = new b2ChainShape();
    if (loop)
        value->CreateLoop(chain, count);
    else
        value->CreateChain(chain, count, 2 * chain[0] - chain[1],
                           2 * chain[count - 1] - chain[count - 2]);
    return allocate(Kind::Shape, value);
}

void destroyShape(RefBox2D *handle) {
    lookup(handle, Kind::Shape)->dispose();
}

RefBox2D *createFixture(RefBox2D *bodyHandle, RefBox2D *shapeHandle, double density, double friction, double restitution, bool sensor) {
    RefBox2D *owner = lookup(bodyHandle, Kind::Body);
    b2FixtureDef def;
    def.shape = static_cast<b2Shape *>(lookup(shapeHandle, Kind::Shape)->pointer);
    def.density = nonnegative(density);
    def.friction = nonnegative(friction);
    def.restitution = nonnegative(restitution);
    def.isSensor = sensor;
    b2Fixture *value = static_cast<b2Body *>(owner->pointer)->CreateFixture(&def);
    RefBox2D *result = allocate(Kind::Fixture, value, owner->world, owner);
    value->GetUserData().pointer = reinterpret_cast<uintptr_t>(result);
    return result;
}

void destroyFixture(RefBox2D *handle) {
    lookup(handle, Kind::Fixture)->dispose();
}

RefBox2D *getFixtureBody(RefBox2D *handle) {
    return lookup(handle, Kind::Fixture)->bodyA;
}

void setFixtureMaterial(RefBox2D *handle, double density, double friction, double restitution) {
    float d = nonnegative(density);
    float f = nonnegative(friction);
    float r = nonnegative(restitution);
    b2Fixture *value = fixture(handle);
    value->SetDensity(d);
    value->SetFriction(f);
    value->SetRestitution(r);
    b2Body *owner = value->GetBody();
    owner->ResetMassData();
    owner->SetAwake(true);
    // Contacts cache mixed material values, so update existing contacts too.
    for (b2ContactEdge *edge = owner->GetContactList(); edge; edge = edge->next) {
        b2Contact *contact = edge->contact;
        if (contact->GetFixtureA() == value || contact->GetFixtureB() == value) {
            contact->ResetFriction();
            contact->ResetRestitution();
        }
    }
}

void setFixtureSensor(RefBox2D *handle, bool sensor) {
    fixture(handle)->SetSensor(sensor);
}

void setFixtureFilter(RefBox2D *handle, double categoryBits, double maskBits, double groupIndex) {
    b2Filter filter;
    filter.categoryBits = (uint16)integer(categoryBits, 0, 65535);
    filter.maskBits = (uint16)integer(maskBits, 0, 65535);
    filter.groupIndex = (int16)integer(groupIndex, -32768, 32767);
    fixture(handle)->SetFilterData(filter);
}

bool testPoint(RefBox2D *handle, double x, double y) {
    return fixture(handle)->TestPoint(vector(x, y));
}

static b2World *jointWorld(RefBox2D *bodyA, RefBox2D *bodyB) {
    RefBox2D *a = lookup(bodyA, Kind::Body);
    RefBox2D *b = lookup(bodyB, Kind::Body);
    require(a != b && a->world == b->world);
    return world(a->world);
}

static RefBox2D *allocateJoint(b2Joint *value, RefBox2D *bodyA, RefBox2D *bodyB) {
    RefBox2D *result = allocate(Kind::Joint, value, bodyA->world, bodyA, bodyB);
    value->GetUserData().pointer = reinterpret_cast<uintptr_t>(result);
    TValue reference = (TValue)(uintptr_t)result;
    registerGC(&reference);
    retainJoint(bodyA, result);
    retainJoint(bodyB, result);
    unregisterGC(&reference);
    return result;
}

RefBox2D *createDistanceJoint(RefBox2D *bodyA, RefBox2D *bodyB, double ax, double ay, double bx, double by, bool collideConnected) {
    b2World *owner = jointWorld(bodyA, bodyB);
    b2Vec2 a = vector(ax, ay);
    b2Vec2 b = vector(bx, by);
    separated(a, b);
    b2DistanceJointDef def;
    def.Initialize(body(bodyA), body(bodyB), a, b);
    def.collideConnected = collideConnected;
    return allocateJoint(owner->CreateJoint(&def), bodyA, bodyB);
}

void setDistanceJoint(RefBox2D *handle, double length, double minLength, double maxLength, double stiffness, double damping) {
    float l = positive(length);
    float min = positive(minLength);
    float max = positive(maxLength);
    float s = nonnegative(stiffness);
    float d = nonnegative(damping);
    require(min <= l && l <= max);
    b2DistanceJoint *value = static_cast<b2DistanceJoint *>(joint(handle, e_distanceJoint));
    // Widen first so Box2D's clamping against the old range cannot alter the new range.
    value->SetMaxLength(b2Max(max, value->GetMaxLength()));
    value->SetMinLength(min);
    value->SetMaxLength(max);
    value->SetLength(l);
    value->SetStiffness(s);
    value->SetDamping(d);
    value->GetBodyA()->SetAwake(true);
    value->GetBodyB()->SetAwake(true);
}

RefBox2D *createRevoluteJoint(RefBox2D *bodyA, RefBox2D *bodyB, double anchorX, double anchorY, bool collideConnected) {
    b2World *owner = jointWorld(bodyA, bodyB);
    b2RevoluteJointDef def;
    def.Initialize(body(bodyA), body(bodyB), vector(anchorX, anchorY));
    def.collideConnected = collideConnected;
    return allocateJoint(owner->CreateJoint(&def), bodyA, bodyB);
}

void setRevoluteJointMotor(RefBox2D *handle, bool enabled, double speed, double maxTorque) {
    float s = scalar(speed);
    float t = nonnegative(maxTorque);
    b2RevoluteJoint *value = static_cast<b2RevoluteJoint *>(joint(handle, e_revoluteJoint));
    value->SetMotorSpeed(s);
    value->SetMaxMotorTorque(t);
    value->EnableMotor(enabled);
}

void setRevoluteJointLimits(RefBox2D *handle, bool enabled, double lower, double upper) {
    float l = scalar(lower);
    float u = scalar(upper);
    require(l <= u);
    b2RevoluteJoint *value = static_cast<b2RevoluteJoint *>(joint(handle, e_revoluteJoint));
    value->SetLimits(l, u);
    value->EnableLimit(enabled);
}

RefBox2D *createWheelJoint(RefBox2D *bodyA, RefBox2D *bodyB, double anchorX, double anchorY, double axisX, double axisY, bool collideConnected) {
    b2World *owner = jointWorld(bodyA, bodyB);
    require(isfinite(axisX) && isfinite(axisY));
    double scale = b2Max(fabs(axisX), fabs(axisY));
    require(scale > 0);
    // Scale before converting to float so tiny and large finite axes normalize safely.
    b2Vec2 axis = vector(axisX / scale, axisY / scale);
    axis.Normalize();
    b2WheelJointDef def;
    def.Initialize(body(bodyA), body(bodyB), vector(anchorX, anchorY), axis);
    def.collideConnected = collideConnected;
    return allocateJoint(owner->CreateJoint(&def), bodyA, bodyB);
}

void setWheelJointMotor(RefBox2D *handle, bool enabled, double speed, double maxTorque) {
    float s = scalar(speed);
    float t = nonnegative(maxTorque);
    b2WheelJoint *value = static_cast<b2WheelJoint *>(joint(handle, e_wheelJoint));
    value->SetMotorSpeed(s);
    value->SetMaxMotorTorque(t);
    value->EnableMotor(enabled);
}

void setWheelJointLimits(RefBox2D *handle, bool enabled, double lower, double upper) {
    float l = scalar(lower);
    float u = scalar(upper);
    require(l <= u);
    b2WheelJoint *value = static_cast<b2WheelJoint *>(joint(handle, e_wheelJoint));
    value->SetLimits(l, u);
    value->EnableLimit(enabled);
}

void setWheelJointSuspension(RefBox2D *handle, double stiffness, double damping) {
    float s = nonnegative(stiffness);
    float d = nonnegative(damping);
    b2WheelJoint *value = static_cast<b2WheelJoint *>(joint(handle, e_wheelJoint));
    value->SetStiffness(s);
    value->SetDamping(d);
    value->GetBodyA()->SetAwake(true);
    value->GetBodyB()->SetAwake(true);
}

RefBox2D *createMouseJoint(RefBox2D *bodyA, RefBox2D *bodyB, double anchorX, double anchorY, double maxForce, double stiffness, double damping) {
    b2World *owner = jointWorld(bodyA, bodyB);
    require(body(bodyB)->GetType() == b2_dynamicBody);
    b2MouseJointDef def;
    def.bodyA = body(bodyA);
    def.bodyB = body(bodyB);
    def.target = vector(anchorX, anchorY);
    def.maxForce = nonnegative(maxForce);
    def.stiffness = nonnegative(stiffness);
    def.damping = nonnegative(damping);
    return allocateJoint(owner->CreateJoint(&def), bodyA, bodyB);
}

void setMouseJointTarget(RefBox2D *handle, double x, double y) {
    b2MouseJoint *value = static_cast<b2MouseJoint *>(joint(handle, e_mouseJoint));
    value->SetTarget(vector(x, y));
}

void destroyJoint(RefBox2D *handle) {
    lookup(handle, Kind::Joint)->dispose();
}

RefCollection *getContacts(RefBox2D *handle) {
    b2World *owner = world(handle);
    RefCollection *result = newArray();
    for (b2Contact *contact = owner->GetContactList(); contact; contact = contact->GetNext()) {
        if (contact->IsTouching() && contact->IsEnabled()) {
            pushObject(result, fixtureObject(contact->GetFixtureA()));
            pushObject(result, fixtureObject(contact->GetFixtureB()));
        }
    }
    return finishArray(result);
}

class Query : public b2QueryCallback {
  public:
    RefCollection *result;
    explicit Query(RefCollection *array) : result(array) {}
    bool ReportFixture(b2Fixture *value) override {
        RefBox2D *object = fixtureObject(value);
        // Chains can report multiple child proxies for the same fixture.
        for (int i = 0; i < Array_::length(result); ++i)
            if ((RefBox2D *)(uintptr_t)Array_::getAt(result, i) == object)
                return true;
        pushObject(result, object);
        return true;
    }
};

RefCollection *queryAABB(RefBox2D *handle, double minX, double minY, double maxX, double maxY) {
    b2World *owner = world(handle);
    b2AABB bounds;
    bounds.lowerBound = vector(minX, minY);
    bounds.upperBound = vector(maxX, maxY);
    require(bounds.IsValid());
    RefCollection *result = newArray();
    Query query(result);
    owner->QueryAABB(&query, bounds);
    return finishArray(result);
}

class Ray : public b2RayCastCallback {
  public:
    RefBox2D *fixture = nullptr;
    b2Vec2 point;
    b2Vec2 normal;
    float fraction = 1;
    float ReportFixture(b2Fixture *value, const b2Vec2 &p, const b2Vec2 &n, float f) override {
        fixture = fixtureObject(value);
        point = p;
        normal = n;
        fraction = f;
        return f;
    }
};

RefCollection *rayCast(RefBox2D *handle, double x1, double y1, double x2, double y2) {
    b2World *owner = world(handle);
    b2Vec2 a = vector(x1, y1);
    b2Vec2 b = vector(x2, y2);
    separated(a, b);
    Ray ray;
    owner->RayCast(&ray, a, b);
    RefCollection *result = newArray();
    if (ray.fixture) {
        pushObject(result, ray.fixture);
        push(result, ray.point.x);
        push(result, ray.point.y);
        push(result, ray.normal.x);
        push(result, ray.normal.y);
        push(result, ray.fraction);
    }
    return finishArray(result);
}

} // namespace box2d_native
