
import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';
import { FILES_DIR } from '../../../../storage/constants';

export async function GET(
    request: Request,
    { params }: { params: { fileId: string } }
) {
    try {
        const filePath = path.join(FILES_DIR, `${params.fileId}.audio`);
        const fileBuffer = await readFile(filePath);

        return new NextResponse(fileBuffer, {
            headers: {
                'Content-Type': 'audio/mpeg',
                'Content-Length': fileBuffer.length.toString(),
            },
        });
    } catch (error) {
        console.error('Error loading audio file:', error);
        return NextResponse.json(
            { error: 'Failed to load audio file' },
            { status: 500 }
        );
    }
}