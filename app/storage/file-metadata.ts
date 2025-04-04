
import { readFile, writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { USER_DATA_DIR } from './constants';
import { getUserId } from './user-data';

export type AudioFileMetadata = {
    id: string;
    name: string;
    uploadedAt: string;
};


const getMetadataFilePath = async () => {
    const userId = await getUserId();
    return path.join(USER_DATA_DIR, `${userId}-files.json`);
};


export const getUserFiles = async (): Promise<AudioFileMetadata[]> => {
    try {
        const metadataPath = await getMetadataFilePath();
        const data = await readFile(metadataPath, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
};


export const saveFileMetadata = async (metadata: AudioFileMetadata): Promise<void> => {
    const files = await getUserFiles();
    files.push(metadata);

    const metadataPath = await getMetadataFilePath();
    await mkdir(path.dirname(metadataPath), { recursive: true });
    await writeFile(metadataPath, JSON.stringify(files, null, 2));
};


export const updateFileMetadata = async (
    fileId: string,
    updates: Partial<Omit<AudioFileMetadata, 'id'>>
): Promise<void> => {
    const files = await getUserFiles();
    const fileIndex = files.findIndex(file => file.id === fileId);

    if (fileIndex === -1) {
        throw new Error('File not found');
    }

    files[fileIndex] = {
        ...files[fileIndex],
        ...updates
    };

    const metadataPath = await getMetadataFilePath();
    await writeFile(metadataPath, JSON.stringify(files, null, 2));
};


export const deleteFileMetadata = async (fileId: string): Promise<void> => {
    const files = await getUserFiles();
    const updatedFiles = files.filter(file => file.id !== fileId);

    const metadataPath = await getMetadataFilePath();
    await writeFile(metadataPath, JSON.stringify(updatedFiles, null, 2));
};