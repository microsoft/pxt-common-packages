#include "../native.cpp"
#include "../bindings.cpp"
#include <cassert>
#include <cmath>
#include <functional>
#include <iostream>
#include <limits>

using namespace box2d_native;

static_assert(sizeof(b2World) < 16 * 1024 - 16, "World must fit within a PXT allocation");

static void close(double actual, double expected, double tolerance = 0.001) {
    assert(std::abs(actual - expected) < tolerance);
}

static void rejects(const std::function<void()> &operation) {
    try {
        operation();
    } catch (const std::runtime_error &error) {
        assert(std::string(error.what()) == "906");
        return;
    }
    assert(false && "Expected invalid-input panic");
}

static std::vector<double> take(RefCollection *array) {
    std::vector<double> result = array->values;
    delete array;
    return result;
}

static void fallingBody() {
    double w = createWorld(0, 10);
    double ground = createBody(w, 0, 0, 5, 0);
    double box = createBoxShape(10, 0.5, 0, 0, 0);
    double floor = createFixture(ground, box, 0, 0.2, 0, false);
    double ball = createBody(w, 2, 0, 0, 0);
    double circle = createCircleShape(0.5, 0, 0);
    double f = createFixture(ball, circle, 1, 0.2, 0, false);
    destroyShape(circle);
    destroyShape(box);
    assert(!isValid(circle));
    assert(isValid(f));
    assert(getFixtureBody(f) == ball);
    step(w, 1.0 / 60, 8, 3);
    auto first = take(getBodyState(ball));
    assert(first.size() == 8);
    assert(first[1] > 0 && first[1] < 0.01);
    close(first[4], 10.0 / 60);
    close(first[6], b2_pi * 0.25);
    for (int i = 0; i < 240; ++i)
        step(w, 1.0 / 60, 8, 3);
    auto state = take(getBodyState(ball));
    close(state[1], 4, 0.02);
    close(state[4], 0);
    auto contacts = take(getContacts(w));
    assert(contacts.size() == 2);
    assert((contacts[0] == floor && contacts[1] == f) ||
           (contacts[0] == f && contacts[1] == floor));
    assert(testPoint(f, 0, state[1]));
    assert(!testPoint(f, 3, state[1]));
    auto query = take(queryAABB(w, -1, 3, 1, 6));
    assert(query.size() == 2);
    auto hit = take(rayCast(w, 0, 0, 0, 10));
    assert(hit.size() == 6 && hit[0] == f);
    close(hit[2], state[1] - 0.5);
    close(hit[4], -1);
    close(hit[5], hit[2] / 10);
    assert(take(rayCast(w, 20, 0, 20, 10)).empty());
    setFixtureMaterial(f, 2, 0.7, 0.4);
    close(take(getBodyState(ball))[6], b2_pi * 0.5);
    b2Contact *contact = world(w)->GetContactList();
    close(contact->GetFriction(), std::sqrt(0.7 * 0.2));
    close(contact->GetRestitution(), 0.4);
    destroyWorld(w);
    assert(!isValid(w) && !isValid(ball) && !isValid(ground) && !isValid(floor) && !isValid(f));
}

static void shapesAndMotion() {
    double w = createWorld(0, 0);
    double b = createBody(w, 2, 2, 3, b2_pi / 2);
    double box = createBoxShape(1, 2, 0, 0, 0);
    double f = createFixture(b, box, 1, 0.2, 0, false);
    close(take(getBodyState(b))[6], 8);
    auto point = take(getWorldPoint(b, 1, 0));
    close(point[0], 2);
    close(point[1], 4);
    auto local = take(getLocalPoint(b, point[0], point[1]));
    close(local[0], 1);
    close(local[1], 0);
    applyLinearImpulseToCenter(b, 8, 0, true);
    close(take(getBodyState(b))[3], 1);
    applyForceToCenter(b, 8, 0, true);
    step(w, 0.1, 8, 3);
    close(take(getBodyState(b))[3], 1.1);
    step(w, 0.1, 8, 3);
    close(take(getBodyState(b))[3], 1.1);
    setDamping(b, 1, 1);
    setGravityScale(b, 0);
    setGravity(w, 0, 10);
    setLinearVelocity(b, 0.25, -0.75);
    setAngularVelocity(b, 0.5);
    close(take(getBodyState(b))[3], 0.25);
    close(take(getBodyState(b))[4], -0.75);
    close(take(getBodyState(b))[5], 0.5);
    applyTorque(b, 1, true);
    applyAngularImpulse(b, 1, true);
    applyForce(b, 0, 1, 0, 0, true);
    applyLinearImpulse(b, 0, 1, 0, 0, true);
    for (int flag = 0; flag <= 4; ++flag) {
        setBodyFlag(b, flag, false);
        assert(!getBodyFlag(b, flag));
        setBodyFlag(b, flag, true);
        assert(getBodyFlag(b, flag));
    }
    setWorldSleepingAllowed(w, false);
    setTransform(b, 1.25, 2.5, 0.75);
    auto state = take(getBodyState(b));
    close(state[0], 1.25);
    close(state[1], 2.5);
    close(state[2], 0.75);
    setBodyType(b, 1);
    assert(body(b)->GetType() == b2_kinematicBody);
    RefCollection polygon{{-1, -1, 1, -1, 1, 1, -1, 1}};
    double p = createPolygonShape(&polygon);
    RefCollection clockwise{{-1, 1, 1, 1, 1, -1, -1, -1}};
    double p2 = createPolygonShape(&clockwise);
    double edge = createEdgeShape(0, 0, 1, 0);
    double chain = createChainShape(&polygon, false);
    double loop = createChainShape(&polygon, true);
    double chainFixture = createFixture(b, chain, 0, 0.2, 0, false);
    auto query = take(queryAABB(w, -100, -100, 100, 100));
    assert(query.size() == 2);
    assert((query[0] == chainFixture || query[1] == chainFixture));
    destroyFixture(f);
    assert(!isValid(f) && isValid(b));
    destroyWorld(w);
    assert(isValid(box) && isValid(p) && isValid(edge) && isValid(chain));
    for (double shape : {box, p, p2, edge, chain, loop})
        destroyShape(shape);
}

