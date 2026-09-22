#pragma once

#include <new>
#include <stdint.h>
#include <vector>

extern "C" void box2d_panic(int code)
    __attribute__((import_module("env"), import_name("box2d_panic")));

namespace pxt {
struct TValue {
    bool object;
    double number;
    uintptr_t pointer;

    TValue() : object(false), number(0), pointer(0) {}
    TValue(double value) : object(false), number(value), pointer(0) {}
    TValue(int value) : TValue((double)value) {}
    TValue(uintptr_t value) : object(true), number(0), pointer(value) {}
    template <typename T>
    TValue(T *value) : object(true), number(0), pointer((uintptr_t)value) {}

    operator double() const {
        return object ? (double)pointer : number;
    }

    explicit operator uintptr_t() const {
        return object ? pointer : (uintptr_t)number;
    }

    bool operator==(const TValue &other) const {
        return object == other.object &&
            (object ? pointer == other.pointer : number == other.number);
    }
};

using TNumber = TValue;
enum class ValType { Object };
enum class BuiltInType : uint16_t { User0 = 16 };
static const uint8_t VTABLE_MAGIC = 0xf6;
using PVoid = void;
struct VTable {
    uint16_t numbytes;
    ValType objectType;
    uint8_t magic;
    PVoid *ifaceTable;
    BuiltInType classNo;
    uint16_t reserved;
    uint32_t ifaceHashMult;
    PVoid *methods[8];
};
class RefObject {
  public:
    const VTable *vtable;
    explicit RefObject(const VTable *vtable) : vtable(vtable) {}
};
struct RefCollection {
    std::vector<TValue> values;
};

inline TValue fromDouble(double value) { return TValue(value); }
inline TValue fromInt(int value) { return TValue(value); }
inline double toDouble(TValue value) { return (double)value; }
inline void registerGC(TValue *) {}
inline void unregisterGC(TValue *) {}
inline void registerGCObj(RefCollection *) {}
inline void unregisterGCObj(RefCollection *) {}
inline void gcScan(TValue) {}
inline void *gcAllocate(int size) { return ::operator new(size); }

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

inline TValue removeAt(RefCollection *array, int index) {
    TValue result = getAt(array, index);
    array->values.erase(array->values.begin() + index);
    return result;
}

inline int length(RefCollection *array) {
    return array ? (int)array->values.size() : 0;
}
}
}

#define TOWORDS(bytes) (((bytes) + sizeof(uintptr_t) - 1) / sizeof(uintptr_t))
#define NEW_GC(T, ...) new (pxt::gcAllocate(sizeof(T))) T(__VA_ARGS__)
#define PXT_VTABLE_INIT(classname) pxt::RefObject(&classname##_vtable)
#define DMESG(...) do {} while (0)
