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
import BreadcrumbsNav from './BreadcrumbsNav';
import FileExplorer from './FilesExplorer/FileExplorer';
import AppBar from '@mui/material/AppBar';
import ActionBar from './ActionBar/ActionBar';
import CircularProgress from '@mui/material/CircularProgress';

export const FileManagerLayout = () => {
    const { folderId } = useParams<{ folderId: string }>(); // Получаем ID из URL
    const { loadFolder, state } = useFileSystem();
    const { pathname } = useLocation();

    useEffect(() => {
        // Если folderId не указан или равен "root", грузим корень (null)
        const activeFolderId = (folderId === 'root' || !folderId) ? null : folderId;

        loadFolder(activeFolderId);

    }, [folderId, loadFolder]);

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'background.default' }}>

            <AppBar
                position="sticky"
                style={{
                    borderRadius: 0,
                    padding: '10px 15px',
                }}>

                <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Stack direction="row" spacing={1} alignItems="center">
                        <SecurityIcon color="primary" />
                        <Typography variant="h6" fontWeight="bold">Data Room</Typography>
                    </Stack>
                    <UserButton />
                </Stack>
                <BreadcrumbsNav />
            </AppBar>

            <Box sx={{ flexGrow: 1 }}>
                {state.isLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <>
                        {state.items.length === 0 && pathname === '/' && (
                            <Stack spacing={3} alignItems="center" sx={{ mt: 4 }}>
                                <DashboardIcon sx={{ fontSize: 60, color: 'text.secondary', opacity: 0.5 }} />
                                <Typography variant="h4">Welcome to the Data Room</Typography>
                                <Typography color="text.secondary">
                                    You are now authenticated. This is where your files will live.
                                </Typography>

                                <Paper sx={{ p: 4, width: '80%', maxWidth: '800px', mt: 4, border: '1px dashed rgba(0,0,0,0.1)', bgcolor: 'transparent' }}>
                                    <Typography align="center" color="text.secondary">No documents uploaded yet.</Typography>
                                </Paper>
                            </Stack>
                        )}

                        <FileExplorer />
                        <ActionBar />
                    </>
                )}
            </Box>
        </Box>
    );
};