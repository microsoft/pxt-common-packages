#include "pxt.h"

// TODO look for patterns in output for combined instructions

namespace pxt {

//%
void op_stloc(FiberContext *ctx, int arg) {
    ctx->sp[arg] = ctx->r0;
}

//%
void op_ldloc(FiberContext *ctx, int arg) {
    ctx->r0 = ctx->sp[arg];
}

//%
void op_stcap(FiberContext *ctx, int arg) {
    ctx->caps[arg] = ctx->r0;
}

//%
void op_ldcap(FiberContext *ctx, int arg) {
    ctx->r0 = ctx->caps[arg];
}

//%
void op_stglb(FiberContext *ctx, int arg) {
    globals[arg] = ctx->r0;
}

//%
void op_ldglb(FiberContext *ctx, int arg) {
    ctx->r0 = globals[arg];
}

//%
void op_pop(FiberContext *ctx, int) {
    ctx->r0 = *ctx->sp++;
}

//%
void op_popmany(FiberContext *ctx, int arg) {
    ctx->sp += arg;
}

//%
void op_pushmany(FiberContext *ctx, int arg) {
    while (arg--) {
        *--ctx->sp = TAG_UNDEFINED;
    }
}

//%
void op_push(FiberContext *ctx, int) {
    *--ctx->sp = ctx->r0;
}

//%
void op_ldspecial(FiberContext *ctx, int arg) {
    ctx->r0 = (TValue)(uintptr_t)arg;
}

//%
void op_ldint(FiberContext *ctx, int arg) {
    ctx->r0 = TAG_NUMBER(arg);
}

const OpFun opcodes[] = {
    // TODO
    op_push,
    op_ldint,
};


void exec_loop(FiberContext *ctx) {
    while (ctx->pc) {
        int32_t opcode = *ctx->pc++;
        opcodes[opcode & 0xfff](ctx, opcode >> 12);
    }
}

}