import { FC, useCallback, useEffect, useRef, useState } from "react";
import { PlaybackBar } from "./PlaybackBar";
import { FilterControls } from "./FilterControls";
import styles from "./PlayerPlayback.module.css";
import { useAudioSettings } from "../hooks/useAudioSettings";

type PlayerPlaybackProps = {
  context: AudioContext;
  audioBuffer: AudioBuffer | null;
};

type PlaybackState =
    | { state: "stopped"; positionMilliseconds: number }
    | { state: "playing"; effectiveStartTimeMilliseconds: number; source: AudioBufferSourceNode };

export const PlayerPlayback: FC<PlayerPlaybackProps> = ({ context, audioBuffer }) => {
  const { settings, saveSettings } = useAudioSettings();
  const [playbackState, setPlaybackState] = useState<PlaybackState>({
    state: "stopped",
    positionMilliseconds: 0,
  });

  const filterEnabled = useRef<boolean>(true);
  const gainNode = useRef<GainNode | null>(null);
  const filterNode = useRef<BiquadFilterNode | null>(null);

  const validateFrequency = (freq: number): number => {
    if (!isFinite(freq) || isNaN(freq)) return 1000;
    return Math.max(20, Math.min(20000, freq));
  };

  useEffect(() => {
    gainNode.current = context.createGain();
    filterNode.current = context.createBiquadFilter();
    if (filterNode.current) {
      filterNode.current.type = settings.filter.type;
      filterNode.current.frequency.value = validateFrequency(settings.filter.frequency);
      filterNode.current.connect(gainNode.current!);
    }
    gainNode.current.connect(context.destination);
  }, [context]);

  useEffect(() => {
    if (filterNode.current) {
      filterNode.current.type = settings.filter.type;
    }
  }, [settings.filter.type]);

  useEffect(() => {
    if (filterNode.current) {
      const safeFrequency = validateFrequency(settings.filter.frequency);
      filterNode.current.frequency.value = safeFrequency;
    }
  }, [settings.filter.frequency]);

  const play = useCallback(() => {
    if (!audioBuffer || playbackState.state === "playing") {
      return;
    }
    const source = context.createBufferSource();
    source.buffer = audioBuffer;
    source.playbackRate.value = Math.max(0.1, Math.min(4, settings.playbackSpeed));

    if (filterNode.current && gainNode.current) {
      source.connect(filterNode.current);
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
  }, [audioBuffer, settings.playbackSpeed, playbackState, context]);

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
        source.playbackRate.value = Math.max(0.1, Math.min(4, settings.playbackSpeed));

        if (filterNode.current && gainNode.current) {
          source.connect(filterNode.current);
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
      [audioBuffer, settings.playbackSpeed, playbackState, context]
  );

  const handlePlaybackRateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newRate = Math.max(0.1, Math.min(4, parseFloat(event.target.value)));
    if (playbackState.state === "playing") {
      playbackState.source.playbackRate.value = newRate;
    }
    saveSettings({
      ...settings,
      playbackSpeed: newRate
    });
  };

  const handleFilterChange = (type: "lowpass" | "highpass", frequency: number) => {
    const safeFrequency = validateFrequency(frequency);
    saveSettings({
      ...settings,
      filter: {
        type,
        frequency: safeFrequency
      }
    });
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
                Playback Speed ({settings.playbackSpeed.toFixed(1)}x)
                <input
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.1"
                    value={settings.playbackSpeed}
                    onChange={handlePlaybackRateChange}
                    className={styles.speedSlider}
                />
              </label>
            </div>
          </div>
        </div>
        <FilterControls
            filterType={settings.filter.type}
            frequency={validateFrequency(settings.filter.frequency)}
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