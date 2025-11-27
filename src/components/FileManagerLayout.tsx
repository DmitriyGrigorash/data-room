import { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';

import Box from '@mui/material/Box';
import { UserButton } from "@clerk/clerk-react";
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import ActionBar from './ActionBar/ActionBar';
import CircularProgress from '@mui/material/CircularProgress';
import AppBar from '@mui/material/AppBar';

import SearchIcon from '@mui/icons-material/Search';
import SecurityIcon from '@mui/icons-material/Security';
import DashboardIcon from '@mui/icons-material/Dashboard';

import { useFileSystem } from '../context/FileSystemContext';
import BreadcrumbsNav from './BreadcrumbsNav';
import FileExplorer from './FilesExplorer/FileExplorer';



export const FileManagerLayout = () => {
    const { folderId } = useParams<{ folderId: string }>(); // Get folderId from the URL
    const { loadFolder, state, searchFiles, clearSearch, searchResults, isSearching } = useFileSystem();
    const { pathname } = useLocation();
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        // If there's a search query, do not load folder contents
        if (searchQuery) return;

        // If folderId is not specified or is "root", load the root (null)
        const activeFolderId = (folderId === 'root' || !folderId) ? null : folderId;

        loadFolder(activeFolderId);
    }, [folderId, loadFolder, searchQuery]);

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
                    <Stack direction="row" spacing={3} alignItems="center">
                        <TextField
                            size="small"
                            variant="outlined"
                            placeholder="Search all files..."
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                if (e.target.value) {
                                    searchFiles(e.target.value);
                                } else {
                                    clearSearch();
                                }
                            }}
                            InputProps={{
                                startAdornment: (<InputAdornment position="start"><SearchIcon /></InputAdornment>),
                            }}
                        />
                    <UserButton />
                    </Stack>
                </Stack>

                {!searchQuery && <BreadcrumbsNav />}
            </AppBar>

            <Box sx={{ flexGrow: 1 }}>
                {state.isLoading || isSearching ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <>
                        {state.items.length === 0 && pathname === '/' && !searchQuery && (
                            <Stack spacing={3} alignItems="center" sx={{ mt: 4 }}>
                                <DashboardIcon sx={{ fontSize: 60, color: 'text.secondary', opacity: 0.5 }} />
                                <Typography variant="h4">Welcome to the Data Room</Typography>
                                <Typography color="text.secondary">
                                    You are now authenticated. This is where your files will live.
                                </Typography>
                            </Stack>
                        )}

                        <FileExplorer items={searchQuery ? searchResults : state.items} />
                    </>
                )}
            </Box>
            <ActionBar />
        </Box>
    );
};