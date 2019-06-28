#define SAMPLE_RATE 44100

namespace music {
class WSynthesizer;

class LinuxDAC {
  public:
    int16_t data[256];
    WSynthesizer &src;
    LinuxDAC(WSynthesizer &data);
    static void *play(void *);
    int getSampleRate() { return SAMPLE_RATE; }
};

class SoundOutput {
  public:
    LinuxDAC dac;

    SoundOutput(WSynthesizer &data) : dac(data) {}

    void setOutput(int) {}
};

} // namespace music