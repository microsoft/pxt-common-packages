#pragma once

#include <stdexcept>
#include <vector>
#include <cassert>

// A host-only model of the numeric PXT ABI, not a simulator implementation.
namespace pxt {
using TValue = double;
using TNumber = TValue;
struct RefCollection {
    std::vector<TValue> values;
};
static int numberConversions;
static int integerConversions;
static int arrayAllocations;
inline TValue fromDouble(double value) { ++numberConversions; return value; }
inline TValue fromInt(int value) {
    assert(value >= -(1 << 30) && value < (1 << 30));
    ++integerConversions;
    return value;
}
inline double toDouble(TValue value) { return value; }
static int rootCount;
inline void registerGC(TValue *) { ++rootCount; }
inline void unregisterGC(TValue *) { --rootCount; }
inline void registerGCObj(RefCollection *) { ++rootCount; }
inline void unregisterGCObj(RefCollection *) { --rootCount; }
namespace Array_ {
inline RefCollection *mk() { ++arrayAllocations; return new RefCollection(); }
inline void push(RefCollection *array, TValue value) { array->values.push_back(value); }
inline TValue getAt(RefCollection *array, int index) { return array->values.at(index); }
inline void setAt(RefCollection *array, int index, TValue value) { array->values.at(index) = value; }
inline int length(RefCollection *array) { return (int)array->values.size(); }
}
[[noreturn]] inline void target_panic(int code) { throw std::runtime_error(std::to_string(code)); }
}
