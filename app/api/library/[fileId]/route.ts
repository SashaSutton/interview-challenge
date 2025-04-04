
import { NextResponse } from 'next/server';
import { unlink } from 'fs/promises';
import path from 'path';
import { FILES_DIR } from '../../../storage/constants';
import { updateFileMetadata, deleteFileMetadata } from '../../../storage/file-metadata';

export async function DELETE(
    request: Request,
    { params }: { params: { fileId: string } }
) {
    try {

        const filePath = path.join(FILES_DIR, `${params.fileId}.audio`);
        await unlink(filePath);


        await deleteFileMetadata(params.fileId);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Delete error:', error);
        return NextResponse.json(
            { error: 'Failed to delete file' },
            { status: 500 }
        );
    }
}