static void jointsAndLifetime() {
    double w = createWorld(0, 0);
    double otherWorld = createWorld(0, 0);
    double a = createBody(w, 2, 0, 0, 0);
    double b = createBody(w, 2, 2, 0, 0);
    double c = createBody(otherWorld, 2, 0, 0, 0);
    double shape = createCircleShape(0.5, 0, 0);
    double fa = createFixture(a, shape, 1, 0.2, 0, false);
    double fb = createFixture(b, shape, 1, 0.2, 0, false);
    rejects([&] { createDistanceJoint(a, c, 0, 0, 1, 0, false); });
    rejects([&] { createRevoluteJoint(a, a, 0, 0, false); });
    double distance = createDistanceJoint(a, b, 0, 0, 2, 0, false);
    setDistanceJoint(distance, 4, 3, 5, 0, 0);
    auto value = static_cast<b2DistanceJoint *>(joint(distance, e_distanceJoint));
    close(value->GetMinLength(), 3);
    close(value->GetMaxLength(), 5);
    setDistanceJoint(distance, 0.5, 0.25, 0.75, 2, 0.5);
    close(value->GetMinLength(), 0.25);
    close(value->GetMaxLength(), 0.75);
    setDistanceJoint(distance, 2, 2, 2, 0, 0);
    applyLinearImpulseToCenter(b, 1, 1, true);
    for (int i = 0; i < 60; ++i)
        step(w, 1.0 / 60, 8, 3);
    close(value->GetCurrentLength(), 2, 0.01);
    double hinge = createRevoluteJoint(a, b, 1, 0, false);
    setRevoluteJointMotor(hinge, true, 0.25, 2);
    setRevoluteJointLimits(hinge, true, -0.5, 0.5);
    rejects([&] { setRevoluteJointMotor(distance, true, 1, 1); });
    destroyJoint(hinge);
    assert(!isValid(hinge) && isValid(distance));
    hinge = createRevoluteJoint(a, b, 1, 0, false);
    destroyBody(b);
    assert(!isValid(b) && !isValid(fb) && !isValid(distance) && !isValid(hinge));
    assert(isValid(a) && isValid(fa) && isValid(c));
    double replacement = createBody(w, 2, 0, 0, 0);
    assert(replacement != b && !isValid(b));
    destroyWorld(w);
    assert(isValid(c) && isValid(shape));
    destroyWorld(otherWorld);
    destroyShape(shape);
}

static void wheelSuspensionAndMotor() {
    double w = createWorld(0, 0);
    double a = createBody(w, 0, 0, 0, 0.4);
    double b = createBody(w, 2, 0, 1, 0);
    double shape = createCircleShape(0.4, 0, 0);
    createFixture(b, shape, 1, 0.9, 0, false);
    destroyShape(shape);
    double handle = createWheelJoint(a, b, 0, 1, 0, 7, false);
    auto wheel = static_cast<b2WheelJoint *>(joint(handle, e_wheelJoint));
    b2Vec2 axis = body(a)->GetWorldVector(wheel->GetLocalAxisA());
    close(axis.x, 0);
    close(axis.y, 1);
    close(wheel->GetJointTranslation(), 0);
    close(wheel->GetAnchorA().y, 1);
    close(wheel->GetAnchorB().y, 1);
    assert(!wheel->GetCollideConnected() && !wheel->IsMotorEnabled() && !wheel->IsLimitEnabled());
    close(wheel->GetStiffness(), 0);
    close(wheel->GetDamping(), 0);

    applyLinearImpulseToCenter(b, 1, 1, true);
    for (int i = 0; i < 6; ++i)
        step(w, 1.0 / 60, 8, 3);
    assert(wheel->GetJointTranslation() > 0.1);
    close(body(b)->GetPosition().x, 0);
    double mass = body(b)->GetMass();
    double omega = 2 * b2_pi * 4;
    setBodyFlag(b, 3, false);
    setWheelJointSuspension(handle, mass * omega * omega, 2 * mass * 0.7 * omega);
    assert(body(b)->IsAwake());
    close(wheel->GetStiffness(), mass * omega * omega);
    close(wheel->GetDamping(), 2 * mass * 0.7 * omega);
    for (int i = 0; i < 180; ++i)
        step(w, 1.0 / 60, 8, 3);
    close(wheel->GetJointTranslation(), 0);
    close(body(b)->GetLinearVelocity().y, 0);

    setWheelJointSuspension(handle, 0, 0);
    setWheelJointLimits(handle, true, -0.25, 0.25);
    setGravity(w, 0, 10);
    for (int i = 0; i < 120; ++i)
        step(w, 1.0 / 60, 8, 3);
    close(wheel->GetJointTranslation(), 0.25, 0.01);
    setGravity(w, 0, -10);
    setBodyFlag(b, 3, true);
    for (int i = 0; i < 120; ++i)
        step(w, 1.0 / 60, 8, 3);
    close(wheel->GetJointTranslation(), -0.25, 0.01);
    setWheelJointLimits(handle, false, -0.25, 0.25);
    for (int i = 0; i < 30; ++i)
        step(w, 1.0 / 60, 8, 3);
    assert(wheel->GetJointTranslation() < -0.5);
    setGravity(w, 0, 0);
    setWheelJointLimits(handle, true, 0, 0);
    for (double speed : {5.0, 0.0, -5.0}) {
        setWheelJointMotor(handle, true, speed, 20);
        assert(wheel->IsMotorEnabled());
        close(wheel->GetMotorSpeed(), speed);
        close(wheel->GetMaxMotorTorque(), 20);
        for (int i = 0; i < 120; ++i)
            step(w, 1.0 / 60, 8, 3);
        close(wheel->GetJointAngularSpeed(), speed);
        close(wheel->GetJointTranslation(), 0, 0.01);
    }
    setWheelJointMotor(handle, false, 0, 20);
    step(w, 1.0 / 60, 8, 3);
    assert(!wheel->IsMotorEnabled());
    close(wheel->GetJointAngularSpeed(), -5);
    destroyWorld(w);
    assert(!isValid(handle));
}

