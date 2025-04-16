
import { NextResponse } from 'next/server';
import {AUDIO_SETTINGS_DATA, getDataForCurrentUser, updateDataForCurrentUser} from '@/app/storage/user-data';

// import { getDataForCurrentUser, updateDataForCurrentUser } from '@/storage/user-data';

export async function GET() {
    try {
        const userData = await getDataForCurrentUser();
        console.log('GET settings:', userData);
        return NextResponse.json(userData);
    } catch (error) {
        console.error('GET settings error:', error);
        return NextResponse.json(
            { error: 'Failed to load settings' },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const audioSettings = AUDIO_SETTINGS_DATA.parse(await request.json());
        console.log('POST settings received:', audioSettings);

        const updated = await updateDataForCurrentUser((current) => ({
            ...current,
            audioSettings: audioSettings
        }));

        console.log('POST settings updated:', updated);
        return NextResponse.json(updated);
    } catch (error) {
        console.error('POST settings error:', error);
        return NextResponse.json(
            { error: 'Failed to save settings' },
            { status: 500 }
        );
    }
}

