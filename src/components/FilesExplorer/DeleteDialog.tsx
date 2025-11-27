import {
    Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button
} from '@mui/material';

import { FileSystemNode } from '../../services/db';

interface DeleteDialogProps {
    open: boolean;
    node: FileSystemNode | null;
    onClose: () => void;
    onConfirm: () => void;
}

export const DeleteDialog = ({ open, node, onClose, onConfirm }: DeleteDialogProps) => {
    if (!node) return null; // Don't render if no node is selected

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>Delete Item?</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Are you sure you want to delete "{node.name}"?
                    {node.type === 'folder' && " This will also delete all its contents."}
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="primary">
                    Cancel
                </Button>
                <Button onClick={onConfirm} color="error" variant="contained" autoFocus>
                    Delete
                </Button>
            </DialogActions>
        </Dialog>
    );
};