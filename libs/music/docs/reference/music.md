# Music

Generation of music tones.

```cards
pins.A8.playTone(0, 0);
pins.A8.ringTone(0);
pins.A8.rest(0);
music.noteFrequency(Note.C);
music.beat(BeatFraction.Whole);
music.tempo();
music.changeTempoBy(20);
music.setTempo(120);
music.onEvent(MusicEvent.MelodyNotePlayed, () => {})
```

### See Also

[playTone](/reference/music/play-tone), [ringTone](/reference/music/ring-tone), [rest](/reference/music/rest), [beat](/reference/music/beat), [tempo](/reference/music/tempo), [changeTempoBy](/reference/music/change-tempo-by), [setTempo](/reference/music/set-tempo),
[on event](/reference/music/on-event)
