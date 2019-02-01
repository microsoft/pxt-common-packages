# Info

Keep score, run the countdown timer, and track life status.

## Score

```cards
info.setScore(0)
info.changeScoreBy(1)
info.score()
info.highScore()
```

## Life Count

```cards
info.setLife(0)
info.changeLifeBy(1)
info.life()
info.onLifeZero(function () {})
```

## Countdown Timer

```cards
info.startCountdown(0)
info.stopCountdown()
info.onCountdownEnd(function () {})
```

## Multiplayer

```cards
info.player1.onLifeZero(function () {})
info.player1.hasLife()
info.player1.changeLifeBy(-1)
info.player1.setLife(3)
info.player1.life()
info.player1.changeScoreBy(1)
info.player1.setScore(0)
info.player1.score()
```

## See also

[set score](/reference/info/set-score),
[change score by](/reference/info/change-score-by),
[score](/reference/info/score),
[high score](/reference/info/high-score),
[set life](/reference/info/set-life),
[change life by](/reference/info/change-life-by),
[life](/reference/info/life),
[on life zero](/reference/info/on-life-zero),
[start countdown](/reference/info/start-countdown),
[stop countdown](/reference/info/stop-countdown),
[on countdown end](/reference/info/on-countdown-end)