static void wheelValidationAndLifetime() {
    double w = createWorld(0, 0);
    double otherWorld = createWorld(0, 0);
    double a = createBody(w, 2, 0, 0, 0);
    double b = createBody(w, 2, 1, 0, 0);
    double c = createBody(otherWorld, 2, 0, 0, 0);
    double shape = createCircleShape(0.4, 0, 0);
    double f = createFixture(b, shape, 1, 0.2, 0, false);
    rejects([&] { createWheelJoint(a, c, 0, 0, 0, 1, false); });
    rejects([&] { createWheelJoint(a, a, 0, 0, 0, 1, false); });
    rejects([&] { createWheelJoint(w, b, 0, 0, 0, 1, false); });
    rejects([&] { createWheelJoint(a, f, 0, 0, 0, 1, false); });
    rejects([&] { createWheelJoint(a + 0.5, b, 0, 0, 0, 1, false); });
    rejects([&] { createWheelJoint(a, b, 0, 0, 0, 0, false); });
    double nan = std::numeric_limits<double>::quiet_NaN();
    double inf = std::numeric_limits<double>::infinity();
    for (double invalid : {nan, inf, -inf}) {
        rejects([&] { createWheelJoint(a, b, 0, 0, invalid, 1, false); });
        rejects([&] { createWheelJoint(a, b, 0, 0, 1, invalid, false); });
    }
    for (double invalid : {nan, inf, -inf, 1000001.0, -1000001.0}) {
        rejects([&] { createWheelJoint(a, b, invalid, 0, 0, 1, false); });
        rejects([&] { createWheelJoint(a, b, 0, invalid, 0, 1, false); });
    }
    for (double magnitude : {std::numeric_limits<double>::denorm_min(), 1.0, std::numeric_limits<double>::max()}) {
        double h = createWheelJoint(a, b, 0, 0, magnitude, -magnitude, true);
        auto wheel = static_cast<b2WheelJoint *>(joint(h, e_wheelJoint));
        close(wheel->GetLocalAxisA().x, std::sqrt(0.5));
        close(wheel->GetLocalAxisA().y, -std::sqrt(0.5));
        assert(wheel->GetCollideConnected());
        destroyJoint(h);
        assert(!isValid(h));
    }
    double h = createWheelJoint(a, b, 1, 0, 0, 1, false);
    double hinge = createRevoluteJoint(a, b, 1, 0, false);
    double distance = createDistanceJoint(a, b, 0, 0, 1, 0, false);
    for (double wrong : {w, a, shape, f, hinge, distance, h + 0.5, -1.0}) {
        rejects([&] { setWheelJointMotor(wrong, true, 1, 20); });
        rejects([&] { setWheelJointLimits(wrong, true, -0.25, 0.25); });
        rejects([&] { setWheelJointSuspension(wrong, 1, 1); });
    }
    rejects([&] { setRevoluteJointMotor(h, true, 1, 1); });
    rejects([&] { setDistanceJoint(h, 1, 1, 1, 0, 0); });
    for (double invalid : {nan, inf, -inf, 1000001.0, -1000001.0}) {
        rejects([&] { setWheelJointMotor(h, true, invalid, 20); });
        rejects([&] { setWheelJointLimits(h, true, invalid, 0.25); });
        rejects([&] { setWheelJointLimits(h, true, -0.25, invalid); });
    }
    for (double invalid : {nan, inf, -inf, -1.0, 1000001.0}) {
        rejects([&] { setWheelJointMotor(h, true, 1, invalid); });
        rejects([&] { setWheelJointSuspension(h, invalid, 1); });
        rejects([&] { setWheelJointSuspension(h, 1, invalid); });
    }
    rejects([&] { setWheelJointLimits(h, true, 0.25, -0.25); });
    auto wheel = static_cast<b2WheelJoint *>(joint(h, e_wheelJoint));
    assert(!wheel->IsMotorEnabled() && !wheel->IsLimitEnabled());
    close(wheel->GetStiffness(), 0);
    close(wheel->GetDamping(), 0);
    destroyBody(b);
    assert(!isValid(h) && !isValid(hinge) && !isValid(distance) && !isValid(f));
    rejects([&] { setWheelJointMotor(h, true, 1, 20); });
    rejects([&] { setWheelJointLimits(h, true, -0.25, 0.25); });
    rejects([&] { setWheelJointSuspension(h, 1, 1); });
    rejects([&] { destroyJoint(h); });
    rejects([&] { createWheelJoint(a, b, 0, 0, 0, 1, false); });
    b = createBody(w, 2, 1, 0, 0);
    double replacement = createWheelJoint(a, b, 1, 0, 0, 1, false);
    assert(replacement != h && !isValid(h));
    destroyBody(a);
    assert(!isValid(replacement) && isValid(b));
    a = createBody(w, 2, 0, 0, 0);
    h = createWheelJoint(a, b, 1, 0, 0, 1, false);
    destroyWorld(w);
    assert(!isValid(h) && !isValid(a) && !isValid(b));
    assert(isValid(c) && isValid(shape));
    rejects([&] { setWheelJointSuspension(h, 1, 1); });
    destroyWorld(otherWorld);
    destroyShape(shape);
}

