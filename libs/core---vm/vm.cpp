#include "pxt.h"

// TODO optimze add/sub/etc
// TODO look for patterns in output for combined instructions
// TODO 4.5/20 instructions are push - combine
// TODO check for backjumps (how many)

// TODO iface member names - dynamic lookup fallback
// TODO check on all allowed pxt::* functions
// TODO check bytecode[...] usage

#define SPLIT_ARG(arg0, arg1) unsigned arg0 = arg & 31, arg1 = arg >> 6
#define SPLIT_ARG2(arg0, arg1) unsigned arg0 = arg & 255, arg1 = arg >> 8

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
void op_ldcap(FiberContext *ctx, unsigned arg) {
    ctx->r0 = ctx->currAction->fields[arg];
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
    ctx->r0 = ctx->img->pointerLiterals[arg];
}

//%
void op_ldnumber(FiberContext *ctx, unsigned arg) {
    ctx->r0 = (TValue)ctx->img->numberLiterals[arg];
}

//%
void op_jmp(FiberContext *ctx, unsigned arg) {
    ctx->pc += (int)arg;
}

//%
void op_jmpz(FiberContext *ctx, unsigned arg) {
    if (!toBoolQuick(ctx->r0))
        ctx->pc += (int)arg;
}

//%
void op_jmpnz(FiberContext *ctx, unsigned arg) {
    if (toBoolQuick(ctx->r0))
        ctx->pc += (int)arg;
}

static inline VTable *getStaticVTable(VMImage *img, unsigned classId) {
    return (VTable *)((void **)img->pointerLiterals[classId] + 1);
}

//%
void op_newobj(FiberContext *ctx, unsigned arg) {
    ctx->r0 = (TValue)pxt::mkClassInstance(getStaticVTable(ctx->img, arg));
}

static inline void checkClass(FiberContext *ctx, TValue obj, unsigned classId, unsigned fldId) {
    if (!isPointer(obj))
        failedCast(obj);
    auto vt = getVTable((RefObject *)obj);
    auto vt2 = getStaticVTable(ctx->img, classId);
    if (vt == vt2)
        return;
    if ((int)vt2->classNo <= (int)vt->classNo && (int)vt->classNo <= (int)vt2->lastClassNo) {
        // double check field range - we don't really check class sequence numbers
        if (8 + fldId * 8 >= vt->numbytes)
            failedCast(obj);
    }
}

//%
void op_ldfld(FiberContext *ctx, unsigned arg) {
    SPLIT_ARG2(fldId, classId);
    auto obj = ctx->r0;
    checkClass(ctx, obj, classId, fldId);
    ctx->r0 = ((RefRecord *)obj)->fields[fldId];
}

//%
void op_stfld(FiberContext *ctx, unsigned arg) {
    SPLIT_ARG2(fldId, classId);
    auto obj = *--ctx->sp;
    checkClass(ctx, obj, classId, fldId);
    ((RefRecord *)obj)->fields[fldId] = ctx->r0;
}

static inline void runAction(FiberContext *ctx, RefAction *ra) {
    if (ctx->sp < ctx->stackLimit)
        error(PANIC_STACK_OVERFLOW);

    *--ctx->sp = (TValue)ctx->currAction;
    *--ctx->sp = (TValue)(((ctx->pc - ctx->imgbase) << 8) | 2);
    ctx->currAction = ra;
    ctx->pc = (uint16_t *)ra->func;
}

//%
void op_callproc(FiberContext *ctx, unsigned arg) {
    runAction(ctx, (RefAction *)ctx->img->pointerLiterals[arg]);
}

static void callind(FiberContext *ctx, RefAction *ra, unsigned numArgs) {
    if (numArgs != ra->numArgs) {
        // TODO re-arrange the stack, so that the right number of arguments is present
        failedCast((TValue)ra);
    }

    if (ra->initialLen != ra->len)
        // trying to call function template
        error(PANIC_INVALID_VTABLE);

    runAction(ctx, ra);
}

