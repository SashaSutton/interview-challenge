import { FC, useCallback, useEffect, useState } from "react";
import { PlaybackBar } from "./PlaybackBar";
import styles from "./PlayerPlayback.module.css";

type PlayerPlaybackProps = {
  context: AudioContext;
  audioBuffer: AudioBuffer | null;
};

type PlaybackState =
    | {
  state: "stopped";
  positionMilliseconds: number;
}
    | {
  state: "playing";
  effectiveStartTimeMilliseconds: number;
  source: AudioBufferSourceNode;
};

export const PlayerPlayback: FC<PlayerPlaybackProps> = ({
                                                          context,
                                                          audioBuffer,
                                                        }) => {
  const [playbackState, setPlaybackState] = useState<PlaybackState>({
    state: "stopped",
    positionMilliseconds: 0,
  });

  const [playbackRate, setPlaybackRate] = useState<number>(1);

  useEffect(() => {
    setPlaybackState({
      state: "stopped",
      positionMilliseconds: 0,
    });
    setPlaybackRate(1);
  }, [audioBuffer]);

  const play = useCallback(() => {
    if (!audioBuffer) {
      return;
    }

    if (playbackState.state === "playing") {
      return;
    }

    const source = context.createBufferSource();
    source.buffer = audioBuffer;
    source.playbackRate.value = playbackRate;

    const effectiveStartTimeMilliseconds =
        Date.now() - playbackState.positionMilliseconds;

    source.connect(context.destination);
    source.start(0, playbackState.positionMilliseconds / 1000);

    setPlaybackState({
      state: "playing",
      effectiveStartTimeMilliseconds,
      source,
    });
  }, [context, audioBuffer, playbackState, playbackRate]);

  const stopAndGoTo = useCallback(
      (goToPositionMillis?: number) => {
        if (playbackState.state === "stopped") {
          if (goToPositionMillis !== undefined) {
            setPlaybackState({
              state: "stopped",
              positionMilliseconds: goToPositionMillis,
            });
          }
          return;
        }
        const positionMilliseconds =
            goToPositionMillis ??
            Date.now() - playbackState.effectiveStartTimeMilliseconds;
        playbackState.source.stop();

        setPlaybackState({
          state: "stopped",
          positionMilliseconds,
        });
        setPlaybackRate(1);
      },
      [playbackState]
  );

  const pause = useCallback(() => stopAndGoTo(), [stopAndGoTo]);

  const stop = useCallback(() => stopAndGoTo(0), [stopAndGoTo]);

  const handlePlaybackRateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newRate = parseFloat(event.target.value);

    if (playbackState.state === "playing") {
      playbackState.source.playbackRate.value = newRate;
    }
    setPlaybackRate(newRate);
  };

  const handleSeek = (timeMillis: number) => {
    if (playbackState.state === "playing") {
      // If playing, stop the current source and create a new one
      playbackState.source.stop();
      const source = context.createBufferSource();
      source.buffer = audioBuffer!;
      source.playbackRate.value = playbackRate;

      const effectiveStartTimeMilliseconds = Date.now() - timeMillis;

      source.connect(context.destination);
      source.start(0, timeMillis / 1000);

      setPlaybackState({
        state: "playing",
        effectiveStartTimeMilliseconds,
        source,
      });
    } else {
      // If stopped, just update the position
      setPlaybackState({
        state: "stopped",
        positionMilliseconds: timeMillis,
      });
    }
  };

  if (!audioBuffer) {
    return "No Audio File Loaded";
  }

  return (
      <>
        <div className={styles.controls}>
          {playbackState.state === "playing" ? (
              <button className={styles.button} onClick={pause}>Pause</button>
          ) : (
              <button className={styles.button} onClick={play}>Play</button>
          )}
          <button className={styles.button} onClick={stop}>Stop</button>
        </div>
        <div className={styles.speedBoxContainer}>
          <div className={styles.speedBox}>
            <label htmlFor="playbackRate">Playback Speed</label>
            <input
                className={styles.speedSlider}
                type="range"
                id="playbackRate"
                min="0.5"
                max="2"
                step="0.1"
                value={playbackRate}
                onChange={handlePlaybackRateChange}
            />
            <span>{playbackRate.toFixed(2)}x</span>
          </div>
        </div>
        <PlaybackBar
            state={playbackState}
            totalTimeMilliseconds={audioBuffer.duration * 1000}
            onSeek={handleSeek}
        />
      </>
  );
};
