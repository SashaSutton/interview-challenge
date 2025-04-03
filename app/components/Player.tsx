"use client";
import { FC, useCallback, useEffect, useState } from "react";
import { FilePicker } from "./FilePicker";
import { readFile } from "../util";
import { AudioContextContext } from "./AudioContextProvider";
import { PlayerPlayback } from "./PlayerPlayback";

export const Player: FC = () => {
  const [context, setContext] = useState<AudioContext | null>(null);
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);

  useEffect(() => {
    const context = new AudioContext();
    setContext(context);
    return () => {
      context.close();
    };
  }, []);

  const onFileSelect = useCallback(
    async (file: File) => {
      if (context) {
        const bytes = await readFile(file);
        const buffer = await context.decodeAudioData(bytes);
        setAudioBuffer(buffer);
      }
    },
    [context],
  );

  if (!context) {
    return null;
  }

  return (
    <AudioContextContext.Provider value={context}>
      <FilePicker onFileSelect={onFileSelect} />
      <PlayerPlayback context={context} audioBuffer={audioBuffer} />
    </AudioContextContext.Provider>
  );
};