//%
void op_callind(FiberContext *ctx, unsigned arg) {
    auto fn = ctx->r0;
    if (!isPointer(fn))
        failedCast(fn);
    auto vt = getVTable((RefObject *)fn);
    if (vt->objectType != ValType::Function)
        failedCast(fn);

    callind(ctx, (RefAction *)fn, arg);
}

//%
void op_ret(FiberContext *ctx, unsigned arg) {
    SPLIT_ARG(retNumArgs, numTmps);
    ctx->sp += numTmps;
    auto retaddr = (intptr_t)*ctx->sp++;
    if (retaddr == (intptr_t)TAG_STACK_BOTTOM) {
        ctx->pc = NULL;
    } else {
        ctx->currAction = (RefAction *)*ctx->sp++;
        ctx->sp += retNumArgs;
        ctx->pc = ctx->imgbase + (retaddr >> 8);
    }
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

static inline void callifaceCore(FiberContext *ctx, unsigned numArgs, unsigned ifaceIdx,
                                 int getset) {
    auto obj = ctx->sp[numArgs - 1];
    if (!isPointer(obj))
        failedCast(obj);
    auto vt = getVTable((RefObject *)obj);
    uint32_t mult = vt->ifaceHashMult;
    if (!mult)
        failedCast(obj);
    uint32_t off = (ifaceIdx * mult) >> (mult & 0xff);

    unsigned n = 3;
    auto multBase = (uint16_t *)&vt->methods[VM_NUM_CPP_METHODS];
    while (n--) {
        uint32_t off2 = multBase[off];
        auto ent = (struct IfaceEntry *)multBase + off2;

        if (ent->memberId == ifaceIdx) {
            if (getset == 2) {
                ent++;
                if (ent->memberId != ifaceIdx)
                    failedCast(obj);
            }
            if (ent->aux == 0) {
                auto fn = ctx->img->pointerLiterals[ent->method];
                callind(ctx, (RefAction *)fn, numArgs);
            } else {
                if (getset == 2) {
                    // store field
                    ((RefRecord *)obj)->fields[ent->aux - 1] = ctx->sp[0];
                    ctx->sp += 2; // and pop arguments
                } else {
                    // load field
                    ctx->r0 = ((RefRecord *)obj)->fields[ent->aux - 1];
                    if (getset == 0) {
                        // and call
                        op_callind(ctx, numArgs);
                    } else {
                        // if just loading, pop the object arg
                        ctx->sp += 1;
                    }
                }
            }

            return;
        }
        off++;
    }

    if (getset == 1) {
        ctx->sp += 1; // pop object arg
        ctx->r0 = TAG_UNDEFINED;
    } else {
        // member not found
        failedCast(obj);
    }
}

//%
void op_calliface(FiberContext *ctx, unsigned arg) {
    SPLIT_ARG(numArgs, ifaceIdx);
    callifaceCore(ctx, numArgs, ifaceIdx, 0);
}

//%
void op_callget(FiberContext *ctx, unsigned arg) {
    callifaceCore(ctx, 1, arg, 1);
}

//%
void op_callset(FiberContext *ctx, unsigned arg) {
    callifaceCore(ctx, 2, arg, 2);
}

//%
Action fetchMethodIface(TValue obj, int methodId) {
    return NULL;
}

//%
Action fetchMethod(TValue obj, int methodId) {
    return NULL;
}

//%
void stfld(TValue obj, int fieldId, TValue v) {}

//%
TValue ldfld(TValue obj, int fieldId) {
    return NULL;
}

//%
TValue instanceOf(TValue obj, int firstClass, int lastClass) {
    return NULL;
}

//%
void validateInstanceOf(TValue obj, int firstClass, int lastClass) {}

void exec_loop(FiberContext *ctx) {
    auto opcodes = ctx->img->opcodes;
    while (ctx->pc) {
        uint16_t opcode = *ctx->pc++;
        if (opcode >> 15 == 0) {
            opcodes[opcode & VM_OPCODE_BASE_MASK](ctx, opcode >> VM_OPCODE_BASE_SIZE);
        } else if (opcode >> 14 == 0b10) {
            ((ApiFun)opcodes[opcode & 0x3fff])(ctx);
        } else {
            unsigned tmp = ((int32_t)opcode << (16 + 2)) >> (2 + VM_OPCODE_BASE_SIZE);
            opcode = *ctx->pc++;
            opcodes[opcode & VM_OPCODE_BASE_MASK](ctx, (opcode >> VM_OPCODE_BASE_SIZE) + tmp);
        }
    }
}

// 1240
#define FNERR(errcode)                                                                             \
    do {                                                                                           \
        setVMImgError(img, errcode, &code[pc]);                                                    \
        return;                                                                                    \
    } while (0)
#define FORCE_STACK(v, errcode, pc)                                                                \
    do {                                                                                           \
        if (stackDepth[pc] && stackDepth[pc] != v)                                                 \
            FNERR(errcode);                                                                        \
        stackDepth[pc] = v;                                                                        \
    } while (0)

void validateFunction(VMImage *img, VMImageSection *sect, int debug) {
    uint16_t stackDepth[sect->size / 2];
    memset(stackDepth, 0, sizeof(stackDepth));
    int baseStack = 1; // 1 is the return address; also zero in the array above means unknown yet
    int currStack = baseStack;
    unsigned pc = 0;
    auto code = (uint16_t *)((uint8_t *)sect + VM_FUNCTION_CODE_OFFSET);
    auto lastPC = (sect->size - VM_FUNCTION_CODE_OFFSET) >> 1;
    auto atEnd = false;

    RefAction *ra = (RefAction *)sect;

    unsigned numArgs = ra->numArgs;
    unsigned numCaps = ra->initialLen;

    if (numCaps > 200)
        FNERR(1239);

    while (pc < lastPC) {
        if (currStack > VM_MAX_FUNCTION_STACK)
            FNERR(1204);

        FORCE_STACK(currStack, 1201, pc);

        uint16_t opcode = code[pc++];
        if (opcode == 0 && atEnd)
            continue; // allow padding at the end

        atEnd = false;
        OpFun fn;
        unsigned arg;
        unsigned opIdx;
        bool isRtCall = false;

        if (opcode >> 15 == 0) {
            opIdx = opcode & VM_OPCODE_BASE_MASK;
            arg = opcode >> VM_OPCODE_BASE_SIZE;
        } else if (opcode >> 14 == 0b10) {
            opIdx = opcode & 0x3fff;
            arg = 0;
            isRtCall = true;
        } else {
            unsigned tmp = ((int32_t)opcode << (16 + 2)) >> (2 + VM_OPCODE_BASE_SIZE);
            FORCE_STACK(0xffff, 1200, pc); // cannot jump here!
            opcode = code[pc++];
            opIdx = opcode & VM_OPCODE_BASE_MASK;
            arg = (opcode >> VM_OPCODE_BASE_SIZE) + tmp;
        }

        if (opIdx >= img->numOpcodes)
            FNERR(1227);
        auto opd = img->opcodeDescs[opIdx];

        if (debug)
            printf("%4d/%d -> %04x idx=%d arg=%d st=%d %s\n", pc, lastPC, opcode, opIdx, arg,
                   currStack, opd ? opd->name : "NA");

        if (!opd)
            FNERR(1228);

        fn = img->opcodes[opIdx];

        if (isRtCall) {
            if (opd->numArgs > 1) {
                currStack -= opd->numArgs - 1;
                if (currStack < baseStack)
                    FNERR(1229);
            }
        } else if (fn == op_pushmany) {
            if (currStack == 1 && baseStack == 1)
                baseStack = currStack = arg + 1;
            else
                currStack += arg;
        } else if (fn == op_popmany) {
            currStack -= arg;
            if (currStack < baseStack)
                FNERR(1205);
        } else if (fn == op_push) {
            currStack++;
        } else if (fn == op_pop) {
            currStack--;
            if (currStack < baseStack)
                FNERR(1206);
        } else if (fn == op_ret) {
            SPLIT_ARG(retNumArgs, numTmps);
            if (currStack != baseStack)
                FNERR(1207);
            if (numTmps + 1 != (unsigned)baseStack)
                FNERR(1208);
            if (retNumArgs != numArgs)
                FNERR(1209);
            currStack = baseStack;
            atEnd = true;
        } else if (fn == op_ldloc || fn == op_stloc) {
            if (arg == (unsigned)currStack - 1)
                FNERR(1210); // trying to load return address
            if (arg > (unsigned)currStack - 1 + numArgs)
                FNERR(1211);
        } else if (fn == op_ldcap) {
            if (arg >= numCaps)
                FNERR(1212);
        } else if (fn == op_ldglb || fn == op_stglb) {
            if (arg >= img->infoHeader->allocGlobals)
                FNERR(1213);
            // not supported (yet?)
            if (arg < img->infoHeader->nonPointerGlobals)
                FNERR(1214);
        } else if (fn == op_ldfld || fn == op_stfld) {
            SPLIT_ARG2(fldId, classId);

            if (classId >= img->numSections)
                FNERR(1236);
            auto fsec = (VMImageSection *)img->pointerLiterals[classId];
            if (!fsec)
                FNERR(1233);
            if (fsec->type != SectionType::VTable)
                FNERR(1234);

            auto vt = getStaticVTable(img, classId);
            if (fldId * 8 + 8 >= vt->numbytes)
                FNERR(1235);

            if (fn == op_stfld) {
                currStack--;
                if (currStack < baseStack)
                    FNERR(1232);
            }
        } else if (fn == op_ldlit || fn == op_newobj) {
            if (arg >= img->numSections)
                FNERR(1215);
            auto fsec = (VMImageSection *)img->pointerLiterals[arg];
            if (!fsec)
                FNERR(1216);
            if (fn == op_ldlit && fsec->type == SectionType::VTable)
                FNERR(1237);
            if (fn == op_newobj && fsec->type != SectionType::VTable)
                FNERR(1238);
        } else if (fn == op_ldnumber) {
            if (arg >= img->numNumberLiterals)
                FNERR(1217);
        } else if (fn == op_callproc) {
            if (arg >= img->numSections)
                FNERR(1218);
            auto fsec = (VMImageSection *)img->pointerLiterals[arg];
            if (!fsec)
                FNERR(1219);
            if (fsec->type != SectionType::Function)
                FNERR(1220);
            unsigned calledArgs = ((RefAction *)fsec)->numArgs;
            currStack -= calledArgs;
            if (currStack < baseStack)
                FNERR(1221);
        } else if (fn == op_callind) {
            currStack -= arg;
            if (currStack < baseStack)
                FNERR(1223);
        } else if (fn == op_calliface) {
            SPLIT_ARG(numArgs, ifaceIdx);
            (void)ifaceIdx;
            currStack -= numArgs;
            if (currStack < baseStack)
                FNERR(1230);
        } else if (fn == op_callget) {
            currStack -= 1;
            if (currStack < baseStack)
                FNERR(1230);
        } else if (fn == op_callset) {
            currStack -= 2;
            if (currStack < baseStack)
                FNERR(1230);
        } else if (fn == op_ldspecial) {
            auto a = (TValue)(uintptr_t)arg;
            if (a != TAG_TRUE && a != TAG_FALSE && a != TAG_UNDEFINED && a != TAG_NULL &&
                a != TAG_NAN)
                FNERR(1224);
        } else if (fn == op_ldint || fn == op_ldintneg) {
            // nothing to check!
        } else if (fn == op_jmp || fn == op_jmpnz || fn == op_jmpz) {
            unsigned newPC = pc + arg; // will overflow for backjump, but this is fine
            if (newPC >= lastPC)
                FNERR(1202);
            FORCE_STACK(currStack, 1226, newPC);
            if (fn == op_jmp) {
                if (currStack != baseStack)
                    FNERR(1203);
                atEnd = true;
            }
        } else {
            FNERR(1225);
        }
    }

    if (!atEnd) {
        pc--;
        FNERR(1210);
    }
}

} // namespace pxt