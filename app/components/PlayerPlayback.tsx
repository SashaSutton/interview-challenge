import { FC, useCallback, useEffect, useRef, useState } from "react";
import { PlaybackBar } from "./PlaybackBar";
import { FilterControls } from "./FilterControls";
import styles from "./PlayerPlayback.module.css";

type PlayerPlaybackProps = {
  context: AudioContext;
  audioBuffer: AudioBuffer | null;
};

type PlaybackState =
    | { state: "stopped"; positionMilliseconds: number }
    | { state: "playing"; effectiveStartTimeMilliseconds: number; source: AudioBufferSourceNode };

export const PlayerPlayback: FC<PlayerPlaybackProps> = ({ context, audioBuffer }) => {
  const [playbackState, setPlaybackState] = useState<PlaybackState>({
    state: "stopped",
    positionMilliseconds: 0,
  });
  const [playbackRate, setPlaybackRate] = useState<number>(1);
  const [filterType, setFilterType] = useState<"lowpass" | "highpass">("lowpass");
  const [filterFrequency, setFilterFrequency] = useState<number>(1000);
  const filterEnabled = useRef<boolean>(false);
  const gainNode = useRef<GainNode | null>(null);
  const filterNode = useRef<BiquadFilterNode | null>(null);

  useEffect(() => {
    gainNode.current = context.createGain();
    filterNode.current = context.createBiquadFilter();
    filterNode.current.type = filterType;
    filterNode.current.frequency.value = filterFrequency;
    gainNode.current.connect(context.destination);
  }, [context]);

  useEffect(() => {
    if (filterNode.current) {
      filterNode.current.type = filterType;
    }
  }, [filterType]);

  useEffect(() => {
    if (filterNode.current) {
      filterNode.current.frequency.value = filterFrequency;
    }
  }, [filterFrequency]);

  const play = useCallback(() => {
    if (!audioBuffer || playbackState.state === "playing") {
      return;
    }
    const source = context.createBufferSource();
    source.buffer = audioBuffer;
    source.playbackRate.value = playbackRate;
    if (filterEnabled.current && filterNode.current && gainNode.current) {
      source.connect(filterNode.current);
      filterNode.current.connect(gainNode.current);
    } else if (gainNode.current) {
      source.connect(gainNode.current);
    }
    const effectiveStartTimeMilliseconds = Date.now() - playbackState.positionMilliseconds;
    source.start(0, playbackState.positionMilliseconds / 1000);
    setPlaybackState({
      state: "playing",
      effectiveStartTimeMilliseconds,
      source,
    });
  }, [audioBuffer, playbackRate, playbackState, context]);

  const handleSeek = useCallback(
      (goToPositionMillis: number) => {
        if (!audioBuffer || playbackState.state !== "playing") {
          setPlaybackState({
            state: "stopped",
            positionMilliseconds: goToPositionMillis,
          });
          return;
        }
        const source = context.createBufferSource();
        source.buffer = audioBuffer;
        source.playbackRate.value = playbackRate;
        if (filterEnabled.current && filterNode.current && gainNode.current) {
          source.connect(filterNode.current);
          filterNode.current.connect(gainNode.current);
        } else if (gainNode.current) {
          source.connect(gainNode.current);
        }
        source.start(0, goToPositionMillis / 1000);
        playbackState.source.stop();
        setPlaybackState({
          state: "playing",
          effectiveStartTimeMilliseconds: Date.now() - goToPositionMillis,
          source,
        });
      },
      [audioBuffer, playbackRate, playbackState, context]
  );

  const pause = useCallback(() => {
    if (playbackState.state === "playing") {
      playbackState.source.stop();
      setPlaybackState({
        state: "stopped",
        positionMilliseconds: Date.now() - playbackState.effectiveStartTimeMilliseconds,
      });
    }
  }, [playbackState]);

  const stop = useCallback(() => {
    if (playbackState.state === "playing") {
      playbackState.source.stop();
    }
    setPlaybackState({
      state: "stopped",
      positionMilliseconds: 0,
    });
  }, [playbackState]);

  const handlePlaybackRateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newRate = parseFloat(event.target.value);
    if (playbackState.state === "playing") {
      playbackState.source.playbackRate.value = newRate;
    }
    setPlaybackRate(newRate);
  };

  const handleFilterChange = (type: "lowpass" | "highpass", frequency: number) => {
    setFilterType(type);
    setFilterFrequency(frequency);
    filterEnabled.current = true;
  };

  if (!audioBuffer) {
    return "No Audio File Loaded";
  }

  return (
      <>
        <div className={styles.controls}>
          {playbackState.state === "playing" ? (
              <button className={styles.button} onClick={pause}>
                Pause
              </button>
          ) : (
              <button className={styles.button} onClick={play}>
                Play
              </button>
          )}
          <button className={styles.button} onClick={stop}>
            Stop
          </button>
          <div className={styles.speedBoxContainer}>
            <div className={styles.speedBox}>
              <label>
                Playback Speed ({playbackRate.toFixed(1)}x)
                <input
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.1"
                    value={playbackRate}
                    onChange={handlePlaybackRateChange}
                    className={styles.speedSlider}
                />
              </label>
            </div>
          </div>
        </div>
        <FilterControls
            filterType={filterType}
            frequency={filterFrequency}
            onFilterChange={(type, freq) => handleFilterChange(type, freq)}
        />
        <PlaybackBar
            totalTimeMilliseconds={audioBuffer.duration * 1000}
            state={playbackState}
            onSeek={handleSeek}
        />
      </>
  );
};