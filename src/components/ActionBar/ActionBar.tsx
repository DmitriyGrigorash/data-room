import React, { useRef } from 'react';
import { useFileSystem } from '../../context/FileSystemContext';
import Button from '@mui/material/Button';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CreateNewFolderIcon from '@mui/icons-material/CreateNewFolder';
import Stack from '@mui/material/Stack';

import "./index.css"

const ActionBar = () => {
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
        <Stack className='ActionBar' spacing={1} alignItems="center" direction="row" justifyContent="space-between">
            <div>
                <Button
                    size='small'
                    component="label"
                    variant="contained"
                    tabIndex={-1}
                    startIcon={<CloudUploadIcon />}
                    onClick={() => fileInputRef.current?.click()}>
                    Upload
                </Button>
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    style={{ display: 'none' }}
                    onChange={handleFileChange}
                />
            </div>
            <CreateFolderButton />

        </Stack>
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

    return <Button
        size='small'
        variant="contained"
        startIcon={<CreateNewFolderIcon />}
        onClick={handleClick}>
        New Folder
    </Button>;
};

export default ActionBar; 
