# Music

Play tones and melodies. Make musical notes.

```cards
music.playTone(null,null);
music.startMelody([], MelodyOptions.Once)
music.playMelody([])
music.ringTone(0);
music.rest(0);
music.noteFrequency(Note.C);
music.beat(BeatFraction.Whole);
music.tempo();
music.setPitchPin(null)
music.changeTempoBy(20);
music.setTempo(120);
music.onEvent(MusicEvent.MelodyNotePlayed, () => {})
music.setSpeakerVolume(0)
music.setPitchPin(null)
```