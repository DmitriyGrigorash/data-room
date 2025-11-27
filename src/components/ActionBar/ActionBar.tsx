import React, { useRef } from 'react';

import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';

import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CreateNewFolderIcon from '@mui/icons-material/CreateNewFolder';

import { useFileSystem } from '../../context/FileSystemContext';

import "./index.css"

const ActionBar = () => {
    const { uploadFile } = useFileSystem();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            // Convert FileList to an array and start uploading in parallel
            Array.from(e.target.files).forEach(file => uploadFile(file));
        }
        // Reset the input so the same file can be uploaded again
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

export const CreateFolderButton = () => {
    const { createFolder } = useFileSystem();

    const handleClick = () => {
        const name = prompt("Enter folder name:");
        if (name && name.trim()) {
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
