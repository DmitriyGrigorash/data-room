import { Link as RouterLink } from 'react-router-dom';
import { Breadcrumbs, Link, Typography, Box } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';

import { useFileSystem } from '../context/FileSystemContext';

const BreadcrumbsNav = () => {
    const { state } = useFileSystem();

    return (
        <Box sx={{
            margin: "20px 0 0"
        }}>
            <Breadcrumbs aria-label="breadcrumb">
                {state.currentFolderId === null ? (
                    <Typography
                        sx={{ display: 'flex', alignItems: 'center' }}
                        color="text.primary"
                        fontWeight="500"
                    >
                        <HomeIcon sx={{ mr: 1 }} fontSize="medium" />
                        Home
                    </Typography>
                ) : (
                    <Link
                        component={RouterLink}
                        underline="hover"
                        sx={{ display: 'flex', alignItems: 'center' }}
                        color="inherit"
                        to="/"
                    >
                        <HomeIcon sx={{ mr: 1 }} fontSize="medium" />
                        Home
                    </Link>
                )}

                {/* DYNAMIC PATH SEGMENTS */}
                {state.breadcrumbs.map((node, index) => {
                    // Check if the current node in the loop is the last one in the breadcrumb trail.
                    const isLast = index === state.breadcrumbs.length - 1 && node.id === state.currentFolderId;

                    return isLast ? (
                        <Typography key={node.id} color="text.primary" fontWeight="500">
                            {node.name}
                        </Typography>
                    ) : (
                        <Link
                            key={node.id}
                            component={RouterLink}
                            to={`/folder/${node.id}`}
                            underline="hover"
                            color="inherit"
                        >
                            {node.name}
                        </Link>
                    );
                })}
            </Breadcrumbs>
        </Box>
    );
};

export default BreadcrumbsNav;