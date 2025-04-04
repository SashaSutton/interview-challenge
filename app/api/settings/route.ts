
import { NextResponse } from 'next/server';
import { getDataForCurrentUser, updateDataForCurrentUser } from '@/app/storage/user-data';

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
        const body = await request.json();
        console.log('POST settings received:', body);

        const updated = await updateDataForCurrentUser((current) => ({
            ...current,
            audioSettings: {
                playbackSpeed: body.audioSettings.playbackSpeed,
                filter: {
                    type: body.audioSettings.filter.type,
                    frequency: body.audioSettings.filter.frequency
                }
            }
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