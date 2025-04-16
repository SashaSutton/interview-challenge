
import { useState, useEffect } from 'react';

export type AudioSettings = {
    playbackSpeed: number;
    filter: {
        type: 'lowpass' | 'highpass';
        frequency: number;
    };
};

const DEFAULT_SETTINGS: AudioSettings = {
    playbackSpeed: 1,
    filter: {
        type: 'lowpass',
        frequency: 1000
    }
};

export function useAudioSettings() {
    const [settings, setSettings] = useState<AudioSettings>(DEFAULT_SETTINGS);
    const [isLoading, setIsLoading] = useState(true);

    const loadSettings = async () => {
        try {
            setIsLoading(true);
            const response = await fetch('/api/settings');
            console.log('Loading settings response:', response.status);

            if (response.ok) {
                const data = await response.json();
                console.log('Loaded settings:', data);

                if (data.audioSettings) {
                    setSettings(data.audioSettings);
                }
            } else {
                console.error('Failed to load settings:', await response.text());
            }
        } catch (error) {
            console.error('Error loading settings:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const saveSettings = async (newSettings: AudioSettings) => {
        try {
            console.log('Saving settings:', newSettings);
            const response = await fetch('/api/settings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(
                    newSettings
                ),
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Failed to save settings:', errorText);
                throw new Error('Failed to save settings');
            }

            const savedData = await response.json();
            console.log('Settings saved successfully:', savedData);

            setSettings(newSettings);
        } catch (error) {
            console.error('Error saving settings:', error);
        }
    };

    useEffect(() => {
        loadSettings();
    }, []);

    return {
        settings,
        saveSettings,
        isLoading,
        reloadSettings: loadSettings
    };
}