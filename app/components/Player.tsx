
"use client";
import { FC, useCallback, useEffect, useState } from "react";
import { FilePicker } from "./FilePicker";
import { AudioContextContext } from "./AudioContextProvider";
import { PlayerPlayback } from "./PlayerPlayback";
import styles from "./Player.module.css";

type PlayerProps = {
    fileId?: string;
};

export const Player: FC<PlayerProps> = ({ fileId }) => {
    const [context, setContext] = useState<AudioContext | null>(null);
    const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const context = new AudioContext();
        setContext(context);
        return () => {
            context.close();
        };
    }, []);

    useEffect(() => {
        if (fileId && context) {
            loadAudioFile(fileId);
        }
    }, [fileId, context]);

    const loadAudioFile = async (id: string) => {
        if (!context) return;

        setIsLoading(true);
        try {
            const response = await fetch(`/api/library/${id}/audio`);
            if (!response.ok) throw new Error('Failed to load audio file');

            const arrayBuffer = await response.arrayBuffer();
            const buffer = await context.decodeAudioData(arrayBuffer);
            setAudioBuffer(buffer);
        } catch (error) {
            console.error('Error loading audio:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const onFileSelect = useCallback(
        async (file: File) => {
            if (context) {
                const arrayBuffer = await file.arrayBuffer();
                const buffer = await context.decodeAudioData(arrayBuffer);
                setAudioBuffer(buffer);
            }
        },
        [context]
    );

    if (!context) {
        return null;
    }

    if (isLoading) {
        return <div className={styles.loading}>Loading audio...</div>;
    }

    return (
        <div className={styles.playerContainer}>
            <AudioContextContext.Provider value={context}>
                {!audioBuffer && !fileId && <FilePicker onFileSelect={onFileSelect} />}
                {audioBuffer && (
                    <PlayerPlayback context={context} audioBuffer={audioBuffer} />
                )}
            </AudioContextContext.Provider>
        </div>
    );
};