#include "pxtbase.h"

using namespace std;

#define SINGLE(op) return fromDouble(::op(toDouble(x)));

namespace Math_ {

//%
TNumber log2(TNumber x){SINGLE(log2)}
//%
TNumber exp(TNumber x){SINGLE(exp)}
//%
TNumber tanh(TNumber x){SINGLE(tanh)}
//%
TNumber sinh(TNumber x){SINGLE(sinh)}
//%
TNumber cosh(TNumber x){SINGLE(cosh)}
//%
TNumber atanh(TNumber x){SINGLE(atanh)}
//%
TNumber asinh(TNumber x){SINGLE(asinh)}
//%
TNumber acosh(TNumber x){SINGLE(acosh)}

}