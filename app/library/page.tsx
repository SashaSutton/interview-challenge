
"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

type AudioFile = {
    id: string;
    name: string;
    uploadedAt: string;
};

export default function LibraryPage() {
    const [files, setFiles] = useState<AudioFile[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editingId, setEditingId] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        loadFiles();
    }, []);

    const loadFiles = async () => {
        try {
            const response = await fetch('/api/library');
            if (response.ok) {
                const data = await response.json();
                setFiles(data);
            }
        } catch (error) {
            console.error('Error loading files:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('/api/library', {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                loadFiles();
            }
        } catch (error) {
            console.error('Error uploading file:', error);
        }
    };

    const handleRename = async (fileId: string, newName: string) => {
        try {
            const response = await fetch(`/api/library/${fileId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name: newName }),
            });

            if (response.ok) {
                loadFiles();
                setEditingId(null);
            }
        } catch (error) {
            console.error('Error renaming file:', error);
        }
    };

    const handleDelete = async (fileId: string) => {
        if (!confirm('Are you sure you want to delete this file?')) return;

        try {
            const response = await fetch(`/api/library/${fileId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                loadFiles();
            }
        } catch (error) {
            console.error('Error deleting file:', error);
        }
    };

    const handlePlay = (fileId: string) => {
        router.push(`/player/${fileId}`);
    };

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Audio Library</h1>

            <div className={styles.uploadSection}>
                <label className={styles.uploadButton}>
                    <svg className={styles.uploadIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M12 5v14M5 12h14" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                    Upload New Audio
                    <input
                        type="file"
                        accept="audio/*"
                        onChange={handleUpload}
                        className={styles.fileInput}
                        hidden
                    />
                </label>
            </div>

            {isLoading ? (
                <div className={styles.loading}>Loading...</div>
            ) : (
                <div className={styles.fileList}>
                    {files.length === 0 ? (
                        <div className={styles.noFiles}>
                            <p>No audio files uploaded yet</p>
                        </div>
                    ) : (
                        files.map((file) => (
                            <div key={file.id} className={styles.fileItem}>
                                <div className={styles.fileInfo}>
                                    {editingId === file.id ? (
                                        <input
                                            type="text"
                                            defaultValue={file.name}
                                            className={styles.renameInput}
                                            onBlur={(e) => handleRename(file.id, e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    handleRename(file.id, e.currentTarget.value);
                                                }
                                            }}
                                            autoFocus
                                        />
                                    ) : (
                                        <div className={styles.fileName} onClick={() => setEditingId(file.id)}>
                                            {file.name}
                                        </div>
                                    )}
                                    <span className={styles.uploadDate}>
                    {new Date(file.uploadedAt).toLocaleDateString()}
                  </span>
                                </div>
                                <div className={styles.fileActions}>
                                    <button
                                        onClick={() => handlePlay(file.id)}
                                        className={`${styles.actionButton} ${styles.playButton}`}
                                    >
                                        <svg viewBox="0 0 24 24" fill="currentColor" className={styles.buttonIcon}>
                                            <path d="M8 5v14l11-7z"/>
                                        </svg>
                                        Play
                                    </button>
                                    <button
                                        onClick={() => handleDelete(file.id)}
                                        className={`${styles.actionButton} ${styles.deleteButton}`}
                                    >
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className={styles.buttonIcon}>
                                            <path d="M19 7l-3 13H8L5 7M20 7H4M10 11V17M14 11V17" strokeWidth="2"/>
                                        </svg>
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}