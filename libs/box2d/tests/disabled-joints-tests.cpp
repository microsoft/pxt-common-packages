#include "../native.cpp"
#include <cassert>

using namespace box2d_native;

static void anchors(RefBox2D *joint, double ax, double ay, double bx, double by) {
    RefCollection *values = getJointAnchors(joint);
    assert(values->values.size() == 4);
    assert((double)values->values[0] == ax);
    assert((double)values->values[1] == ay);
    assert((double)values->values[2] == bx);
    assert((double)values->values[3] == by);
    delete values;
}

int main() {
    for (int type = 0; type <= 6; ++type)
        assert(!isJointTypeEnabled(type));

    auto worldHandle = createWorld(0, 0);
    auto bodyA = createBody(worldHandle, 2, 0, 0, 0);
    auto bodyB = createBody(worldHandle, 2, 1, 0, 0);

    auto distance = createDistanceJoint(bodyA, bodyB, 1, 2, 3, 4, false);
    auto revolute = createRevoluteJoint(bodyA, bodyB, 5, 6, false);
    auto prismatic = createPrismaticJoint(bodyA, bodyB, 7, 8, 0, 0, false);
    auto pulley = createPulleyJoint(
        bodyA, bodyB, 0, 0, 0, 0, 9, 10, 11, 12, 0, false
    );
    auto weld = createWeldJoint(bodyA, bodyB, 13, 14, false);
    auto wheel = createWheelJoint(bodyA, bodyB, 15, 16, 0, 0, false);
    auto mouse = createMouseJoint(bodyA, bodyB, 17, 18, -1, -1, -1);

    assert(world(worldHandle)->GetJointCount() == 0);
    for (auto joint : {distance, revolute, prismatic, pulley, weld, wheel, mouse})
        assert(isValid(joint));

    anchors(distance, 1, 2, 3, 4);
    anchors(revolute, 5, 6, 5, 6);
    anchors(prismatic, 7, 8, 7, 8);
    anchors(pulley, 9, 10, 11, 12);
    anchors(weld, 13, 14, 13, 14);
    anchors(wheel, 15, 16, 15, 16);
    anchors(mouse, 17, 18, 17, 18);

    setDistanceJoint(distance, -1, -1, -1, -1, -1);
    setRevoluteJointMotor(revolute, true, 0, -1);
    setRevoluteJointLimits(revolute, true, 1, -1);
    setPrismaticJointMotor(prismatic, true, 0, -1);
    setPrismaticJointLimits(prismatic, true, 1, -1);
    setWheelJointMotor(wheel, true, 0, -1);
    setWheelJointLimits(wheel, true, 1, -1);
    setWheelJointSuspension(wheel, -1, -1);
    setMouseJointTarget(mouse, 100, 100);

    destroyJoint(weld);
    assert(!isValid(weld));
    destroyBody(bodyA);
    for (auto joint : {distance, revolute, prismatic, pulley, wheel, mouse})
        assert(!isValid(joint));

    destroyWorld(worldHandle);
    return 0;
}