static void sensorsAndFiltering() {
    double w = createWorld(0, 0);
    double a = createBody(w, 0, 0, 0, 0);
    double b = createBody(w, 2, 0, 0, 0);
    double shape = createCircleShape(1, 0, 0);
    double fa = createFixture(a, shape, 0, 0.2, 0, true);
    createFixture(b, shape, 1, 0.2, 0, false);
    step(w, 1.0 / 60, 8, 3);
    assert(take(getContacts(w)).size() == 2);
    close(take(getBodyState(b))[0], 0);
    setFixtureFilter(fa, 1, 0, 0);
    step(w, 1.0 / 60, 8, 3);
    assert(take(getContacts(w)).empty());
    setFixtureFilter(fa, 1, 65535, 0);
    setFixtureSensor(fa, false);
    step(w, 1.0 / 60, 8, 3);
    step(w, 1.0 / 60, 8, 3);
    assert(take(getContacts(w)).size() == 2);
    destroyWorld(w);
    destroyShape(shape);
}

static void invalidInputs() {
    double w = createWorld(0, 0);
    double b = createBody(w, 2, 0, 0, 0);
    rejects([&] { destroyBody(w); });
    rejects([&] { destroyWorld(-1); });
    rejects([&] { destroyWorld(w + 0.5); });
    rejects([&] { createWorld(std::numeric_limits<double>::quiet_NaN(), 0); });
    rejects([&] { setLinearVelocity(b, std::numeric_limits<double>::infinity(), 0); });
    rejects([&] { step(w, 0, 8, 3); });
    rejects([&] { step(w, 2, 8, 3); });
    rejects([&] { step(w, 0.1, 1.5, 3); });
    rejects([&] { createBody(w, 3, 0, 0, 0); });
    rejects([&] { createCircleShape(0, 0, 0); });
    rejects([&] { createBoxShape(-1, 1, 0, 0, 0); });
    rejects([&] { createPolygonShape(nullptr); });
    rejects([&] { createEdgeShape(0, 0, 0, 0); });
    rejects([&] { queryAABB(w, 2, 0, 1, 1); });
    rejects([&] { rayCast(w, 0, 0, 0, 0); });
    rejects([&] { setBodyFlag(b, 5, true); });
    for (RefCollection bad : {
             RefCollection{{0, 0, 1}}, RefCollection{{0, 0, 1, 0, 2, 0}},
             RefCollection{{0, 0, 1, 0, 0, 0}}, RefCollection{{0, 0, 2, 0, 1, 0.5, 2, 2, 0, 2}},
             RefCollection{{0, 0, 1, 1, 0, 1, 1, 0}}})
        rejects([&] { createPolygonShape(&bad); });
    RefCollection repeated{{0, 0, 1, 0, 0, 0}};
    rejects([&] { createChainShape(&repeated, true); });
    assert(!isValid(0) && !isValid(-1) && !isValid(1.5));
    assert(!isValid(std::numeric_limits<double>::quiet_NaN()));
    assert(!isValid(std::numeric_limits<double>::infinity()));
    destroyWorld(w);
    rejects([&] { getBodyState(b); });
    rejects([&] { destroyWorld(w); });
}

static void packedBindings() {
    double w = box2dNative::createWorld(0, 0);
    RefCollection bodyArgs{{w, 2, 1.25, 2.5, 0}};
    double b = box2dNative::createBody(&bodyArgs);
    RefCollection boxArgs{{0.5, 0.25, 0, 0, 0}};
    double shape = box2dNative::createBoxShape(&boxArgs);
    RefCollection fixtureArgs{{b, shape, 2, 0.2, 0.4, 1}};
    double f = box2dNative::createFixture(&fixtureArgs);
    auto state = take(box2dNative::getBodyState(b));
    close(state[0], 1.25);
    close(state[1], 2.5);
    close(state[6], 1);
    assert(fixture(f)->IsSensor());
    RefCollection impulseArgs{{b, 0.5, 0, 1.25, 2.5, 1}};
    box2dNative::applyLinearImpulse(&impulseArgs);
    close(take(box2dNative::getBodyState(b))[3], 0.5);
    RefCollection queryArgs{{w, -10, -10, 10, 10}};
    assert(take(box2dNative::queryAABB(&queryArgs)) == std::vector<double>{f});
    RefCollection rayArgs{{w, 1.25, 0, 1.25, 5}};
    auto hit = take(box2dNative::rayCast(&rayArgs));
    assert(hit.size() == 6 && hit[0] == f);
    close(hit[5], 0.45);
    RefCollection shortArgs{{w, 2}};
    rejects([&] { box2dNative::createBody(&shortArgs); });
    rejects([&] { box2dNative::createFixture(nullptr); });
    fixtureArgs.values[5] = 2;
    rejects([&] { box2dNative::createFixture(&fixtureArgs); });
    RefCollection otherArgs{{w, 2, -1, 2.5, 0}};
    double other = box2dNative::createBody(&otherArgs);
    RefCollection wheelArgs{{b, other, -1, 2.5, 0, 4, 1}};
    double wheelHandle = box2dNative::createWheelJoint(&wheelArgs);
    auto wheel = static_cast<b2WheelJoint *>(joint(wheelHandle, e_wheelJoint));
    assert(wheel->GetBodyA() == body(b) && wheel->GetBodyB() == body(other));
    assert(wheel->GetCollideConnected());
    close(wheel->GetAnchorA().x, -1);
    close(wheel->GetAnchorA().y, 2.5);
    close(wheel->GetLocalAxisA().y, 1);
    box2dNative::setWheelJointMotor(wheelHandle, true, -50, 20);
    box2dNative::setWheelJointLimits(wheelHandle, true, -0.25, 0.25);
    box2dNative::setWheelJointSuspension(wheelHandle, 300, 17);
    close(wheel->GetMotorSpeed(), -50);
    close(wheel->GetMaxMotorTorque(), 20);
    close(wheel->GetLowerLimit(), -0.25);
    close(wheel->GetUpperLimit(), 0.25);
    close(wheel->GetStiffness(), 300);
    close(wheel->GetDamping(), 17);
    RefCollection mouseArgs{{b, other, -1, 2.5, 100, 10, 1}};
    double mouseHandle = box2dNative::createMouseJoint(&mouseArgs);
    box2dNative::setMouseJointTarget(mouseHandle, 2, 3);
    auto mouse = static_cast<b2MouseJoint *>(joint(mouseHandle, e_mouseJoint));
    close(mouse->GetTarget().x, 2);
    close(mouse->GetTarget().y, 3);
    box2dNative::destroyJoint(mouseHandle);
    rejects([&] { box2dNative::createMouseJoint(nullptr); });
    mouseArgs.values.pop_back();
    rejects([&] { box2dNative::createMouseJoint(&mouseArgs); });
    rejects([&] { box2dNative::createWheelJoint(nullptr); });
    rejects([&] { box2dNative::createWheelJoint(&shortArgs); });
    wheelArgs.values[6] = 2;
    rejects([&] { box2dNative::createWheelJoint(&wheelArgs); });
    wheelArgs.values[6] = 0;
    wheelArgs.values.push_back(0);
    rejects([&] { box2dNative::createWheelJoint(&wheelArgs); });
    box2dNative::destroyShape(shape);
    box2dNative::destroyWorld(w);
    assert(!box2dNative::isValid(b));
}

