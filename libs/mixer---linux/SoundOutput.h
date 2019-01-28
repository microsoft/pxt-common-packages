#include "Synthesizer.h"
#include "Mixer.h"

using namespace codal;

#define SAMPLE_RATE 44100

class LinuxDAC : public DataSink {
  public:
    DataSource &src;
    LinuxDAC(DataSource &data);
    static void *play(void *);
    virtual int pullRequest() { return 0; }
    int getSampleRate() { return SAMPLE_RATE; }
};

class SoundOutput {
  public:
    LinuxDAC dac;

    SoundOutput(DataSource &data) : dac(data) {}

    void setOutput(int) {}
};
