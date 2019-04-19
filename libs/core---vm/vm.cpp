#include "pxt.h"

// TODO optimze add/sub/etc
// TODO look for patterns in output for combined instructions
// TODO 4.5/20 instructions are push - combine
// TODO check for backjumps (how many)
// TODO getConfig() should have a callback into host
// TODO stloc X; ldloc X -> stloc X

// TODO string object field lookups

#define SPLIT_ARG(arg0, arg1) unsigned arg0 = arg & 31, arg1 = arg >> 6
#define SPLIT_ARG2(arg0, arg1) unsigned arg0 = arg & 255, arg1 = arg >> 8

#define PUSH(v) *--ctx->sp = (v)
#define POPVAL() *ctx->sp++
#define POP(n) ctx->sp += (n)

//#define TRACE DMESG
#define TRACE NOLOG

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
    TRACE("check class: %p cl=%d f=%d", obj, classId, fldId);
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
    auto obj = POPVAL();
    checkClass(ctx, obj, classId, fldId);
    ((RefRecord *)obj)->fields[fldId] = ctx->r0;
}

static inline void runAction(FiberContext *ctx, RefAction *ra) {
    if (ctx->sp < ctx->stackLimit)
        error(PANIC_STACK_OVERFLOW);

    PUSH((TValue)ctx->currAction);
    PUSH(VM_ENCODE_PC(ctx->pc - ctx->imgbase));
    ctx->currAction = ra;
    ctx->pc = (uint16_t *)ra->func;
}

//%
void op_callproc(FiberContext *ctx, unsigned arg) {
    runAction(ctx, (RefAction *)ctx->img->pointerLiterals[arg]);
}

