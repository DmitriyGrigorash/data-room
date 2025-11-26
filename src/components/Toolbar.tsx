import React, { useRef } from 'react';
import { useFileSystem } from '../context/FileSystemContext';
import Button from '@mui/material/Button';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';

const Toolbar = () => {
    const { uploadFile } = useFileSystem();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            // Преобразуем FileList в массив и запускаем загрузку параллельно
            Array.from(e.target.files).forEach(file => uploadFile(file));
        }
        // Сбрасываем input, чтобы можно было загрузить тот же файл повторно
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <section className="toolbar" style={{ padding: '10px', display: 'flex', gap: '10px' }}>
            <Container maxWidth="lg" sx={{ mt: 8, flexGrow: 1 }}>
                <Stack spacing={3} alignItems="center">
                    <div>
                        <Button
                            component="label"
                            variant="contained"
                            tabIndex={-1}
                            startIcon={<CloudUploadIcon />}
                            onClick={() => fileInputRef.current?.click()}>
                            Upload Files
                        </Button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            multiple
                            style={{ display: 'none' }}
                            onChange={handleFileChange}
                        />
                        <CreateFolderButton />
                    </div>
                </Stack>
            </Container>
        </section>
    );
};

// Встраивается в Toolbar
export const CreateFolderButton = () => {
    const { createFolder } = useFileSystem();

    const handleClick = () => {
        const name = prompt("Enter folder name:");
        if (name && name.trim()) {
            // Здесь можно добавить валидацию на спецсимволы
            createFolder(name.trim());
        }
    };

    return <button onClick={handleClick}>New Folder</button>;
};

export default Toolbar; 
