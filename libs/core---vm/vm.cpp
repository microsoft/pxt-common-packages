#include "pxt.h"

// TODO look for patterns in output for combined instructions

namespace pxt {

//%
void op_stloc(FiberContext *ctx, unsigned arg) {
    ctx->sp[arg] = ctx->r0;
}

//%
void op_ldloc(FiberContext *ctx, unsigned arg) {
    ctx->r0 = ctx->sp[arg];
}

//%
void op_stcap(FiberContext *ctx, unsigned arg) {
    ctx->caps[arg] = ctx->r0;
}

//%
void op_ldcap(FiberContext *ctx, unsigned arg) {
    ctx->r0 = ctx->caps[arg];
}

//%
void op_stglb(FiberContext *ctx, unsigned arg) {
    globals[arg] = ctx->r0;
}

//%
void op_ldglb(FiberContext *ctx, unsigned arg) {
    ctx->r0 = globals[arg];
}

//%
void op_ldlit(FiberContext *ctx, unsigned arg) {
    ctx->r0 = *(TValue *)(ctx->img + arg);
}

//%
void op_jmp(FiberContext *ctx, unsigned arg) {
    ctx->pc = ctx->img + arg;
}

//%
void op_jmpfalse(FiberContext *ctx, unsigned arg) {
    if (!toBoolQuick(ctx->r0))
        ctx->pc = ctx->img + arg;
}

//%
void op_jmptrue(FiberContext *ctx, unsigned arg) {
    if (toBoolQuick(ctx->r0))
        ctx->pc = ctx->img + arg;
}

//%
void op_pop(FiberContext *ctx, unsigned) {
    ctx->r0 = *ctx->sp++;
}

//%
void op_popmany(FiberContext *ctx, unsigned arg) {
    ctx->sp += arg;
}

//%
void op_pushmany(FiberContext *ctx, unsigned arg) {
    while (arg--) {
        *--ctx->sp = TAG_UNDEFINED;
    }
}

//%
void op_push(FiberContext *ctx, unsigned) {
    *--ctx->sp = ctx->r0;
}

//%
void op_ldspecial(FiberContext *ctx, unsigned arg) {
    ctx->r0 = (TValue)(uintptr_t)arg;
}

//%
void op_ldint(FiberContext *ctx, unsigned arg) {
    ctx->r0 = TAG_NUMBER(arg);
}

//%
void op_ldintneg(FiberContext *ctx, unsigned arg) {
    ctx->r0 = TAG_NUMBER(-(int)arg);
}

//%
void op_ldintind(FiberContext *ctx, unsigned arg) {
    ctx->r0 = TAG_NUMBER(ctx->img[arg]);
}

const OpFun opcodes[] = {
    // TODO
    op_push,
    op_ldint,
};

#define SMALL_SIZE 6
#define SMALL_MASK ((1 << SMALL_SIZE) - 1)

void exec_loop(FiberContext *ctx) {
    while (ctx->pc) {
        uint32_t opcode = *ctx->pc++;
        if (opcode & SMALL_MASK)
            opcodes[opcode & SMALL_MASK](ctx, opcode >> SMALL_SIZE);
        else
            opcodes[opcode >> SMALL_SIZE](ctx, opcode >> (SMALL_SIZE + 9));
    }
}

} // namespace pxt