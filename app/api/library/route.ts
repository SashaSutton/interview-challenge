// app/api/library/route.ts
import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { FILES_DIR } from '../../storage/constants';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { saveFileMetadata, getUserFiles, AudioFileMetadata } from '../../storage/file-metadata';

export async function GET() {
    try {
        const files = await getUserFiles();
        return NextResponse.json(files);
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to load files' },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json(
                { error: 'No file provided' },
                { status: 400 }
            );
        }

        // Generate a unique ID for the file
        const fileId = uuidv4();

        // Create the files directory if it doesn't exist
        await mkdir(FILES_DIR, { recursive: true });

        // Save the actual audio file
        const buffer = Buffer.from(await file.arrayBuffer());
        const filePath = path.join(FILES_DIR, `${fileId}.audio`);
        await writeFile(filePath, buffer);

        // Create and save metadata
        const metadata: AudioFileMetadata = {
            id: fileId,
            name: file.name,
            uploadedAt: new Date().toISOString()
        };
        await saveFileMetadata(metadata);

        return NextResponse.json(metadata);
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to upload file' },
            { status: 500 }
        );
    }
}