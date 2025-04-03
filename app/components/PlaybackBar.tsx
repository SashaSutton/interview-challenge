import { FC, useEffect, useState, useRef } from "react";
import styles from "./PlaybackBar.module.css";

type StoppedState = {
  state: "stopped";
  positionMilliseconds: number;
};

type PlayingState = {
  state: "playing";
  effectiveStartTimeMilliseconds: number;
};

type PlaybackState = StoppedState | PlayingState;

type PlaybackBarProps = {
  totalTimeMilliseconds: number;
  state: PlaybackState;
  onSeek: (timeMillis: number) => void;
};

const formatMillis = (timeMillis: number) => {
  const minutes = Math.floor(timeMillis / 60000);
  const seconds = `${Math.floor((timeMillis - minutes * 60000) / 1000)}`.padStart(2, "0");
  return `${minutes}:${seconds}`;
};

export const PlaybackBar: FC<PlaybackBarProps> = ({
                                                    totalTimeMilliseconds,
                                                    state,
                                                    onSeek,
                                                  }) => {
  const initialPosition = state.state === "stopped"
      ? state.positionMilliseconds
      : Date.now() - state.effectiveStartTimeMilliseconds;

  const [visualPosition, setVisualPosition] = useState(initialPosition);
  const barRef = useRef<HTMLDivElement>(null);
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    if (state.state === "stopped") {
      setVisualPosition((state as StoppedState).positionMilliseconds);
    }
  }, [state.state, state.state === "stopped" ? (state as StoppedState).positionMilliseconds : null]);

  useEffect(() => {
    if (state.state !== "playing") return;

    let animationFrameId: number;
    const updatePosition = () => {
      const now = Date.now();
      const elapsedTime = now - (state as PlayingState).effectiveStartTimeMilliseconds;
      setVisualPosition(elapsedTime);
      animationFrameId = requestAnimationFrame(updatePosition);
    };

    updatePosition();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [state]);

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!barRef.current || !totalTimeMilliseconds) return;

    const rect = barRef.current.getBoundingClientRect();
    const offsetX = event.clientX - rect.left;
    const percentage = Math.min(Math.max(offsetX / rect.width, 0), 1);
    const time = Math.floor(percentage * totalTimeMilliseconds);

    setVisualPosition(time);
    onSeek(time);
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!barRef.current || !totalTimeMilliseconds) return;

    const rect = barRef.current.getBoundingClientRect();
    const offsetX = event.clientX - rect.left;
    const percentage = Math.min(Math.max(offsetX / rect.width, 0), 1);
    const time = Math.floor(percentage * totalTimeMilliseconds);
    setHoverTime(time);
  };

  const positionPercentage = Math.min(
      (visualPosition / totalTimeMilliseconds) * 100,
      100
  );

  return (
      <div className={styles.wrapper}>
        <div className={styles.meta}>
          <div>{formatMillis(visualPosition)}</div>
          <div>{formatMillis(totalTimeMilliseconds)}</div>
        </div>
        <div
            className={styles.barContainer}
            ref={barRef}
            onMouseMove={handleMouseMove}
            onClick={handleClick}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => {
              setIsHovering(false);
              setHoverTime(null);
            }}
        >
          <div className={styles.bar}>
            <div
                className={styles.progress}
                style={{ width: `${positionPercentage}%` }}
            />
            {isHovering && hoverTime !== null && (
                <div
                    className={styles.hoverIndicator}
                    style={{ left: `${(hoverTime / totalTimeMilliseconds) * 100}%` }}
                >
                  <div className={styles.hoverTime}>
                    {formatMillis(hoverTime)}
                  </div>
                </div>
            )}
          </div>
        </div>
      </div>
  );
};