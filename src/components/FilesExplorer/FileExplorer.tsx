import React, { useEffect, useState } from 'react';
import {
    List, ListItem, ListItemText, ListItemIcon,
    ListItemButton,
    IconButton, Menu, MenuItem, Dialog,
    DialogTitle, DialogContent, TextField,
    DialogActions, Button, Typography,
    DialogContentText,
    Slide,
    AppBar,
    Toolbar
} from '@mui/material';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import FolderIcon from '@mui/icons-material/Folder';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import CloseIcon from '@mui/icons-material/Close';
import { TransitionProps } from '@mui/material/transitions';

import { useFileSystem } from '../../context/FileSystemContext';
import { FileSystemNode } from '../../services/db';
import { useNavigate } from 'react-router-dom';

import './index.css'

// Анимация открытия диалога (слайд снизу вверх)
const Transition = React.forwardRef(function Transition(
    props: TransitionProps & {
        children: React.ReactElement;
    },
    ref: React.Ref<unknown>,
) {
    return <Slide direction="up" ref={ref} {...props} />;
});

const FileExplorer = () => {
    const navigate = useNavigate();
    const { state, deleteNode, renameNode } = useFileSystem();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [selectedNode, setSelectedNode] = useState<FileSystemNode | null>(null);
    const [isRenameOpen, setRenameOpen] = useState(false);
    const [isDeleteOpen, setDeleteOpen] = useState(false);
    const [newName, setNewName] = useState('');

    // --- Состояние для PDF Превью ---
    const [previewFile, setPreviewFile] = useState<FileSystemNode | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    // --- Эффект для создания/очистки URL ---
    useEffect(() => {
        if (previewFile && previewFile.content) {
            // Создаем временную ссылку на Blob
            const url = URL.createObjectURL(previewFile.content);
            setPreviewUrl(url);

            // Очистка при закрытии (чтобы не забивать память)
            return () => URL.revokeObjectURL(url);
        } else {
            setPreviewUrl(null);
        }
    }, [previewFile]);

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, node: FileSystemNode) => {
        event.stopPropagation();
        setAnchorEl(event.currentTarget);
        setSelectedNode(node);
    };
    const handleMenuClose = () => { setAnchorEl(null); };

    const handleDeleteClick = () => {
        setDeleteOpen(true);
        handleMenuClose();
    };

    const handleDeleteConfirm = async () => {
        if (selectedNode) {
            await deleteNode(selectedNode.id);
        }
        setDeleteOpen(false);
    };

    const handleRenameStart = () => {
        if (selectedNode) { setNewName(selectedNode.name); setRenameOpen(true); }
        handleMenuClose();
    };

    const handleRenameSave = async () => {
        if (selectedNode && newName.trim()) {
            await renameNode(selectedNode.id, newName.trim());
            setRenameOpen(false);
        }
    };

    // --- НАВИГАЦИЯ И ОТКРЫТИЕ ФАЙЛОВ ---
    const handleNavigate = (node: FileSystemNode) => {
        if (node.type === 'folder') {
            navigate(`/folder/${node.id}`);
        } else {
            // Проверяем, является ли файл PDF
            if (node.mimeType === 'application/pdf') {
                setPreviewFile(node);
            } else {
                // Для остальных файлов пока можно просто предложить скачивание или alert
                alert("Preview is available only for PDF files currently.");
            }
        }
    };

    const handleClosePreview = () => {
        setPreviewFile(null);
    };

    // --- Рендер иконки ---
    const getIcon = (node: FileSystemNode) => {
        if (node.type === 'folder') return <FolderIcon color="primary" />;
        if (node.mimeType === 'application/pdf') return <PictureAsPdfIcon color="error" />;
        return <InsertDriveFileIcon color="action" />;
    };

    return (
        <section className='FileExplorer'>
            <List>
                {state.items.length === 0 && (
                    <Typography variant='h5' align="center" color="text.secondary">
                        Folder is empty
                    </Typography>
                )}

                {state.items.map((node) => (
                    <ListItem
                        className='FileExplorer__ListItem'
                        key={node.id}
                        disablePadding
                        secondaryAction={
                            <IconButton edge="end" onClick={(e) => handleMenuOpen(e, node)}>
                                <MoreVertIcon />
                            </IconButton>
                        }
                    >
                        <ListItemButton
                            onClick={() => handleNavigate(node)}
                            className='FileExplorer__ListItem'
                        >
                            <ListItemIcon>
                                {getIcon(node)}
                            </ListItemIcon>
                            <ListItemText
                                primary={node.name}
                                secondary={node.type === 'file' && node.size
                                    ? `${(node.size / 1024).toFixed(1)} KB`
                                    : null
                                }
                            />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>

            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
            >
                <MenuItem onClick={handleRenameStart}>
                    <ListItemIcon><EditIcon fontSize="small" /></ListItemIcon>
                    Rename
                </MenuItem>
                <MenuItem onClick={handleDeleteClick} sx={{ color: 'error.main' }}>
                    <ListItemIcon><DeleteIcon fontSize="small" color="error" /></ListItemIcon>
                    Delete
                </MenuItem>
            </Menu>

            {/* --- PDF Viewer Dialog --- */}
            <Dialog
                fullScreen
                open={Boolean(previewFile)}
                onClose={handleClosePreview}
                TransitionComponent={Transition}
            >
                <AppBar sx={{ position: 'relative', bgcolor: '#333' }}>
                    <Toolbar>
                        <IconButton
                            edge="start"
                            color="inherit"
                            onClick={handleClosePreview}
                            aria-label="close"
                        >
                            <CloseIcon />
                        </IconButton>
                        <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
                            {previewFile?.name}
                        </Typography>
                    </Toolbar>
                </AppBar>

                {/* Iframe отображает PDF нативно силами браузера */}
                {previewUrl && (
                    <iframe
                        src={previewUrl}
                        style={{ width: '100%', height: '100%', border: 'none' }}
                        title="PDF Preview"
                    />
                )}
            </Dialog>

            <Dialog open={isRenameOpen} onClose={() => setRenameOpen(false)}>
                <DialogTitle>Rename Item</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="New Name"
                        type="text"
                        fullWidth
                        variant="standard"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleRenameSave(); }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setRenameOpen(false)}>Cancel</Button>
                    <Button onClick={handleRenameSave}>Save</Button>
                </DialogActions>
            </Dialog>

            {/* --- НОВЫЙ Диалог Удаления --- */}
            <Dialog
                open={isDeleteOpen}
                onClose={() => setDeleteOpen(false)}
            >
                <DialogTitle>Delete Item?</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete "{selectedNode?.name}"?
                        {selectedNode?.type === 'folder' && " This will delete all files inside."}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteOpen(false)} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleDeleteConfirm} color="error" variant="contained" autoFocus>
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </section>
    );
};

export default FileExplorer
