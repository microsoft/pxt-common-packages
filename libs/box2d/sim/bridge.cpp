#include "pxt.h"
#include "../native-api.h"

#include <stddef.h>

using namespace pxt;

static std::vector<double> result;

static RefCollection input(const double *values, int length) {
    RefCollection collection;
    if (length < 0 || (length && !values))
        target_panic(906);
    collection.values.assign(values, values + length);
    return collection;
}

static int publish(RefCollection *collection) {
    result.swap(collection->values);
    delete collection;
    return (int)result.size();
}

extern "C" {

const double *bx_result() {
    return result.data();
}

int bx_createWorld(double gravityX, double gravityY) {
    return (int)box2d_native::createWorld(gravityX, gravityY);
}

void bx_destroyWorld(double world) {
    box2d_native::destroyWorld(world);
}

bool bx_isValid(double handle) {
    return box2d_native::isValid(handle);
}

void bx_setGravity(double world, double x, double y) {
    box2d_native::setGravity(world, x, y);
}

void bx_step(double world, double seconds, double velocityIterations, double positionIterations) {
    box2d_native::step(world, seconds, velocityIterations, positionIterations);
}

void bx_setWorldSleepingAllowed(double world, bool allowed) {
    box2d_native::setWorldSleepingAllowed(world, allowed);
}

int bx_createBody(double world, double type, double x, double y, double angle) {
    return (int)box2d_native::createBody(world, type, x, y, angle);
}

void bx_destroyBody(double body) {
    box2d_native::destroyBody(body);
}

int bx_getBodyState(double body) {
    return publish(box2d_native::getBodyState(body));
}

void bx_readBodyTransform(double body, double *output, int length) {
    RefCollection values = input(output, length);
    box2d_native::readBodyTransform(body, &values);
    for (int i = 0; i < length; ++i)
        output[i] = values.values[i];
}

void bx_readBodyBoxVertices(double body, const double *box, int boxLength,
                            const double *view, int viewLength, double *output, int outputLength) {
    RefCollection boxValues = input(box, boxLength);
    RefCollection viewValues = input(view, viewLength);
    RefCollection outputValues = input(output, outputLength);
    box2d_native::readBodyBoxVertices(body, &boxValues, &viewValues, &outputValues);
    for (int i = 0; i < outputLength; ++i)
        output[i] = outputValues.values[i];
}

void bx_setTransform(double body, double x, double y, double angle) {
    box2d_native::setTransform(body, x, y, angle);
}

void bx_setLinearVelocity(double body, double x, double y) {
    box2d_native::setLinearVelocity(body, x, y);
}

void bx_setAngularVelocity(double body, double velocity) {
    box2d_native::setAngularVelocity(body, velocity);
}

void bx_setBodyType(double body, double type) {
    box2d_native::setBodyType(body, type);
}

void bx_setDamping(double body, double linear, double angular) {
    box2d_native::setDamping(body, linear, angular);
}

void bx_setGravityScale(double body, double scale) {
    box2d_native::setGravityScale(body, scale);
}

void bx_setBodyFlag(double body, double flag, bool enabled) {
    box2d_native::setBodyFlag(body, flag, enabled);
}

bool bx_getBodyFlag(double body, double flag) {
    return box2d_native::getBodyFlag(body, flag);
}

void bx_applyForce(double body, double x, double y, double pointX, double pointY, bool wake) {
    box2d_native::applyForce(body, x, y, pointX, pointY, wake);
}

void bx_applyForceToCenter(double body, double x, double y, bool wake) {
    box2d_native::applyForceToCenter(body, x, y, wake);
}

void bx_applyLinearImpulse(double body, double x, double y, double pointX, double pointY, bool wake) {
    box2d_native::applyLinearImpulse(body, x, y, pointX, pointY, wake);
}

void bx_applyLinearImpulseToCenter(double body, double x, double y, bool wake) {
    box2d_native::applyLinearImpulseToCenter(body, x, y, wake);
}

void bx_applyTorque(double body, double torque, bool wake) {
    box2d_native::applyTorque(body, torque, wake);
}

void bx_applyAngularImpulse(double body, double impulse, bool wake) {
    box2d_native::applyAngularImpulse(body, impulse, wake);
}

int bx_getWorldPoint(double body, double x, double y) {
    return publish(box2d_native::getWorldPoint(body, x, y));
}

int bx_getLocalPoint(double body, double x, double y) {
    return publish(box2d_native::getLocalPoint(body, x, y));
}

int bx_createCircleShape(double radius, double centerX, double centerY) {
    return (int)box2d_native::createCircleShape(radius, centerX, centerY);
}

int bx_createBoxShape(double halfWidth, double halfHeight, double centerX, double centerY, double angle) {
    return (int)box2d_native::createBoxShape(halfWidth, halfHeight, centerX, centerY, angle);
}

int bx_createPolygonShape(const double *vertices, int length) {
    RefCollection values = input(vertices, length);
    return (int)box2d_native::createPolygonShape(&values);
}

int bx_createEdgeShape(double x1, double y1, double x2, double y2) {
    return (int)box2d_native::createEdgeShape(x1, y1, x2, y2);
}

int bx_createChainShape(const double *vertices, int length, bool loop) {
    RefCollection values = input(vertices, length);
    return (int)box2d_native::createChainShape(&values, loop);
}

void bx_destroyShape(double shape) {
    box2d_native::destroyShape(shape);
}

int bx_createFixture(double body, double shape, double density, double friction,
                     double restitution, bool sensor) {
    return (int)box2d_native::createFixture(body, shape, density, friction, restitution, sensor);
}

void bx_destroyFixture(double fixture) {
    box2d_native::destroyFixture(fixture);
}

int bx_getFixtureBody(double fixture) {
    return (int)box2d_native::getFixtureBody(fixture);
}

void bx_setFixtureMaterial(double fixture, double density, double friction, double restitution) {
    box2d_native::setFixtureMaterial(fixture, density, friction, restitution);
}

void bx_setFixtureSensor(double fixture, bool sensor) {
    box2d_native::setFixtureSensor(fixture, sensor);
}

void bx_setFixtureFilter(double fixture, double categoryBits, double maskBits, double groupIndex) {
    box2d_native::setFixtureFilter(fixture, categoryBits, maskBits, groupIndex);
}

bool bx_testPoint(double fixture, double x, double y) {
    return box2d_native::testPoint(fixture, x, y);
}

int bx_createDistanceJoint(double bodyA, double bodyB, double anchorAX, double anchorAY,
                           double anchorBX, double anchorBY, bool collideConnected) {
    return (int)box2d_native::createDistanceJoint(
        bodyA, bodyB, anchorAX, anchorAY, anchorBX, anchorBY, collideConnected);
}

void bx_setDistanceJoint(double joint, double length, double minLength, double maxLength,
                         double stiffness, double damping) {
    box2d_native::setDistanceJoint(joint, length, minLength, maxLength, stiffness, damping);
}

int bx_createRevoluteJoint(double bodyA, double bodyB, double anchorX, double anchorY,
                           bool collideConnected) {
    return (int)box2d_native::createRevoluteJoint(
        bodyA, bodyB, anchorX, anchorY, collideConnected);
}

void bx_setRevoluteJointMotor(double joint, bool enabled, double speed, double maxTorque) {
    box2d_native::setRevoluteJointMotor(joint, enabled, speed, maxTorque);
}

void bx_setRevoluteJointLimits(double joint, bool enabled, double lower, double upper) {
    box2d_native::setRevoluteJointLimits(joint, enabled, lower, upper);
}

int bx_createWheelJoint(double bodyA, double bodyB, double anchorX, double anchorY,
                        double axisX, double axisY, bool collideConnected) {
    return (int)box2d_native::createWheelJoint(
        bodyA, bodyB, anchorX, anchorY, axisX, axisY, collideConnected);
}

void bx_setWheelJointMotor(double joint, bool enabled, double speed, double maxTorque) {
    box2d_native::setWheelJointMotor(joint, enabled, speed, maxTorque);
}

void bx_setWheelJointLimits(double joint, bool enabled, double lower, double upper) {
    box2d_native::setWheelJointLimits(joint, enabled, lower, upper);
}

void bx_setWheelJointSuspension(double joint, double stiffness, double damping) {
    box2d_native::setWheelJointSuspension(joint, stiffness, damping);
}

int bx_createMouseJoint(double bodyA, double bodyB, double anchorX, double anchorY,
                        double maxForce, double stiffness, double damping) {
    return (int)box2d_native::createMouseJoint(
        bodyA, bodyB, anchorX, anchorY, maxForce, stiffness, damping);
}

void bx_setMouseJointTarget(double joint, double x, double y) {
    box2d_native::setMouseJointTarget(joint, x, y);
}

void bx_destroyJoint(double joint) {
    box2d_native::destroyJoint(joint);
}

int bx_getContacts(double world) {
    return publish(box2d_native::getContacts(world));
}

int bx_queryAABB(double world, double minX, double minY, double maxX, double maxY) {
    return publish(box2d_native::queryAABB(world, minX, minY, maxX, maxY));
}

int bx_rayCast(double world, double x1, double y1, double x2, double y2) {
    return publish(box2d_native::rayCast(world, x1, y1, x2, y2));
}

}
