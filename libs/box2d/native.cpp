#include "pxt.h"
#include "native-api.h"
#include "vendor/box2d-2.4.1/include/box2d/box2d.h"
#include <limits.h>
#include <math.h>

using namespace pxt;

namespace box2d_native {

struct Kind {
    static const int World = 0;
    static const int Body = 1;
    static const int Shape = 2;
    static const int Fixture = 3;
    static const int Joint = 4;
};

struct Entry {
    int id;
    int kind;
    void *pointer;
    int world;
    int bodyA;
    int bodyB;
    Entry *next;
};

static Entry *entries;
static int nextId = 1;

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

static Entry *find(int id) {
    for (Entry *entry = entries; entry; entry = entry->next)
        if (entry->id == id)
            return entry;
    return nullptr;
}

static Entry *lookup(double handle, int kind) {
    Entry *entry = find(integer(handle, 1, INT_MAX));
    require(entry && entry->kind == kind);
    return entry;
}

static int track(int kind, void *pointer, int world = 0, int bodyA = 0, int bodyB = 0) {
    require(pointer && nextId < 0x1000000);
    Entry *entry = new Entry{nextId++, kind, pointer, world, bodyA, bodyB, entries};
    entries = entry;
    return entry->id;
}

static void forget(int id) {
    Entry **link = &entries;
    while (*link) {
        Entry *entry = *link;
        if (entry->id == id) {
            *link = entry->next;
            delete entry;
            return;
        }
        link = &entry->next;
    }
}

static b2World *world(double handle) {
    b2World *result = static_cast<b2World *>(lookup(handle, Kind::World)->pointer);
    require(!result->IsLocked());
    return result;
}

static b2Body *body(double handle) {
    return static_cast<b2Body *>(lookup(handle, Kind::Body)->pointer);
}

static b2Fixture *fixture(double handle) {
    return static_cast<b2Fixture *>(lookup(handle, Kind::Fixture)->pointer);
}

static b2Joint *joint(double handle, b2JointType type) {
    b2Joint *result = static_cast<b2Joint *>(lookup(handle, Kind::Joint)->pointer);
    require(result->GetType() == type);
    return result;
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

static int fixtureId(b2Fixture *value) {
    return (int)value->GetUserData().pointer;
}

double createWorld(double gravityX, double gravityY) {
    return track(Kind::World, new b2World(vector(gravityX, gravityY)));
}

void destroyWorld(double handle) {
    Entry *entry = lookup(handle, Kind::World);
    int id = entry->id;
    delete world(handle);
    Entry *current = entries;
    while (current) {
        Entry *next = current->next;
        if (current->world == id || current->id == id)
            forget(current->id);
        current = next;
    }
}

bool isValid(double handle) {
    if (!(handle >= 1 && handle < INT_MAX) || handle != (int)handle)
        return false;
    return find((int)handle) != nullptr;
}

void setGravity(double handle, double x, double y) {
    world(handle)->SetGravity(vector(x, y));
}

void step(double handle, double seconds, double velocityIterations, double positionIterations) {
    float dt = scalar(seconds);
    require(dt > 0 && dt <= 1);
    int velocity = integer(velocityIterations, 1, 100);
    int position = integer(positionIterations, 1, 100);
    world(handle)->Step(dt, velocity, position);
}

void setWorldSleepingAllowed(double handle, bool allowed) {
    world(handle)->SetAllowSleeping(allowed);
}

double createBody(double worldHandle, double type, double x, double y, double angle) {
    b2World *owner = world(worldHandle);
    b2BodyDef def;
    def.type = (b2BodyType)integer(type, 0, 2);
    def.position = vector(x, y);
    def.angle = scalar(angle);
    b2Body *value = owner->CreateBody(&def);
    int id = track(Kind::Body, value, (int)worldHandle);
    value->GetUserData().pointer = id;
    return id;
}

void destroyBody(double handle) {
    Entry *entry = lookup(handle, Kind::Body);
    int id = entry->id;
    world(entry->world)->DestroyBody(static_cast<b2Body *>(entry->pointer));
    Entry *current = entries;
    while (current) {
        Entry *next = current->next;
        if (current->id == id || current->bodyA == id || current->bodyB == id)
            forget(current->id);
        current = next;
    }
}

RefCollection *getBodyState(double handle) {
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

void readBodyTransform(double handle, RefCollection *output) {
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

void readBodyBoxVertices(double handle, RefCollection *box, RefCollection *view, RefCollection *output) {
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

void setTransform(double handle, double x, double y, double angle) {
    b2Vec2 position = vector(x, y);
    float rotation = scalar(angle);
    body(handle)->SetTransform(position, rotation);
}

void setLinearVelocity(double handle, double x, double y) {
    body(handle)->SetLinearVelocity(vector(x, y));
}

void setAngularVelocity(double handle, double velocity) {
    body(handle)->SetAngularVelocity(scalar(velocity));
}

void setBodyType(double handle, double type) {
    body(handle)->SetType((b2BodyType)integer(type, 0, 2));
}

void setDamping(double handle, double linear, double angular) {
    float l = nonnegative(linear);
    float a = nonnegative(angular);
    b2Body *value = body(handle);
    value->SetLinearDamping(l);
    value->SetAngularDamping(a);
}

void setGravityScale(double handle, double scale) {
    body(handle)->SetGravityScale(scalar(scale));
}

void setBodyFlag(double handle, double flag, bool enabled) {
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

bool getBodyFlag(double handle, double flag) {
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

void applyForce(double handle, double x, double y, double pointX, double pointY, bool wake) {
    b2Vec2 force = vector(x, y);
    b2Vec2 point = vector(pointX, pointY);
    body(handle)->ApplyForce(force, point, wake);
}

void applyForceToCenter(double handle, double x, double y, bool wake) {
    body(handle)->ApplyForceToCenter(vector(x, y), wake);
}

void applyLinearImpulse(double handle, double x, double y, double pointX, double pointY, bool wake) {
    b2Vec2 impulse = vector(x, y);
    b2Vec2 point = vector(pointX, pointY);
    body(handle)->ApplyLinearImpulse(impulse, point, wake);
}

void applyLinearImpulseToCenter(double handle, double x, double y, bool wake) {
    body(handle)->ApplyLinearImpulseToCenter(vector(x, y), wake);
}

void applyTorque(double handle, double torque, bool wake) {
    body(handle)->ApplyTorque(scalar(torque), wake);
}

void applyAngularImpulse(double handle, double impulse, bool wake) {
    body(handle)->ApplyAngularImpulse(scalar(impulse), wake);
}

RefCollection *getWorldPoint(double handle, double x, double y) {
    b2Vec2 point = body(handle)->GetWorldPoint(vector(x, y));
    RefCollection *result = newArray();
    push(result, point.x);
    push(result, point.y);
    return finishArray(result);
}

RefCollection *getLocalPoint(double handle, double x, double y) {
    b2Vec2 point = body(handle)->GetLocalPoint(vector(x, y));
    RefCollection *result = newArray();
    push(result, point.x);
    push(result, point.y);
    return finishArray(result);
}

double createCircleShape(double radius, double centerX, double centerY) {
    float r = positive(radius);
    b2Vec2 center = vector(centerX, centerY);
    b2CircleShape *value = new b2CircleShape();
    value->m_radius = r;
    value->m_p = center;
    return track(Kind::Shape, value);
}

double createBoxShape(double halfWidth, double halfHeight, double centerX, double centerY, double angle) {
    float width = positive(halfWidth);
    float height = positive(halfHeight);
    b2Vec2 center = vector(centerX, centerY);
    float rotation = scalar(angle);
    b2PolygonShape *value = new b2PolygonShape();
    value->SetAsBox(width, height, center, rotation);
    return track(Kind::Shape, value);
}

double createPolygonShape(RefCollection *points) {
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
    return track(Kind::Shape, value);
}

double createEdgeShape(double x1, double y1, double x2, double y2) {
    b2Vec2 a = vector(x1, y1);
    b2Vec2 b = vector(x2, y2);
    separated(a, b);
    b2EdgeShape *value = new b2EdgeShape();
    value->SetTwoSided(a, b);
    return track(Kind::Shape, value);
}

double createChainShape(RefCollection *points, bool loop) {
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
    return track(Kind::Shape, value);
}

void destroyShape(double handle) {
    Entry *entry = lookup(handle, Kind::Shape);
    delete static_cast<b2Shape *>(entry->pointer);
    forget(entry->id);
}

double createFixture(double bodyHandle, double shapeHandle, double density, double friction, double restitution, bool sensor) {
    Entry *owner = lookup(bodyHandle, Kind::Body);
    b2FixtureDef def;
    def.shape = static_cast<b2Shape *>(lookup(shapeHandle, Kind::Shape)->pointer);
    def.density = nonnegative(density);
    def.friction = nonnegative(friction);
    def.restitution = nonnegative(restitution);
    def.isSensor = sensor;
    b2Fixture *value = static_cast<b2Body *>(owner->pointer)->CreateFixture(&def);
    int id = track(Kind::Fixture, value, owner->world, owner->id);
    value->GetUserData().pointer = id;
    return id;
}

void destroyFixture(double handle) {
    Entry *entry = lookup(handle, Kind::Fixture);
    b2Fixture *value = static_cast<b2Fixture *>(entry->pointer);
    value->GetBody()->DestroyFixture(value);
    forget(entry->id);
}

double getFixtureBody(double handle) {
    return lookup(handle, Kind::Fixture)->bodyA;
}

void setFixtureMaterial(double handle, double density, double friction, double restitution) {
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

void setFixtureSensor(double handle, bool sensor) {
    fixture(handle)->SetSensor(sensor);
}

void setFixtureFilter(double handle, double categoryBits, double maskBits, double groupIndex) {
    b2Filter filter;
    filter.categoryBits = (uint16)integer(categoryBits, 0, 65535);
    filter.maskBits = (uint16)integer(maskBits, 0, 65535);
    filter.groupIndex = (int16)integer(groupIndex, -32768, 32767);
    fixture(handle)->SetFilterData(filter);
}

bool testPoint(double handle, double x, double y) {
    return fixture(handle)->TestPoint(vector(x, y));
}

static b2World *jointWorld(double bodyA, double bodyB) {
    Entry *a = lookup(bodyA, Kind::Body);
    Entry *b = lookup(bodyB, Kind::Body);
    require(a->id != b->id && a->world == b->world);
    return world(a->world);
}

double createDistanceJoint(double bodyA, double bodyB, double ax, double ay, double bx, double by, bool collideConnected) {
    b2World *owner = jointWorld(bodyA, bodyB);
    b2Vec2 a = vector(ax, ay);
    b2Vec2 b = vector(bx, by);
    separated(a, b);
    b2DistanceJointDef def;
    def.Initialize(body(bodyA), body(bodyB), a, b);
    def.collideConnected = collideConnected;
    return track(Kind::Joint, owner->CreateJoint(&def),
                 lookup(bodyA, Kind::Body)->world, (int)bodyA, (int)bodyB);
}

void setDistanceJoint(double handle, double length, double minLength, double maxLength, double stiffness, double damping) {
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

double createRevoluteJoint(double bodyA, double bodyB, double anchorX, double anchorY, bool collideConnected) {
    b2World *owner = jointWorld(bodyA, bodyB);
    b2RevoluteJointDef def;
    def.Initialize(body(bodyA), body(bodyB), vector(anchorX, anchorY));
    def.collideConnected = collideConnected;
    return track(Kind::Joint, owner->CreateJoint(&def),
                 lookup(bodyA, Kind::Body)->world, (int)bodyA, (int)bodyB);
}

void setRevoluteJointMotor(double handle, bool enabled, double speed, double maxTorque) {
    float s = scalar(speed);
    float t = nonnegative(maxTorque);
    b2RevoluteJoint *value = static_cast<b2RevoluteJoint *>(joint(handle, e_revoluteJoint));
    value->SetMotorSpeed(s);
    value->SetMaxMotorTorque(t);
    value->EnableMotor(enabled);
}

void setRevoluteJointLimits(double handle, bool enabled, double lower, double upper) {
    float l = scalar(lower);
    float u = scalar(upper);
    require(l <= u);
    b2RevoluteJoint *value = static_cast<b2RevoluteJoint *>(joint(handle, e_revoluteJoint));
    value->SetLimits(l, u);
    value->EnableLimit(enabled);
}

double createWheelJoint(double bodyA, double bodyB, double anchorX, double anchorY, double axisX, double axisY, bool collideConnected) {
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
    return track(Kind::Joint, owner->CreateJoint(&def),
                 lookup(bodyA, Kind::Body)->world, (int)bodyA, (int)bodyB);
}

void setWheelJointMotor(double handle, bool enabled, double speed, double maxTorque) {
    float s = scalar(speed);
    float t = nonnegative(maxTorque);
    b2WheelJoint *value = static_cast<b2WheelJoint *>(joint(handle, e_wheelJoint));
    value->SetMotorSpeed(s);
    value->SetMaxMotorTorque(t);
    value->EnableMotor(enabled);
}

void setWheelJointLimits(double handle, bool enabled, double lower, double upper) {
    float l = scalar(lower);
    float u = scalar(upper);
    require(l <= u);
    b2WheelJoint *value = static_cast<b2WheelJoint *>(joint(handle, e_wheelJoint));
    value->SetLimits(l, u);
    value->EnableLimit(enabled);
}

void setWheelJointSuspension(double handle, double stiffness, double damping) {
    float s = nonnegative(stiffness);
    float d = nonnegative(damping);
    b2WheelJoint *value = static_cast<b2WheelJoint *>(joint(handle, e_wheelJoint));
    value->SetStiffness(s);
    value->SetDamping(d);
    value->GetBodyA()->SetAwake(true);
    value->GetBodyB()->SetAwake(true);
}

double createMouseJoint(double bodyA, double bodyB, double anchorX, double anchorY, double maxForce, double stiffness, double damping) {
    b2World *owner = jointWorld(bodyA, bodyB);
    require(body(bodyB)->GetType() == b2_dynamicBody);
    b2MouseJointDef def;
    def.bodyA = body(bodyA);
    def.bodyB = body(bodyB);
    def.target = vector(anchorX, anchorY);
    def.maxForce = nonnegative(maxForce);
    def.stiffness = nonnegative(stiffness);
    def.damping = nonnegative(damping);
    return track(Kind::Joint, owner->CreateJoint(&def),
                 lookup(bodyA, Kind::Body)->world, (int)bodyA, (int)bodyB);
}

void setMouseJointTarget(double handle, double x, double y) {
    b2MouseJoint *value = static_cast<b2MouseJoint *>(joint(handle, e_mouseJoint));
    value->SetTarget(vector(x, y));
}

void destroyJoint(double handle) {
    Entry *entry = lookup(handle, Kind::Joint);
    world(entry->world)->DestroyJoint(static_cast<b2Joint *>(entry->pointer));
    forget(entry->id);
}

RefCollection *getContacts(double handle) {
    b2World *owner = world(handle);
    RefCollection *result = newArray();
    for (b2Contact *contact = owner->GetContactList(); contact; contact = contact->GetNext()) {
        if (contact->IsTouching() && contact->IsEnabled()) {
            push(result, fixtureId(contact->GetFixtureA()));
            push(result, fixtureId(contact->GetFixtureB()));
        }
    }
    return finishArray(result);
}

class Query : public b2QueryCallback {
  public:
    RefCollection *result;
    explicit Query(RefCollection *array) : result(array) {}
    bool ReportFixture(b2Fixture *value) override {
        int id = fixtureId(value);
        // Chains can report multiple child proxies for the same fixture.
        for (int i = 0; i < Array_::length(result); ++i)
            if (at(result, i) == id)
                return true;
        push(result, id);
        return true;
    }
};

RefCollection *queryAABB(double handle, double minX, double minY, double maxX, double maxY) {
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
    int id = 0;
    b2Vec2 point;
    b2Vec2 normal;
    float fraction = 1;
    float ReportFixture(b2Fixture *value, const b2Vec2 &p, const b2Vec2 &n, float f) override {
        id = fixtureId(value);
        point = p;
        normal = n;
        fraction = f;
        return f;
    }
};

RefCollection *rayCast(double handle, double x1, double y1, double x2, double y2) {
    b2World *owner = world(handle);
    b2Vec2 a = vector(x1, y1);
    b2Vec2 b = vector(x2, y2);
    separated(a, b);
    Ray ray;
    owner->RayCast(&ray, a, b);
    RefCollection *result = newArray();
    if (ray.id) {
        push(result, ray.id);
        push(result, ray.point.x);
        push(result, ray.point.y);
        push(result, ray.normal.x);
        push(result, ray.normal.y);
        push(result, ray.fraction);
    }
    return finishArray(result);
}

} // namespace box2d_native
