import { useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';

import Box from '@mui/material/Box';
import { UserButton } from "@clerk/clerk-react";
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';

// Icons
import SecurityIcon from '@mui/icons-material/Security';
import DashboardIcon from '@mui/icons-material/Dashboard';

import { useFileSystem } from '../context/FileSystemContext';
import Toolbar from './Toolbar';
import BreadcrumbsNav from './BreadcrumbsNav';
import FileExplorer from './FileExplorer';

export const FileManagerLayout = () => {
    const { folderId } = useParams<{ folderId: string }>(); // Получаем ID из URL
    const { loadFolder, state } = useFileSystem();
    const { pathname } = useLocation();
    console.log(pathname);


    // Эффект синхронизации: URL -> State
    useEffect(() => {
        // Если folderId undefined, значит мы в корне (или используем 'root' как ID корня)
        const targetId = folderId || 'root';
        loadFolder(targetId);
    }, [folderId, loadFolder]);

    if (state.isLoading) {
        return <div>Loading filesystem...</div>;
    }

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'background.default' }}>
            <Paper
                square
                elevation={0}
                sx={{
                    p: 2,
                    borderBottom: '1px solid rgba(255,255,255,0.1)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}
            >
                <Stack direction="row" spacing={2} alignItems="center">
                    <SecurityIcon color="primary" />
                    <Typography variant="h6" fontWeight="bold">Data Room</Typography>
                </Stack>
                <Box display="flex" flexDirection="row">
                    <BreadcrumbsNav />
                    <UserButton />
                </Box>
            </Paper>

            {state.items.length === 0 ?
                <Stack spacing={3} alignItems="center">
                    <DashboardIcon sx={{ fontSize: 60, color: 'text.secondary', opacity: 0.5 }} />
                    <Typography variant="h4">Welcome to the Data Room</Typography>
                    <Typography color="text.secondary">
                        You are now authenticated. This is where your files will live.
                    </Typography>

                    <Paper sx={{ p: 4, width: '100%', mt: 4, border: '1px dashed rgba(255,255,255,0.2)', bgcolor: 'transparent' }}>
                        <Typography align="center" color="text.secondary">No documents uploaded yet.</Typography>
                    </Paper>
                </Stack> :
                null
            }

            <Toolbar />
            <FileExplorer />
        </Box>
    );
};