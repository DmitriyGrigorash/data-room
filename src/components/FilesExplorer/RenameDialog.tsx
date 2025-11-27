import { useState, useEffect } from 'react';
import {
    Dialog, DialogTitle, DialogContent, TextField, DialogActions, Button
} from '@mui/material';

interface RenameDialogProps {
    open: boolean;
    initialName: string;
    onClose: () => void;
    onSave: (newName: string) => void;
}

export const RenameDialog = ({ open, initialName, onClose, onSave }: RenameDialogProps) => {
    const [newName, setNewName] = useState(initialName);

    // Update internal state if the initialName prop changes (e.g., when opening for a different file)
    useEffect(() => {
        if (open) {
            setNewName(initialName);
        }
    }, [open, initialName]);

    const handleSave = () => {
        if (newName.trim()) {
            onSave(newName.trim());
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
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
                    onKeyDown={(e) => { if (e.key === 'Enter') handleSave(); }}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button onClick={handleSave}>Save</Button>
            </DialogActions>
        </Dialog>
    );
};