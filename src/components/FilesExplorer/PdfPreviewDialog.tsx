import React, { useEffect, useState } from 'react';
import {
    Dialog, Slide, AppBar, Toolbar, IconButton, Typography
} from '@mui/material';
import { TransitionProps } from '@mui/material/transitions';
import CloseIcon from '@mui/icons-material/Close';
import { FileSystemNode } from '../../services/db';

// Define the slide-up transition for the dialog
const Transition = React.forwardRef(function Transition(
    props: TransitionProps & { children: React.ReactElement; },
    ref: React.Ref<unknown>,
) {
    return <Slide direction="up" ref={ref} {...props} />;
});

interface PdfPreviewDialogProps {
    file: FileSystemNode | null; // The file to preview. Dialog is open if file is not null.
    onClose: () => void;         // Callback to close the dialog.
}

export const PdfPreviewDialog = ({ file, onClose }: PdfPreviewDialogProps) => {
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    useEffect(() => {
        // Create a temporary object URL from the file's blob content
        if (file && file.content) {
            const url = URL.createObjectURL(file.content);
            setPreviewUrl(url);

            // Clean up the object URL on component unmount or when the file changes to prevent memory leaks
            return () => URL.revokeObjectURL(url);
        } else {
            setPreviewUrl(null);
        }
    }, [file]);

    return (
        <Dialog
            fullScreen
            open={Boolean(file)}
            onClose={onClose}
            TransitionComponent={Transition}
        >
            <AppBar sx={{ position: 'relative', bgcolor: '#333' }}>
                <Toolbar>
                    <IconButton edge="start" color="inherit" onClick={onClose} aria-label="close">
                        <CloseIcon />
                    </IconButton>
                    <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
                        {file?.name}
                    </Typography>
                </Toolbar>
            </AppBar>

            {/* The iframe displays the PDF natively using the browser's capabilities */}
            {previewUrl && (
                <iframe
                    src={previewUrl}
                    style={{ width: '100%', height: '100%', border: 'none' }}
                    title="PDF Preview"
                />
            )}
        </Dialog>
    );
};