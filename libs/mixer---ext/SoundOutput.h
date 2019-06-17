#define SAMPLE_RATE 44100

namespace music {
class WSynthesizer;

class ExtDAC {
  public:
    WSynthesizer &src;
    ExtDAC(WSynthesizer &data);
    int getSampleRate() { return SAMPLE_RATE; }
};

class SoundOutput {
  public:
    ExtDAC dac;

    SoundOutput(WSynthesizer &data) : dac(data) {}

    void setOutput(int) {}
};

} // namespace music