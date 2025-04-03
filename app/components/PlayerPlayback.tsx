"use client";

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

  useEffect(() => {
    // Whenever new audio is loaded, reset the playback state
    setPlaybackState({
      state: "stopped",
      positionMilliseconds: 0,
    });
  }, [audioBuffer]);

  const play = useCallback(() => {
    if (!audioBuffer) {
      return;
    }

    if (playbackState.state === "playing") {
      // Already playing
      return;
    }

    const source = context.createBufferSource();
    source.buffer = audioBuffer;

    const effectiveStartTimeMilliseconds =
      Date.now() - playbackState.positionMilliseconds;

    source.connect(context.destination);
    source.start(0, playbackState.positionMilliseconds / 1000);

    setPlaybackState({
      state: "playing",
      effectiveStartTimeMilliseconds,
      source,
    });
  }, [context, audioBuffer, playbackState]);

  const stopAndGoTo = useCallback(
    (goToPositionMillis?: number) => {
      if (playbackState.state === "stopped") {
        // Already paused, just seek to new position
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
    },
    [playbackState],
  );

  const pause = useCallback(() => stopAndGoTo(), [stopAndGoTo]);

  const stop = useCallback(() => stopAndGoTo(0), [stopAndGoTo]);

  if (!audioBuffer) {
    return "No Audio File Loaded";
  }

  return (
    <>
      <div className={styles.controls}>
        {playbackState.state === "playing" ? (
          <button onClick={pause}>Pause</button>
        ) : (
          <button onClick={play}>Play</button>
        )}
        <button onClick={stop}>Stop</button>
      </div>

      <PlaybackBar
        state={playbackState}
        totalTimeMilliseconds={audioBuffer.duration * 1000}
      />
    </>
  );
};
