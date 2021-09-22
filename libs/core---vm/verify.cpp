#include "pxt.h"

namespace pxt {

VMImage *setVMImgError(VMImage *img, int code, void *pos) {
    img->errorOffset = pos ? (int)((uint8_t *)pos - (uint8_t *)img->dataStart) : 0;
    img->errorCode = code;
    return img;
}

// next free error 1066
#define ERROR(code, pos) return setVMImgError(img, code, pos)
#define CHECK(cond, code)                                                                          \
    do {                                                                                           \
        if (!(cond))                                                                               \
            ERROR(code, sect);                                                                     \
    } while (0)
#define CHECK_AT(cond, code, pos)                                                                  \
    do {                                                                                           \
        if (!(cond))                                                                               \
            ERROR(code, pos);                                                                      \
    } while (0)
#define ALIGNED(sz) (((sz)&7) == 0)

#define FOR_SECTIONS()                                                                             \
    VMImageSection *sect, *next;                                                                   \
    for (sect = (VMImageSection *)img->dataStart;                                                  \
         (next = vmNextSection(sect), (uint64_t *)sect < img->dataEnd); sect = next)

#define ALLOC_ARRAY(tp, sz) (tp *)xmalloc(sz == 0 ? 1 : sizeof(tp) * sz)

#define VM_MAX_PATCH 7

struct VMPatchState {
    uint32_t offset;
    uint32_t bytesLeftInSect;
    uint8_t patchOff;
    const char *error;
    uint64_t patch[VM_MAX_PATCH];
};

static const VTable *vtFor(VMImageSection *sect) {
    if (sect->type == SectionType::Function)
        return &pxt::RefAction_vtable;
    else if (sect->type == SectionType::Literal)
        switch ((BuiltInType)sect->aux) {
        case BuiltInType::BoxedString_ASCII:
            return &pxt::string_inline_ascii_vt;
        case BuiltInType::BoxedString_SkipList:
            return &pxt::string_skiplist16_packed_vt;
        case BuiltInType::BoxedString:
            return &pxt::string_inline_utf8_vt;
        case BuiltInType::BoxedBuffer:
            return &pxt::buffer_vt;
        default:
            return NULL;
        }
    return NULL;
}

static bool isStringSection(VMImageSection *sect) {
    if (sect->type == SectionType::Literal)
        switch ((BuiltInType)sect->aux) {
        case BuiltInType::BoxedString_ASCII:
        case BuiltInType::BoxedString_SkipList:
        case BuiltInType::BoxedString:
            return true;
        default:
            return false;
        }
    return false;
}

VMPatchState *vm_alloc_patch_state() {
    return (VMPatchState *)calloc(sizeof(VMPatchState), 1);
}

void vm_finish_patch(VMPatchState *state) {
    free(state);
}

const char *vm_patch_image(VMPatchState *state, uint8_t *data, uint32_t len) {
    if (state->error)
        return state->error;

    if (len <= 8 || !ALIGNED(len))
        return (state->error = "invalid chunk size");

    while (len > 0) {
        if (state->bytesLeftInSect == 0) {
            VMImageSection sect;
            memcpy(&sect, data, sizeof(sect));

            if (!ALIGNED(sect.size) || !sect.size)
                return (state->error = "invalid section");

            state->bytesLeftInSect = sect.size;

            memset(state->patch, 0, sizeof(state->patch));
            state->patchOff = 1;

            const VTable *vt = NULL;
#ifdef PXT32
            if (sect.type == SectionType::NumberBoxes) {
                return (state->error = "TODO: NumberBoxes");
            }
#endif
            if (sect.type == SectionType::Literal || sect.type == SectionType::Function) {
                vt = vtFor(&sect);
                if (!vt)
                    return (state->error = "unknown literal vt");
#ifdef PXT64
                state->patch[0] = (uint64_t)vt;
#else
                state->patch[0] = (uint64_t)(uint32_t)vt << 32;
#endif
            } else if (sect.type == SectionType::VTable) {
                auto dest = (void **)((uint32_t *)state->patch + 4);
                dest[0] = (void *)pxt::RefRecord_destroy;
                dest[1] = (void *)pxt::RefRecord_print;
                dest[2] = (void *)pxt::RefRecord_scan;
                dest[3] = (void *)pxt::RefRecord_gcsize;
            }
        } else if (state->patchOff != 0) {
            uint64_t p = state->patch[state->patchOff - 1];
            if (p)
                memcpy(data, &p, sizeof(p));
            if (state->patchOff == VM_MAX_PATCH) {
                state->patchOff = 0;
            } else {
                state->patchOff++;
            }
        }

        state->bytesLeftInSect -= 8;
        data += 8;
        len -= 8;
    }

    return NULL;
}

static VMImage *countSections(VMImage *img) {
    auto p = img->dataStart;
    while (p < img->dataEnd) {
        auto sect = (VMImageSection *)p;
        CHECK(ALIGNED(sect->size), 1002);
        CHECK(sect->size > 0, 1002);
        img->numSections++;
        p += sect->size >> 3;
    }
    CHECK_AT(p == img->dataEnd, 1003, p);
    img->pointerLiterals = ALLOC_ARRAY(TValue, img->numSections);
    img->sections = ALLOC_ARRAY(VMImageSection *, img->numSections);

    return NULL;
}

static VMImage *loadSections(VMImage *img) {
    auto idx = 0;
    VMImageSection *numberBoxes = NULL;

    FOR_SECTIONS() {
        CHECK(sect->size < 32000, 1014);
        CHECK(sect->size >= 16, 1048);

        if (sect->type == SectionType::InfoHeader) {
            CHECK(sect->size >= sizeof(VMImageHeader), 1008);
            auto hd = (VMImageHeader *)sect->data;
            CHECK(hd->magic0 == VM_MAGIC0, 1009);
            CHECK(hd->magic1 == VM_MAGIC1, 1010);
            CHECK(hd->allocGlobals >= hd->nonPointerGlobals, 1011);
            CHECK(hd->allocGlobals < 10000, 1012);
            CHECK(idx == 0, 1013);
            img->infoHeader = hd;
        }

        if (sect->type == SectionType::OpCodeMap) {
            CHECK(img->opcodes == NULL, 1015);
            auto curr = sect->data;
            auto endp = sect->data + sect->size - 8;
            CHECK(endp[-1] == 0, 1017);

            while (curr < endp) {
                if (*curr == 0)
                    img->numOpcodes++;
                curr++;
            }
            CHECK(img->numOpcodes >= VM_FIRST_RTCALL, 1016);

            img->opcodes = ALLOC_ARRAY(OpFun, img->numOpcodes);
            img->opcodeDescs = ALLOC_ARRAY(const OpcodeDesc *, img->numOpcodes);

            int i = 0;
            curr = sect->data;
            while (curr < endp) {
                img->opcodeDescs[i] = NULL;
                img->opcodes[i] = NULL;
                if (*curr) {
                    for (auto st = staticOpcodes; st->name; st++) {
                        if (strcmp(st->name, (const char *)curr) == 0) {
                            img->opcodeDescs[i] = st;
                            break;
                        }
                    }
                    if (img->opcodeDescs[i] == NULL) {
                        DMESG("missing opcode: %s", (const char *)curr);
                        setVMImgError(img, 1018, curr);
                    } else {
                        img->opcodes[i] = img->opcodeDescs[i]->fn;
                    }
                }
                while (*curr)
                    curr++;
                curr++;
                i++;
            }
            if (img->errorCode)
                return img;
        }

        if (sect->type == SectionType::NumberBoxes) {
            CHECK(!numberBoxes, 1061);
            numberBoxes = sect;
        }

        if (sect->type == SectionType::NumberLiterals) {
            CHECK(!!numberBoxes, 1062);
            CHECK(!img->numberLiterals, 1004);
            img->numNumberLiterals = (sect->size >> 3) - 1;
            uint64_t *values = (uint64_t *)sect->data;

            int numBoxed = 0;

            for (unsigned i = 0; i < img->numNumberLiterals; ++i) {
                auto ptr = &values[i];
                uint64_t v = *ptr;
                if (isEncodedDouble(v)) {
                    CHECK_AT(!isnan(decodeDouble(v)), 1005, ptr);
                    numBoxed++;
                } else if (v & 1) {
                    CHECK_AT((v >> 1) <= 0xffffffff, 1006, ptr);
                    if (!canBeTagged(v >> 1))
                        numBoxed++;
                } else if (v == 0) {
                    // OK - padding probably
                } else {
                    CHECK_AT(false, 1007, ptr);
                }
            }

            CHECK(numberBoxes->size >= sizeof(VMImageSection) + (numBoxed + 1) * 12, 1063);
            CHECK(numberBoxes->size <= 4 + sizeof(VMImageSection) + (numBoxed + 1) * 12, 1063);

            img->numberLiterals = ALLOC_ARRAY(TValue, img->numNumberLiterals);
#ifdef PXT32
            img->boxedNumbers = (BoxedNumber *)numberBoxes->data;
            int boxedPtr = 0;
#endif

            for (unsigned i = 0; i < img->numNumberLiterals; ++i) {
                uint64_t v = values[i];
#ifdef PXT32
                if (!isEncodedDouble(v) && canBeTagged(v >> 1)) {
                    img->numberLiterals[i] = (TValue)v;
                } else {
                    CHECK(boxedPtr < numBoxed, 1060); // should never happen
                    double x = isEncodedDouble(v) ? decodeDouble(v) : (int32_t)(v >> 1);
                    CHECK(img->boxedNumbers[boxedPtr].vtable == &number_vt, 1064);
                    CHECK(img->boxedNumbers[boxedPtr].num == x, 1065);
                    img->numberLiterals[i] = (TValue)&img->boxedNumbers[boxedPtr];
                    boxedPtr++;
                }
#else
                img->numberLiterals[i] = (TValue)v;
#endif
            }
        }

        if (sect->type == SectionType::ConfigData) {
            img->numConfigDataEntries = (sect->size - 8) >> 3;
            img->configData = (int32_t *)sect->data;
            CHECK(img->configData[(img->numConfigDataEntries - 1) * 2] == 0, 1045);
        }

        img->sections[idx] = sect;

        if (sect->type == SectionType::Literal) {
            CHECK(sect->size >= 20, 1066);
            switch ((BuiltInType)sect->aux) {
            case BuiltInType::BoxedString_ASCII:
            case BuiltInType::BoxedString: {
                auto p = (BoxedString *)vmLiteralVal(sect);
                CHECK(sect->size >= 16 + 2 + (uint32_t)p->ascii.length + 1, 1067);
                CHECK(p->ascii.data[p->ascii.length] == 0, 1068);
                break;
            }
            case BuiltInType::BoxedString_SkipList: {
                auto p = (BoxedString *)vmLiteralVal(sect);
                CHECK(sect->size >= 16 + 4 + PXT_NUM_SKIP_ENTRIES(p) * 2 + (uint32_t)p->skip_pack.size + 1,
                      1069);
                CHECK(PXT_SKIP_DATA_PACK(p)[p->skip_pack.size] == 0, 1070);
                for (int i = 0; i < PXT_NUM_SKIP_ENTRIES(p); ++i) {
                    CHECK(p->skip_pack.list[i] <= p->skip_pack.size, 1071);
                }
                break;
            }
            case BuiltInType::BoxedBuffer: {
                auto p = (BoxedBuffer *)vmLiteralVal(sect);
                CHECK(sect->size >= 16 + 4 + (uint32_t)p->length, 1072);
                break;
            }
            default:
                CHECK(false, 1050);
            }
            img->pointerLiterals[idx] = vmLiteralVal(sect);
            // TODO validate size/length of boxed string/buffer; check utf8 encoding?; 1042 error
        } else if (sect->type == SectionType::Function) {
            img->pointerLiterals[idx] = vmLiteralVal(sect);
            if (!img->entryPoint)
                img->entryPoint = (RefAction *)img->pointerLiterals[idx];
        } else if (sect->type == SectionType::VTable) {
            img->pointerLiterals[idx] = (TValue)(sect->data);
        } else {
            img->pointerLiterals[idx] = nullptr;
        }

        idx++;
    }

    CHECK_AT(img->infoHeader != NULL, 1019, 0);
    CHECK_AT(img->opcodes != NULL, 1020, 0);
    CHECK_AT(img->numberLiterals != NULL, 1021, 0);
    CHECK_AT(img->configData != NULL, 1022, 0);
    CHECK_AT(img->entryPoint != NULL, 1059, 0);

    return NULL;
}

static VMImage *loadIfaceNames(VMImage *img) {
    FOR_SECTIONS() {
        if (sect->type == SectionType::IfaceMemberNames) {
            uint32_t *ptrs = (uint32_t *)sect->data;
            auto len = *ptrs++;
            CHECK(len < 0x40000, 1047);
            uintptr_t *dst = ALLOC_ARRAY(uintptr_t, len + 1);
            img->ifaceMemberNames = dst;
            img->numIfaceMemberNames = len;
            *dst++ = len;
            CHECK(sect->size >= 12 + len * 4, 1047);
            for (unsigned i = 0; i < len; ++i) {
                CHECK(ptrs[i] < img->numSections, 1051);
                auto ss = img->sections[ptrs[i]];
                CHECK(isStringSection(ss), 1052);
                dst[i] = (uintptr_t)img->pointerLiterals[ptrs[i]];
                // pointers have to be sorted
                CHECK(i == 0 || dst[i - 1] < dst[i], 1053);
                // and so strings
                CHECK(i == 0 || String_::compare((String)dst[i - 1], (String)dst[i]) < 0, 1054);
            }
        }
    }

    return NULL;
}

void validateFunction(VMImage *img, VMImageSection *sect, int debug);

static VMImage *validateFunctions(VMImage *img) {
    FOR_SECTIONS() {
        if (sect->type == SectionType::VTable) {
            uint8_t *endp = sect->data + sect->size - 8;
            auto vt = (VTable *)sect->data;
            auto multBase = (uint16_t *)&vt->methods[VM_NUM_CPP_METHODS];
            CHECK((uint8_t *)multBase < endp,
                  1023); // basic size check, before dereferencing anything

            auto maxMult = 0xffffffffU >> (vt->ifaceHashMult & 0xff);

            CHECK(vt->numbytes < 1024, 1024);
            CHECK((vt->numbytes & 7) == 0, 1025);
            CHECK(vt->objectType == ValType::Object, 1026);
            CHECK(vt->magic == VTABLE_MAGIC, 1027);
            CHECK(vt->ifaceHashEntries > maxMult + 3, 1028);
            CHECK((uint8_t *)(multBase + vt->ifaceHashEntries) < endp, 1029);
            CHECK(vt->reserved == 0, 1030);
            CHECK(vt->ifaceHashMult != 0, 1031);
            CHECK((vt->ifaceHashEntries & 3) == 0, 1032);
            CHECK((int)vt->classNo >= (int)BuiltInType::User0, 1055);
            CHECK((int)vt->lastClassNo >= (int)vt->classNo, 1056);

            uint32_t maxOff = 0;
            uint32_t minOff = 0xfffffff;
            for (unsigned i = 0; i < vt->ifaceHashEntries; ++i) {
                uint32_t off2 = multBase[i];
                if (off2 > maxOff)
                    maxOff = off2;
                if (off2 < minOff)
                    minOff = off2;
                auto ent = (IfaceEntry *)multBase + off2;
                CHECK((uint8_t *)(ent + 1) <= endp, 1033);
            }

            CHECK(minOff * sizeof(IfaceEntry) == vt->ifaceHashEntries * 2, 1034);

            auto last1 = (IfaceEntry *)multBase + maxOff + 1;
            if (last1->memberId != 0)
                maxOff++;

            for (unsigned i = minOff; i <= maxOff; ++i) {
                auto ent = (IfaceEntry *)multBase + i;
                if (ent->memberId == 0)
                    continue;
                if (ent->aux == 0) {
                    CHECK(ent->method < (unsigned)(vt->numbytes >> 3), 1035);
                } else {
                    CHECK(ent->method < img->numSections, 1037);
                    auto fn = img->sections[ent->method];
                    CHECK(fn->type == SectionType::Function, 1039);
                }
            }

            auto p = (uint8_t *)((IfaceEntry *)multBase + maxOff + 1);
            while (p < endp)
                CHECK(*p++ == 0, 1040);
        }

        if (sect->type == SectionType::Function) {
            validateFunction(img, sect, 0);
            if (img->errorCode) {
                // try again with debug
                validateFunction(img, sect, 1);
                return img;
            }
        }
    }
    return NULL;
}

static VMImage *checkVTables(VMImage *img) {
    FOR_SECTIONS() {
        auto vt = vtFor(sect);
        if (vt) {
            CHECK(((RefObject *)vmLiteralVal(sect))->vtable == vt, 1057);
        }
        if (sect->type == SectionType::Literal) {
            CHECK(vt != NULL, 1043);
        } else if (sect->type == SectionType::VTable) {
            auto vt = (VTable *)sect->data;
            CHECK(vt->methods[0] == (void *)pxt::RefRecord_destroy, 1058);
            CHECK(vt->methods[1] == (void *)pxt::RefRecord_print, 1058);
            CHECK(vt->methods[2] == (void *)pxt::RefRecord_scan, 1058);
            CHECK(vt->methods[3] == (void *)pxt::RefRecord_gcsize, 1058);
        }
    }
    return NULL;
}

VMImage *loadVMImage(void *data, unsigned length) {
    auto img = new VMImage();
    memset(img, 0, sizeof(*img));

    DMESG("loading image at %p (%d bytes)", data, length);

    CHECK_AT(ALIGNED((uintptr_t)data), 1000, 0);
    CHECK_AT(ALIGNED(length), 1001, 0);

    img->dataStart = (uint64_t *)data;
    img->dataEnd = (uint64_t *)((uint8_t *)data + length);

    if (countSections(img) || checkVTables(img) || loadSections(img) || loadIfaceNames(img) ||
        validateFunctions(img)) {
        // error!
        return img;
    }

    DMESG("image loaded");

    return img;
}

void unloadVMImage(VMImage *img) {
    if (!img)
        return;

    free(img->pointerLiterals);
    free(img->sections);
    free(img->opcodes);
    free(img->opcodeDescs);
    free(img->numberLiterals);
    free(img->ifaceMemberNames);

    free(img->dataStart);
    memset(img, 0, sizeof(*img));
    delete img;
}

} // namespace pxt
