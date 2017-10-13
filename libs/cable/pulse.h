#ifndef CABLE_PULSE_H
#define CABLE_PULSE_H

#include "pxt.h"
#include "bitvector.h"

#define IR_MAX_MSG_SIZE 34
#define IR_COMPONENT_ID 0x2042
#define CABLE_COMPONENT_ID 0x2043
#define IR_PACKET_END_EVENT 0x1
#define IR_PACKET_EVENT 0x2
#define IR_PACKET_ERROR_EVENT 0x3
#define IR_MAX_PULSES (IR_MAX_MSG_SIZE * 18 + 10)
#define IR_PULSE_LEN 250

#define IR_DEBUG 0

#if IR_DEBUG
#define IR_DMESG DMESG
#else
#define IR_DMESG(...)                                                                              \
    do {                                                                                           \
    } while (0)
#endif

namespace network {

class DbgBuffer {
public:
#if IR_DEBUG
    char dbgBuf[1200];
    int dbgPtr;
    DbgBuffer() {
        dbgBuf[0] = 0;
        dbgPtr = 0;
    }
#endif

    void put(const char *msg) {
#if IR_DEBUG
        int len = strlen(msg);
        if (len + dbgPtr > (int)sizeof(dbgBuf) - 1) {
            dbgPtr = 1;
            dbgBuf[0] = '>';
        }
        memcpy(dbgBuf + dbgPtr, msg, len + 1);
        dbgPtr += len;
#endif
    }

    void putNum(int n) {
#if IR_DEBUG
        char buf[30];
        itoa(n, buf);
        put(" ");
        put(buf);
#endif
    }

    const char *get() {
#if IR_DEBUG
        dbgPtr = 0;
        return dbgBuf;
#else
        return "NoDebug";
#endif
    }
};      

enum IrRecvState : uint8_t {
    IR_RECV_ERROR,
    IR_WAIT_START_GAP,
    IR_WAIT_DATA,
};

class PulseBase {
protected:
  DevicePin *pin;
  DevicePin *inpin;
  BitVector encodedMsg;
  int8_t pwmstate;
  bool sending;
  uint16_t id;
  uint64_t startTime;
  uint64_t sendStartTime;
  uint64_t lastMarkTime;
  uint64_t lastSendTime;

  int16_t pulses[IR_MAX_PULSES + 1];
  uint16_t pulsePtr;

  IrRecvState recvState;
  Buffer outBuffer;

  DbgBuffer dbg;

public:
  PulseBase(uint16_t id, int pinOut, int pinIn);
  virtual void setupGapEvents();
  virtual void listen();
  virtual void setupPWM();
  virtual void setPWM(int enabled);
  virtual void finishPWM();
  void send(Buffer d);
  void finish(int code);
  void addPulse(int v);
  void adjustShift();
  void pulseGap(Event ev);
  int errorRate(int start, BitVector &bits);
  void packetEnd(Event);
  void pulseMark(Event ev);
  Buffer getBuffer();   
  bool isReciving();
  void process();
};

}
#endif