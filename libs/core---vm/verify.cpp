#include "pxt.h"

namespace pxt {

#define ERROR(code, pos)                                                                           \
    do {                                                                                           \
        img->errorOffset = (uint8_t *)pos - (uint8_t *)img->dataStart;                             \
        img->errorCode = code;                                                                     \
        return img;                                                                                \
    } while (0)
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
    for (auto sect = (VMImageSection *)img->dataStart; (uint64_t *)sect < img->dataEnd;            \
         sect = (VMImageSection *)((uint8_t *)sect + sect->size))

static VMImage *countSections(VMImage *img) {
    auto p = img->dataStart;
    while (p < img->dataEnd) {
        auto sect = (VMImageSection *)p;
        CHECK(ALIGNED(sect->size), 1002);
        img->numSections++;
        p += sect->size >> 3;
    }
    CHECK_AT(p == img->dataEnd, 1003, p);
    img->pointerLiterals = new TValue[img->numSections];

    return NULL;
}

static VMImage *loadSections(VMImage *img) {
    auto idx = 0;
    FOR_SECTIONS() {
        CHECK(sect->size < 32000, 1014);

        if (sect->type == SectionType::InfoHeader) {
            CHECK(sect->size >= sizeof(VMImageHeader), 1008);
            auto hd = (VMImageHeader *)sect->data;
            CHECK(hd->magic0 == VM_MAGIC0, 1009);
            CHECK(hd->magic1 == VM_MAGIC1, 1010);
            CHECK(hd->allocGlobals >= hd->nonPointerGlobals, 1011);
            CHECK(hd->allocGlobals < 10000, 1012);
            CHECK(!img->infoHeader, 1013);
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
            CHECK(img->numOpcodes > OPCODE_BASE_MASK, 1016);

            img->opcodes = new OpFun[img->numOpcodes];
            img->opcodeDescs = new const OpcodeDesc *[img->numOpcodes];

            int i = 0;
            while (curr < endp) {
                img->opcodeDescs[i] = NULL;
                if (*curr) {
                    for (auto st = staticOpcodes; st->name; st++) {
                        if (strcmp(st->name, (const char *)curr) == 0) {
                            img->opcodeDescs[i] = st;
                            break;
                        }
                    }
                    // unresolved symbol; report name?
                    CHECK_AT(img->opcodeDescs[i] != NULL, 1018, curr);
                }
                img->opcodes[i] = img->opcodeDescs[i] ? img->opcodeDescs[i]->fn : NULL;

                while (*curr)
                    curr++;
            }
        }

        if (sect->type == SectionType::IfaceMemberNames) {
            // TODO
        }

        if (sect->type == SectionType::NumberLiterals) {
            CHECK(!img->numberLiterals, 1004);
            img->numNumberLiterals = sect->size >> 3;
            img->numberLiterals = (TValue *)sect->data;
            for (unsigned i = 0; i < img->numNumberLiterals; ++i) {
                auto ptr = &img->numberLiterals[i];
                auto v = *ptr;
                if (isDouble(v))
                    CHECK_AT(!isnan(doubleVal(v)), 1005, ptr);
                else if (isInt(v))
                    CHECK_AT(((uintptr_t)v >> 1) <= 0xffffffff, 1006, ptr);
                else
                    CHECK_AT(false, 1007, ptr);
            }
        }

        if (sect->type == SectionType::ConfigData) {
            img->numConfigDataEntries = sect->size >> 3;
            img->configData = (uint32_t *)sect->data;
        }

        if ((int)sect->type >= 0x20)
            img->pointerLiterals[idx] = (TValue)sect;
        else
            img->pointerLiterals[idx] = nullptr;

        idx++;
    }
    return NULL;
}

void validateFunction(VMImage *img, VMImageSection *sect);

static VMImage *validateFunctions(VMImage *img) {
    FOR_SECTIONS() {
        if (sect->type != SectionType::Function)
            continue;
        validateFunction(img, sect);
    }
    return NULL;
}

VMImage *loadVMImage(void *data, unsigned length) {
    auto img = new VMImage();
    memset(img, 0, sizeof(*img));

    CHECK_AT(0, ALIGNED((uintptr_t)data), 1000);
    CHECK_AT(0, ALIGNED(length), 1001);

    img->dataStart = (uint64_t *)data;
    img->dataEnd = (uint64_t *)((uint8_t *)data + length);

    if (countSections(img) || loadSections(img) || validateFunctions(img)) {
        // error!
        return img;
    }

    return img;
}

} // namespace pxt