static void mouseJointAndLifetime() {
    double w = createWorld(0, 0);
    double follower = createBody(w, 0, 0, 0, 0);
    double dragged = createBody(w, 2, 0, 0, 0);
    double shape = createCircleShape(0.5, 0, 0);
    createFixture(dragged, shape, 1, 0.2, 0, false);
    double handle = createMouseJoint(follower, dragged, 0, 0, 100, 10, 1);
    setMouseJointTarget(handle, 2, 3);
    auto mouse = static_cast<b2MouseJoint *>(joint(handle, e_mouseJoint));
    close(mouse->GetTarget().x, 2);
    close(mouse->GetTarget().y, 3);
    rejects([&] { setMouseJointTarget(createRevoluteJoint(follower, dragged, 0, 0, false), 0, 0); });
    double staticBody = createBody(w, 0, 0, 0, 0);
    rejects([&] { createMouseJoint(follower, staticBody, 0, 0, 100, 10, 1); });
    destroyBody(dragged);
    assert(!isValid(handle));
    destroyShape(shape);
    destroyWorld(w);
}

static void reusableTransforms() {
    double w = createWorld(0, 0);
    double b = createBody(w, 2, 1.25, -2.5, 0.75);
    RefCollection output{{0, 0, 0, 12345}};
    double *storage = output.values.data();
    int arraysBefore = pxt::arrayAllocations;
    int numbersBefore = pxt::numberConversions;
    int rootsBefore = pxt::rootCount;
    for (int i = 0; i < 100; ++i) {
        setTransform(b, 1.25 + i, -2.5, 0.75);
        box2dNative::readBodyTransform(b, &output);
        close(output.values[0], 1.25 + i);
        close(output.values[1], -2.5);
        close(output.values[2], 0.75);
        assert(output.values[3] == 12345);
        assert(output.values.size() == 4 && output.values.data() == storage);
    }
    assert(pxt::arrayAllocations == arraysBefore);
    assert(pxt::numberConversions == numbersBefore + 300);
    assert(pxt::rootCount == rootsBefore);
    RefCollection exact{{0, 0, 0}};
    readBodyTransform(b, &exact);
    assert(exact.values.size() == 3);
    close(exact.values[0], 100.25);
    RefCollection empty;
    RefCollection shortOutput{{1, 2}};
    rejects([&] { readBodyTransform(b, nullptr); });
    rejects([&] { readBodyTransform(b, &empty); });
    rejects([&] { readBodyTransform(b, &shortOutput); });
    assert(shortOutput.values == std::vector<double>({1, 2}));
    auto previous = output.values;
    rejects([&] { readBodyTransform(w, &output); });
    assert(output.values == previous);
    destroyWorld(w);
    rejects([&] { readBodyTransform(b, &output); });
    assert(output.values == previous);
}

