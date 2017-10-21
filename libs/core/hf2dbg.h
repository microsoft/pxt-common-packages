#ifndef HF2DBG_H
#define HF2DBG_H 1

// we use a location at the top of the stack to store a magic value
// which causes us to stop at the very first break point in the program
#define HF2_DBG_MAGIC_PTR ((uint32_t *)(DEVICE_STACK_BASE - (DEVICE_STACK_SIZE - 4)))
#define HF2_DBG_MAGIC_START 0xf0ebac7f

#define HF2_DBG_GET_GLOBAL_STATE 0x53fc66e0
struct HF2_GLOBAL_STATE_Result {
    uint32_t num_globals;
    uint32_t globals_addr;
};

#define HF2_DBG_RESTART 0x1120bd93
#define HF2_DBG_RESUME 0x27a55931
#define HF2_EV_DBG_PAUSED 0x3692f9fd
#define HF2_DBG_GET_STACK 0x70901510

#endif
