#pragma once

#include <stdint.h>
#include <vector>

extern "C" void box2d_panic(int code)
    __attribute__((import_module("env"), import_name("box2d_panic")));

namespace pxt {
using TValue = double;
using TNumber = double;

struct RefCollection {
    std::vector<TValue> values;
};

inline TValue fromDouble(double value) { return value; }
inline TValue fromInt(int value) { return value; }
inline double toDouble(TValue value) { return value; }
inline void registerGC(TValue *) {}
inline void unregisterGC(TValue *) {}
inline void registerGCObj(RefCollection *) {}
inline void unregisterGCObj(RefCollection *) {}

[[noreturn]] inline void target_panic(int code) {
    box2d_panic(code);
    __builtin_unreachable();
}

namespace Array_ {
inline RefCollection *mk() {
    return new RefCollection();
}

inline void push(RefCollection *array, TValue value) {
    array->values.push_back(value);
}

inline TValue getAt(RefCollection *array, int index) {
    if (!array || index < 0 || index >= (int)array->values.size())
        target_panic(906);
    return array->values[index];
}

inline void setAt(RefCollection *array, int index, TValue value) {
    if (!array || index < 0 || index >= (int)array->values.size())
        target_panic(906);
    array->values[index] = value;
}

inline int length(RefCollection *array) {
    return array ? (int)array->values.size() : 0;
}
}
}
