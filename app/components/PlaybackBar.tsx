import { FC, useEffect, useState, useRef } from "react";
import styles from "./PlaybackBar.module.css";

type PlaybackBarProps = {
  totalTimeMilliseconds: number;
  state:
      | {
    state: "stopped";
    positionMilliseconds: number;
  }
      | {
    state: "playing";
    effectiveStartTimeMilliseconds: number;
  };
  onSeek: (timeMillis: number) => void; // Callback for seeking
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
  const [positionMilliseconds, setPositionMilliseconds] = useState(0);
  const barRef = useRef<HTMLDivElement>(null);
  const [hoverTime, setHoverTime] = useState<number | null>(null);

  useEffect(() => {
    if (state.state === "stopped") {
      setPositionMilliseconds(state.positionMilliseconds);
    } else {
      let animationFrameId: number = -1;

      const updatePosition = () => {
        const now = Date.now();
        const elapsedTime = now - state.effectiveStartTimeMilliseconds;
        setPositionMilliseconds(elapsedTime);
        animationFrameId = requestAnimationFrame(updatePosition);
      };

      updatePosition();

      return () => {
        cancelAnimationFrame(animationFrameId);
      };
    }
  }, [state]);

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (barRef.current) {
      const rect = barRef.current.getBoundingClientRect();
      const offsetX = event.clientX - rect.left;
      const percentage = Math.min(Math.max(offsetX / rect.width, 0), 1);
      const time = percentage * totalTimeMilliseconds;
      setHoverTime(time);
    }
  };

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (barRef.current) {
      const rect = barRef.current.getBoundingClientRect();
      const offsetX = event.clientX - rect.left;
      const percentage = Math.min(Math.max(offsetX / rect.width, 0), 1);
      const time = percentage * totalTimeMilliseconds;
      onSeek(time);
    }
  };

  const positionPercentage = Math.min((positionMilliseconds / totalTimeMilliseconds) * 100, 100);

  return (
      <div className={styles.wrapper}>
        <div className={styles.meta}>
          <div>{formatMillis(positionMilliseconds)}</div>
          <div>{formatMillis(totalTimeMilliseconds)}</div>
        </div>
        <div
            className={styles.barContainer}
            ref={barRef}
            onMouseMove={handleMouseMove}
            onClick={handleClick}
        >
          <div className={styles.bar}>
            <div className={styles.progress} style={{ width: `${positionPercentage}%` }} />
            {hoverTime !== null && (
                <div className={styles.hoverTime} style={{ left: `${(hoverTime / totalTimeMilliseconds) * 100}%` }}>
                  {formatMillis(hoverTime)}
                </div>
            )}
          </div>
        </div>
      </div>
  );
};
