import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
    List, ListItem, ListItemText, ListItemIcon,
    ListItemButton,
    IconButton, Menu, MenuItem
} from '@mui/material';

import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import FolderIcon from '@mui/icons-material/Folder';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';

import { useFileSystem } from '../../context/FileSystemContext';
import { FileSystemNode } from '../../services/db';

import { PdfPreviewDialog } from './PdfPreviewDialog';
import { RenameDialog } from './RenameDialog';
import { DeleteDialog } from './DeleteDialog';

import './index.css'


// Define type for props
interface FileExplorerProps {
    items: FileSystemNode[];
}

const FileExplorer = ({ items }: FileExplorerProps) => {
    const navigate = useNavigate();
    const { deleteNode, renameNode } = useFileSystem();

    // State for the context menu (three dots)
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [selectedNode, setSelectedNode] = useState<FileSystemNode | null>(null);

    // State for controlling dialogs
    const [isRenameOpen, setRenameOpen] = useState(false);
    const [isDeleteOpen, setDeleteOpen] = useState(false);
    const [previewFile, setPreviewFile] = useState<FileSystemNode | null>(null);

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, node: FileSystemNode) => {
        event.stopPropagation(); // Prevent triggering ListItemButton's onClick
        setAnchorEl(event.currentTarget);
        setSelectedNode(node);
    };
    const handleMenuClose = () => { setAnchorEl(null); };

    const handleDeleteClick = () => {
        handleMenuClose();
        setDeleteOpen(true); // Open delete confirmation dialog
    };

    const handleDeleteConfirm = async () => {
        if (selectedNode) {
            await deleteNode(selectedNode.id);
        }
        setDeleteOpen(false);
    };

    const handleRenameStart = () => {
        handleMenuClose();
        setRenameOpen(true); // Open rename dialog
    };

    const handleRenameSave = async (newName: string) => {
        if (selectedNode) {
            await renameNode(selectedNode.id, newName);
            setRenameOpen(false);
        }
    };

    // --- NAVIGATION AND FILE OPENING ---
    const handleNavigate = (node: FileSystemNode) => {
        if (node.type === 'folder') {
            navigate(`/folder/${node.id}`);
        } else if (node.mimeType === 'application/pdf') {
            // Open PDF preview only for PDF files
            setPreviewFile(node);
        } else {
            alert("Preview is available only for PDF files.");
        }
    };

    const getIcon = (node: FileSystemNode) => {
        if (node.type === 'folder') return <FolderIcon color="primary" />;
        if (node.mimeType === 'application/pdf') return <PictureAsPdfIcon color="error" />;
        return <InsertDriveFileIcon color="action" />;
    };

    return (
        <section className='FileExplorer'>
            {/* List of files and folders */}
            <List>
                {items.map((node) => (
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

            {/* Context menu for rename/delete actions */}
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

            {/* Render the extracted dialog components */}
            <PdfPreviewDialog
                file={previewFile}
                onClose={() => setPreviewFile(null)}
            />

            <RenameDialog
                open={isRenameOpen}
                initialName={selectedNode?.name || ''}
                onClose={() => setRenameOpen(false)}
                onSave={handleRenameSave}
            />

            <DeleteDialog
                open={isDeleteOpen}
                node={selectedNode}
                onClose={() => setDeleteOpen(false)}
                onConfirm={handleDeleteConfirm}
            />
        </section>
    );
};

export default FileExplorer