static void callind(FiberContext *ctx, RefAction *ra, unsigned numArgs) {
    if (numArgs != ra->numArgs) {
        int missing = ra->numArgs - numArgs;
        TRACE("callind missing=%d", missing);
        if (missing < 0) {
            // just drop the ones on top
            POP(-missing);
        } else {
            // add some undefineds
            while (missing--)
                PUSH(TAG_UNDEFINED);
        }
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

    POP(numTmps);
    auto retaddr = (intptr_t)POPVAL();
    ctx->currAction = (RefAction *)POPVAL();
    POP(retNumArgs);

    if (retaddr == (intptr_t)TAG_STACK_BOTTOM) {
        ctx->pc = NULL;
    } else {
        ctx->pc = ctx->imgbase + VM_DECODE_PC(retaddr);
    }
}

//%
void op_pop(FiberContext *ctx, unsigned) {
    ctx->r0 = POPVAL();
}

//%
void op_popmany(FiberContext *ctx, unsigned arg) {
    POP(arg);
}

//%
void op_pushmany(FiberContext *ctx, unsigned arg) {
    while (arg--) {
        PUSH(TAG_UNDEFINED);
    }
}

//%
void op_push(FiberContext *ctx, unsigned) {
    PUSH(ctx->r0);
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

static TValue lookupIfaceMember(TValue obj, VTable *vt, unsigned ifaceIdx) {
    uint32_t mult = vt->ifaceHashMult;
    uint32_t off = (ifaceIdx * mult) >> (mult & 0xff);

    unsigned n = 3;
    auto multBase = (uint16_t *)&vt->methods[VM_NUM_CPP_METHODS];
    while (n--) {
        uint32_t off2 = multBase[off];
        auto ent = (struct IfaceEntry *)multBase + off2;

        if (ent->memberId == ifaceIdx) {
            if (ent->aux == 0) {
                return vmImg->pointerLiterals[ent->method];
            } else {
                return ((RefRecord *)obj)->fields[ent->aux - 1];
            }
        }
        off++;
    }

    return NULL;
}

static inline void callifaceCore(FiberContext *ctx, unsigned numArgs, unsigned ifaceIdx,
                                 int getset) {
    auto obj = ctx->sp[numArgs - 1];
    if (!isPointer(obj))
        failedCast(obj);
    auto vt = getVTable((RefObject *)obj);
    uint32_t mult = vt->ifaceHashMult;

    if (!mult) {
        if (vt->classNo == BuiltInType::RefMap) {
            if (getset == 2) {
                pxtrt::mapSet((RefMap *)obj, ifaceIdx, ctx->sp[0]);
                POP(2); // and pop arguments
            } else {
                ctx->r0 = pxtrt::mapGet((RefMap *)obj, ifaceIdx);
                if (getset == 0) {
                    op_callind(ctx, numArgs);
                } else {
                    POP(1);
                }
            }
            return;
        }
        failedCast(obj);
    }
    uint32_t off = (ifaceIdx * mult) >> (mult & 0xff);

    unsigned n = 3;
    auto multBase = (uint16_t *)&vt->methods[VM_NUM_CPP_METHODS];
    while (n--) {
        uint32_t off2 = multBase[off];
        auto ent = (struct IfaceEntry *)multBase + off2;

        if (ent->memberId == ifaceIdx) {
            if (ent->aux == 0) {
                if (getset == 2) {
                    ent++;
                    if (ent->memberId != ifaceIdx)
                        failedCast(obj);
                }
                auto fn = ctx->img->pointerLiterals[ent->method];
                callind(ctx, (RefAction *)fn, numArgs);
            } else {
                if (getset == 2) {
                    // store field
                    ((RefRecord *)obj)->fields[ent->aux - 1] = ctx->sp[0];
                    POP(2); // and pop arguments
                } else {
                    // load field
                    ctx->r0 = ((RefRecord *)obj)->fields[ent->aux - 1];
                    if (getset == 0) {
                        // and call
                        op_callind(ctx, numArgs);
                    } else {
                        // if just loading, pop the object arg
                        POP(1);
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
void op_mapget(FiberContext *ctx, unsigned arg) {
    auto obj = ctx->sp[0];
    if (!isPointer(obj))
        failedCast(obj);
    auto vt = getVTable((RefObject *)obj);
    auto key = numops::toString(ctx->r0);
    if (vt->classNo == BuiltInType::RefMap) {
        ctx->r0 = pxtrt::mapGetByString((RefMap *)obj, key);
        POP(1);
    } else {
        int k = pxtrt::lookupMapKey(key);
        if (k == 0) {
            POP(1);
            ctx->r0 = TAG_UNDEFINED;
        } else {
            callifaceCore(ctx, 1, k, 1);
        }
    }
}

//%
void op_mapset(FiberContext *ctx, unsigned arg) {
    auto obj = ctx->sp[1];
    if (!isPointer(obj))
        failedCast(obj);
    auto vt = getVTable((RefObject *)obj);
    auto key = numops::toString(ctx->sp[0]);
    ctx->sp[0] = (TValue)key; // save it, so it doesn't get GCed
    if (vt->classNo == BuiltInType::RefMap) {
        pxtrt::mapSetByString((RefMap *)obj, key, ctx->r0);
        POP(2);
    } else {
        int k = pxtrt::lookupMapKey(key);
        if (k == 0) {
            failedCast(obj);
        } else {
            ctx->sp[0] = ctx->r0;
            callifaceCore(ctx, 2, k, 2);
        }
    }
}

//%
void op_checkinst(FiberContext *ctx, unsigned arg) {
    auto obj = ctx->r0;
    ctx->r0 = TAG_FALSE;

    if (isPointer(obj)) {
        auto vt2 = getStaticVTable(ctx->img, arg);
        auto vt = getVTable((RefObject *)obj);
        if (vt == vt2)
            ctx->r0 = TAG_TRUE;
        else if ((int)vt2->classNo <= (int)vt->classNo && (int)vt->classNo <= (int)vt2->lastClassNo)
            ctx->r0 = TAG_TRUE;
    }
}

static TValue inlineInvoke(FiberContext *ctx, RefAction *fn, int numArgs) {
    auto prevPC = ctx->pc;
    auto prevR0 = ctx->r0;
    // make sure call will push TAG_STACK_BOTTOM
    ctx->pc = (uint16_t *)ctx->imgbase + 1;
    callind(ctx, fn, numArgs);
    exec_loop(ctx);
    if (ctx->resumePC)
        target_panic(PANIC_BLOCKING_TO_STRING);
    auto r = ctx->r0;
    ctx->pc = prevPC;
    ctx->r0 = prevR0;
    return r;
}

String convertToString(FiberContext *ctx, TValue v) {
    if (isPointer(v)) {
        auto vt = getVTable((RefObject *)v);
        if ((int)vt->classNo >= (int)BuiltInType::User0) {
            auto img = ctx->img;
            if (!img->toStringKey) {
                img->toStringKey = pxtrt::lookupMapKey(mkString("toString"));
                if (!img->toStringKey)
                    img->toStringKey = -1;
            }
            if (img->toStringKey > 0) {
                auto fn = lookupIfaceMember(v, vt, img->toStringKey);
                if (fn && isPointer(fn) &&
                    getVTable((RefObject *)fn)->objectType == ValType::Function) {
                    PUSH(v);
                    v = inlineInvoke(ctx, (RefAction *)fn, 1);
                    PUSH(v); // make sure it doesn't get collected
                }
            }
        }
    }

    auto rr = numops::toString(v);
    if ((TValue)rr != v)
        PUSH((TValue)rr); // make sure it doesn't get collected

    return rr;
}

void exec_loop(FiberContext *ctx) {
    auto opcodes = ctx->img->opcodes;
    while (ctx->pc) {
        uint16_t opcode = *ctx->pc++;
        TRACE("0x%x: %04x %d", (uint8_t *)ctx->pc - 2 - (uint8_t *)ctx->img->dataStart, opcode,
              (int)(ctx->stackBase + VM_STACK_SIZE - ctx->sp));
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

} // namespace pxt

//
// Verification
//

namespace pxt {

// 1248
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
            if (arg)
                FNERR(1243);
            currStack--;
            if (currStack < baseStack)
                FNERR(1206);
        } else if (fn == op_mapget) {
            if (arg)
                FNERR(1244);
            currStack--;
            if (currStack < baseStack)
                FNERR(1245);
        } else if (fn == op_mapset) {
            if (arg)
                FNERR(1246);
            currStack -= 2;
            if (currStack < baseStack)
                FNERR(1247);
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
            if (arg == (unsigned)currStack - 1 || arg == (unsigned)currStack)
                FNERR(1210); // trying to load return address/function
            if (arg > (unsigned)currStack + numArgs)
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
            auto fsec = img->sections[classId];
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
        } else if (fn == op_ldlit) {
            if (arg >= img->numSections)
                FNERR(1215);
            auto fsec = img->sections[arg];
            if (fsec->type != SectionType::Literal && fsec->type != SectionType::Function)
                FNERR(1237);
        } else if (fn == op_newobj || fn == op_checkinst) {
            if (arg >= img->numSections)
                FNERR(1219);
            auto fsec = img->sections[arg];
            if (fsec->type != SectionType::VTable)
                FNERR(1238);
        } else if (fn == op_ldnumber) {
            if (arg >= img->numNumberLiterals)
                FNERR(1217);
        } else if (fn == op_callproc) {
            if (arg >= img->numSections)
                FNERR(1218);
            auto fsec = img->sections[arg];
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
            if (ifaceIdx == 0 || ifaceIdx >= img->numIfaceMemberNames)
                FNERR(1240);
            currStack -= numArgs;
            if (currStack < baseStack)
                FNERR(1230);
        } else if (fn == op_callget) {
            if (arg == 0 || arg >= img->numIfaceMemberNames)
                FNERR(1241);
            currStack -= 1;
            if (currStack < baseStack)
                FNERR(1230);
        } else if (fn == op_callset) {
            if (arg == 0 || arg >= img->numIfaceMemberNames)
                FNERR(1242);
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