static void integerBoxVertices() {
    double w = createWorld(0, 0);
    double b = createBody(w, 2, 0, 0, 0);
    RefCollection box{{1, 0.5, 0, 0}};
    RefCollection view{{8, 80, 60}};
    RefCollection output{{0, 0, 0, 0, 0, 0, 0, 0, 12345}};
    double *storage = output.values.data();
    int arraysBefore = pxt::arrayAllocations;
    int numbersBefore = pxt::numberConversions;
    int integersBefore = pxt::integerConversions;
    int rootsBefore = pxt::rootCount;
    box2dNative::readBodyBoxVertices(b, &box, &view, &output);
    assert(output.values == std::vector<double>({72, 56, 88, 56, 88, 64, 72, 64, 12345}));

    box.values = {0.5, 0.5, 0, 0};
    view.values = {1, 0, 0};
    readBodyBoxVertices(b, &box, &view, &output);
    assert(output.values == std::vector<double>({0, 0, 1, 0, 1, 1, 0, 1, 12345}));
    view.values = {1, -1, -1};
    readBodyBoxVertices(b, &box, &view, &output);
    assert(output.values == std::vector<double>({-1, -1, 0, -1, 0, 0, -1, 0, 12345}));

    setTransform(b, 1.25, -2.5, b2_pi / 2);
    box.values = {1, 0.5, 2, -1};
    view.values = {8, 80, 60};
    readBodyBoxVertices(b, &box, &view, &output);
    assert(output.values == std::vector<double>({102, 48, 102, 64, 94, 64, 94, 48, 12345}));

    for (int i = 0; i < 100; ++i) {
        setTransform(b, -1.25, 2.5, (i - 50) * 0.137);
        box.values = {0.24, 0.5, -0.75, 0.125};
        readBodyBoxVertices(b, &box, &view, &output);
        const double local[4][2] = {{-0.99, -0.375}, {-0.51, -0.375}, {-0.51, 0.625}, {-0.99, 0.625}};
        double angle = body(b)->GetAngle();
        for (int corner = 0; corner < 4; ++corner) {
            double x = 80 + 8 * (-1.25 + cos(angle) * local[corner][0] - sin(angle) * local[corner][1]);
            double y = 60 + 8 * (2.5 + sin(angle) * local[corner][0] + cos(angle) * local[corner][1]);
            assert(output.values[2 * corner] == floor(x + 0.5));
            assert(output.values[2 * corner + 1] == floor(y + 0.5));
        }
        assert(output.values.data() == storage && output.values.size() == 9);
        assert(output.values[8] == 12345);
    }
    assert(pxt::arrayAllocations == arraysBefore);
    assert(pxt::numberConversions == numbersBefore);
    assert(pxt::integerConversions == integersBefore + 104 * 8);
    assert(pxt::rootCount == rootsBefore);

    RefCollection shortBox{{1, 1, 0}};
    RefCollection shortView{{8, 80}};
    RefCollection shortOutput{{0, 0, 0, 0, 0, 0, 0}};
    auto unchanged = output.values;
    rejects([&] { readBodyBoxVertices(b, nullptr, &view, &output); });
    rejects([&] { readBodyBoxVertices(b, &box, nullptr, &output); });
    rejects([&] { readBodyBoxVertices(b, &box, &view, nullptr); });
    rejects([&] { readBodyBoxVertices(b, &shortBox, &view, &output); });
    rejects([&] { readBodyBoxVertices(b, &box, &shortView, &output); });
    rejects([&] { readBodyBoxVertices(b, &box, &view, &shortOutput); });
    box.values[0] = -1;
    rejects([&] { readBodyBoxVertices(b, &box, &view, &output); });
    box.values[0] = 0.5;
    view.values[0] = 0;
    rejects([&] { readBodyBoxVertices(b, &box, &view, &output); });
    view.values[0] = std::numeric_limits<double>::quiet_NaN();
    rejects([&] { readBodyBoxVertices(b, &box, &view, &output); });
    view.values = {8, std::numeric_limits<double>::infinity(), 60};
    rejects([&] { readBodyBoxVertices(b, &box, &view, &output); });
    view.values = {8, 80, 60};
    rejects([&] { readBodyBoxVertices(w, &box, &view, &output); });
    assert(output.values == unchanged);

    setTransform(b, 0, 0, 0);
    box.values = {1, 1, 0, 0};
    view.values = {30000, 0, 0};
    readBodyBoxVertices(b, &box, &view, &output);
    assert(output.values == std::vector<double>({-30000, -30000, 30000, -30000, 30000, 30000, -30000, 30000, 12345}));
    unchanged = output.values;
    view.values[1] = 1; // The first corner fits, but a later corner is out of range.
    rejects([&] { readBodyBoxVertices(b, &box, &view, &output); });
    assert(output.values == unchanged);
    destroyWorld(w);
    rejects([&] { readBodyBoxVertices(b, &box, &view, &output); });
    assert(output.values == unchanged);
}

