import { FC, useEffect, useState } from "react";
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
};

const formatMillis = (timeMillis: number) => {
  const minutes = Math.floor(timeMillis / 60000);
  const seconds =
    `${Math.floor((timeMillis - minutes * 60000) / 1000)}`.padStart(2, "0");
  const millis = `${Math.round(timeMillis % 1000)}`.padStart(3, "0");
  return `${minutes}:${seconds}:${millis}`;
};

export const PlaybackBar: FC<PlaybackBarProps> = ({
  totalTimeMilliseconds,
  state,
}) => {
  const [positionMilliseconds, setPositionMilliseconds] = useState(0);

  useEffect(() => {
    if (state.state === "stopped") {
      setPositionMilliseconds(state.positionMilliseconds);
    } else {
      // Update the positionMilliseconds every animation frame
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
  }, [totalTimeMilliseconds, state]);

  const positionPercentage = Math.min(
    (positionMilliseconds / totalTimeMilliseconds) * 100,
    100,
  );

  return (
    <div className={styles.wrapper}>
      <div className={styles.meta}>
        <div>{formatMillis(positionMilliseconds)}</div>
        <div>{formatMillis(totalTimeMilliseconds)}</div>
      </div>
      <div className={styles.bar}>
        <div
          className={styles.progress}
          style={{ width: `${positionPercentage}%` }}
        />
      </div>
    </div>
  );
};
