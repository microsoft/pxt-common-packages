#include "pxtbase.h"
#include <limits.h>
#include <stdlib.h>

using namespace std;

namespace Math_ {

#define SINGLE(op) return fromDouble(::op(toDouble(x)));

//%
TNumber atan2(TNumber y, TNumber x) {
    return fromDouble(::atan2(toDouble(y), toDouble(x)));
}

//%
TNumber tan(TNumber x){SINGLE(tan)}

//%
TNumber sin(TNumber x){SINGLE(sin)}

//%
TNumber cos(TNumber x){SINGLE(cos)}

//%
TNumber atan(TNumber x){SINGLE(atan)}

//%
TNumber asin(TNumber x){SINGLE(asin)}

//%
TNumber acos(TNumber x){SINGLE(acos)}

//%
TNumber sqrt(TNumber x){SINGLE(sqrt)}

}