static void carDemo() {
    double w = createWorld(0, 10);
    double ground = createBody(w, 0, 0, 2, 0);
    double floor = createBoxShape(200, 0.5, 0, 0, 0);
    createFixture(ground, floor, 0, 0.6, 0, false);
    destroyShape(floor);
    double chassis = createBody(w, 2, 0, 0, 0);
    RefCollection vertices{{-1.5, 0.5, 1.5, 0.5, 1.5, 0, 0, -0.9, -1.15, -0.9, -1.5, -0.2}};
    double hull = createPolygonShape(&vertices);
    createFixture(chassis, hull, 1, 0.2, 0, false);
    destroyShape(hull);
    double circle = createCircleShape(0.4, 0, 0);
    std::vector<double> wheels;
    std::vector<double> joints;
    double omega = 2 * b2_pi * 4;
    for (double x : {-1.0, 1.0}) {
        double wheel = createBody(w, 2, x, 0.65, 0);
        createFixture(wheel, circle, 1, 0.9, 0, false);
        double h = createWheelJoint(chassis, wheel, x, 0.65, 0, 1, false);
        double mass = body(wheel)->GetMass();
        setWheelJointSuspension(h, mass * omega * omega, 2 * mass * 0.7 * omega);
        setWheelJointLimits(h, true, -0.25, 0.25);
        wheels.push_back(wheel);
        joints.push_back(h);
    }
    destroyShape(circle);
    assert(world(w)->GetBodyCount() == 4 && world(w)->GetJointCount() == 2);
    auto advance = [&](int frames) {
        for (int i = 0; i < frames; ++i) {
            step(w, 1.0 / 60, 8, 3);
            for (double b : {chassis, wheels[0], wheels[1]}) {
                auto state = take(getBodyState(b));
                for (double value : state)
                    assert(std::isfinite(value));
                assert(std::abs(state[0]) < 190 && std::abs(state[1]) < 2);
            }
            assert(std::abs(body(chassis)->GetAngle()) < 0.7);
            for (double h : joints) {
                auto wheel = static_cast<b2WheelJoint *>(joint(h, e_wheelJoint));
                assert(std::abs(wheel->GetJointTranslation()) < 0.27);
            }
        }
    };
    advance(120);
    double start = body(chassis)->GetPosition().x;
    setWheelJointMotor(joints[0], true, 50, 20);
    advance(240);
    double forward = body(chassis)->GetPosition().x;
    assert(forward > start + 15 && body(chassis)->GetLinearVelocity().x > 5);
    setWheelJointMotor(joints[0], true, 0, 20);
    advance(600);
    assert(std::abs(body(chassis)->GetLinearVelocity().x) < 0.1);
    double stopped = body(chassis)->GetPosition().x;
    advance(60);
    close(body(chassis)->GetPosition().x, stopped, 0.1);
    setWheelJointMotor(joints[0], true, -50, 20);
    advance(300);
    assert(body(chassis)->GetPosition().x < stopped - 15);
    assert(body(chassis)->GetLinearVelocity().x < -5);
    std::cout << "Car: forward " << forward - start << "m, reverse "
              << body(chassis)->GetPosition().x - stopped << "m; stable braking\n";
    destroyWorld(w);
    for (double h : {ground, chassis, wheels[0], wheels[1], joints[0], joints[1]})
        assert(!isValid(h));
}

static void carCourseDemo() {
    // Match test-car.ts, including reflected-Y terrain, suspension, and the 16-body budget.
    double w = createWorld(0, 10);
    double ground = createBody(w, 0, 0, 0, 0);
    RefCollection firstRoad{{-20, -20, -20, 0, 20, 0}};
    const double hills[] = {0.25, 1, 4, 0, 0, -1, -2, -2, -1.25, 0};
    for (int repeat = 0; repeat < 2; ++repeat) {
        for (int i = 0; i < 10; ++i) {
            firstRoad.values.push_back(25 + (repeat * 10 + i) * 5);
            firstRoad.values.push_back(-hills[i]);
        }
    }
    firstRoad.values.push_back(160);
    firstRoad.values.push_back(0);
    RefCollection secondRoad{{176, 0, 216, 0, 226, -5}};
    RefCollection thirdRoad{{236, 0, 276, 0, 276, -20}};
    for (RefCollection *road : {&firstRoad, &secondRoad, &thirdRoad}) {
        double shape = createChainShape(road, false);
        createFixture(ground, shape, 0, 0.6, 0, false);
        destroyShape(shape);
    }
    double seesaw = createBody(w, 2, 140, -1, 0);
    double shape = createBoxShape(10, 0.25, 0, 0, 0);
    createFixture(seesaw, shape, 1, 0.6, 0, false);
    destroyShape(shape);
    double hinge = createRevoluteJoint(ground, seesaw, 140, -1, false);
    setRevoluteJointLimits(hinge, true, -8 * b2_pi / 180, 8 * b2_pi / 180);
    applyAngularImpulse(seesaw, -100, true);
    shape = createBoxShape(1, 0.125, 0, 0, 0);
    double previous = ground;
    std::vector<double> planks;
    for (int i = 0; i < 8; ++i) {
        double plank = createBody(w, 2, 161 + 2 * i, 0.125, 0);
        createFixture(plank, shape, 1, 0.6, 0, false);
        createRevoluteJoint(previous, plank, 160 + 2 * i, 0.125, false);
        previous = plank;
        planks.push_back(plank);
    }
    createRevoluteJoint(previous, ground, 176, 0.125, false);
    destroyShape(shape);
    shape = createBoxShape(0.5, 0.5, 0, 0, 0);
    for (int i = 0; i < 3; ++i) {
        double crate = createBody(w, 2, 206, -0.5 - i, 0);
        createFixture(crate, shape, 0.5, 0.6, 0, false);
    }
    destroyShape(shape);
    double chassis = createBody(w, 2, 0, -1, 0);
    RefCollection chassisVertices{{-1.5, 0.5, 1.5, 0.5, 1.5, 0, 0, -0.9, -1.15, -0.9, -1.5, -0.2}};
    shape = createPolygonShape(&chassisVertices);
    createFixture(chassis, shape, 1, 0.2, 0, false);
    destroyShape(shape);
    shape = createCircleShape(0.4, 0, 0);
    double omega = 2 * b2_pi * 4;
    double wheelMass = b2_pi * 0.4 * 0.4;
    std::vector<double> springs;
    for (const auto &position : {b2Vec2(-1, -0.35), b2Vec2(1, -0.4)}) {
        double wheel = createBody(w, 2, position.x, position.y, 0);
        createFixture(wheel, shape, 1, 0.9, 0, false);
        double spring = createWheelJoint(chassis, wheel, position.x, position.y, 0, 1, false);
        setWheelJointSuspension(spring, wheelMass * omega * omega, 2 * wheelMass * 0.7 * omega);
        setWheelJointLimits(spring, true, -0.25, 0.25);
        springs.push_back(spring);
    }
    destroyShape(shape);
    setWheelJointMotor(springs[0], true, 0, 20);
    setWheelJointMotor(springs[1], false, 0, 10);
    assert(world(w)->GetBodyCount() == 16);
    for (int i = 0; i < 120; ++i)
        step(w, 1.0 / 60, 8, 3);
    assert(body(chassis)->GetPosition().y < 0);
    setWheelJointMotor(springs[0], true, 50, 20);
    float maxAngle = 0;
    float maxAngleX = 0;
    bool touchedSeesaw = false;
    bool touchedBridge = false;
    b2Body *carBodies[] = {body(chassis), joint(springs[0], e_wheelJoint)->GetBodyB(),
                          joint(springs[1], e_wheelJoint)->GetBodyB()};
    int frames = 0;
    for (; frames < 3600 && body(chassis)->GetPosition().x < 195; ++frames) {
        step(w, 1.0 / 60, 8, 3);
        for (b2Body *b = world(w)->GetBodyList(); b; b = b->GetNext()) {
            assert(std::isfinite(b->GetPosition().x) && std::isfinite(b->GetPosition().y));
            assert(std::isfinite(b->GetAngle()));
        }
        assert(body(chassis)->GetPosition().y < 20);
        for (b2Contact *contact = world(w)->GetContactList(); contact; contact = contact->GetNext()) {
            if (!contact->IsTouching()) continue;
            b2Body *a = contact->GetFixtureA()->GetBody();
            b2Body *b = contact->GetFixtureB()->GetBody();
            for (b2Body *carBody : carBodies) {
                b2Body *obstacle = a == carBody ? b : b == carBody ? a : nullptr;
                if (obstacle == body(seesaw)) touchedSeesaw = true;
                for (double plank : planks)
                    if (obstacle == body(plank)) touchedBridge = true;
            }
        }
        if (fabs(body(chassis)->GetAngle()) > maxAngle) {
            maxAngle = fabs(body(chassis)->GetAngle());
            maxAngleX = body(chassis)->GetPosition().x;
        }
    }
    std::cout << "Car course: x=" << body(chassis)->GetPosition().x
              << ", y=" << body(chassis)->GetPosition().y
              << ", angle=" << body(chassis)->GetAngle()
              << ", max angle=" << maxAngle << " at x=" << maxAngleX
              << ", frames=" << frames << std::endl;
    assert(body(chassis)->GetPosition().x >= 195);
    assert(touchedSeesaw && touchedBridge);
    setWheelJointMotor(springs[0], true, 0, 20);
    for (int i = 0; i < 600; ++i)
        step(w, 1.0 / 60, 8, 3);
    std::cout << "Car course after braking: x=" << body(chassis)->GetPosition().x
              << ", y=" << body(chassis)->GetPosition().y
              << ", angle=" << body(chassis)->GetAngle()
              << ", speed=" << body(chassis)->GetLinearVelocity().Length() << std::endl;
    assert(std::abs(body(chassis)->GetAngle()) < 0.5);
    assert(body(chassis)->GetPosition().y < 0);
    assert(body(chassis)->GetLinearVelocity().Length() < 0.1);
    destroyWorld(w);
    assert(!isValid(chassis) && !isValid(springs[0]) && !isValid(springs[1]));
}

