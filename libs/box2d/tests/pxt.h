#pragma once

#include <stdexcept>
#include <vector>
#include <cassert>
#include <cstdint>
#include <new>

// A host-only model of the PXT ABI, not a simulator implementation.
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
        assert(!object);
        return number;
    }

    explicit operator uintptr_t() const {
        assert(object);
        return pointer;
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
static int numberConversions;
static int integerConversions;
static int arrayAllocations;
inline TValue fromDouble(double value) { ++numberConversions; return TValue(value); }
inline TValue fromInt(int value) {
    assert(value >= -(1 << 30) && value < (1 << 30));
    ++integerConversions;
    return TValue(value);
}
inline double toDouble(TValue value) { return (double)value; }
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
inline TValue removeAt(RefCollection *array, int index) {
    TValue result = array->values.at(index);
    array->values.erase(array->values.begin() + index);
    return result;
}
inline int length(RefCollection *array) { return (int)array->values.size(); }
}
inline void *gcAllocate(int size) { return ::operator new(size); }
inline void gcScan(TValue) {}
[[noreturn]] inline void target_panic(int code) { throw std::runtime_error(std::to_string(code)); }
}

#define TOWORDS(bytes) (((bytes) + sizeof(uintptr_t) - 1) / sizeof(uintptr_t))
#define NEW_GC(T, ...) new (pxt::gcAllocate(sizeof(T))) T(__VA_ARGS__)
#define PXT_VTABLE_INIT(classname) pxt::RefObject(&classname##_vtable)
#define DMESG(...) do {} while (0)
