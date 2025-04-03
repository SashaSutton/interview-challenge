import { createContext, useContext } from "react";

export const AudioContextContext = createContext<AudioContext | null>(null);

export const useAudioContext = (): AudioContext => {
  const audioContext = useContext(AudioContextContext);
  if (!audioContext) {
    throw new Error("AudioContextProvider not found");
  }
  return audioContext;
};