static void tumblerDemo() {
    double w = createWorld(0, 10);
    double ground = createBody(w, 0, 0, 0, 0);
    double container = createBody(w, 2, 0, 0, 0);
    setBodyFlag(container, 2, false);
    const double walls[4][4] = {
        {0.2, 4.2, 4, 0}, {0.2, 4.2, -4, 0},
        {4.2, 0.2, 0, 4}, {4.2, 0.2, 0, -4}
    };
    for (const auto &wall : walls) {
        double shape = createBoxShape(wall[0], wall[1], wall[2], wall[3], 0);
        createFixture(container, shape, 5, 0.5, 0, false);
        destroyShape(shape);
    }
    double motor = createRevoluteJoint(ground, container, 0, 0, false);
    setRevoluteJointMotor(motor, true, 0.4, 10000);
    double shape = createBoxShape(0.24, 0.24, 0, 0, 0);
    std::vector<double> boxes;
    double angleAtReverse = 0;
    for (int frame = 0; frame < 1800; ++frame) {
        if (frame % 12 == 0 && boxes.size() < 48) {
            int index = (int)boxes.size();
            double b = createBody(w, 2, (index % 3 - 1) * 0.6, 0, (index % 5) * 0.15);
            createFixture(b, shape, 1, 0.3, 0.1, false);
            boxes.push_back(b);
        }
        if (frame == 900) {
            angleAtReverse = body(container)->GetAngle();
            assert(angleAtReverse > 5);
            setRevoluteJointMotor(motor, true, -0.4, 10000);
        }
        step(w, 1.0 / 60, 8, 3);
        for (double b : boxes) {
            b2Vec2 position = body(container)->GetLocalPoint(body(b)->GetPosition());
            assert(std::isfinite(position.x) && std::isfinite(position.y));
            assert(std::abs(position.x) < 4 && std::abs(position.y) < 4);
        }
    }
    assert(boxes.size() == 48);
    assert(body(container)->GetAngle() < angleAtReverse - 5);
    close(body(container)->GetPosition().x, 0);
    close(body(container)->GetPosition().y, 0);
    destroyWorld(w);
    assert(!isValid(container) && !isValid(motor) && !isValid(boxes.back()));
    assert(isValid(shape));
    destroyShape(shape);
}

int main() {
    fallingBody();
    shapesAndMotion();
    jointsAndLifetime();
    wheelSuspensionAndMotor();
    wheelValidationAndLifetime();
    sensorsAndFiltering();
    invalidInputs();
    packedBindings();
    mouseJointAndLifetime();
    reusableTransforms();
    integerBoxVertices();
    carDemo();
    carCourseDemo();
    tumblerDemo();
    assert(entries == nullptr);
    assert(pxt::rootCount == 0);
    std::cout << "All native Box2D binding tests passed\n";
}
