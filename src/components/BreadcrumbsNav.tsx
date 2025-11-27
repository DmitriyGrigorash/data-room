import { Link as RouterLink } from 'react-router-dom';
import { Breadcrumbs, Link, Typography, Box } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home'; // Убедись, что иконка импортирована
import { useFileSystem } from '../context/FileSystemContext';

const BreadcrumbsNav = () => {
    const { state } = useFileSystem();

    return (
        <Box sx={{
            margin: "20px 0 0"
        }}>
            <Breadcrumbs aria-label="breadcrumb">
                {/* 1. КНОПКА HOME */}
                {state.currentFolderId === null ? (
                    // Если мы в корне — просто текст (неактивный)
                    <Typography 
                        sx={{ display: 'flex', alignItems: 'center' }} 
                        color="text.primary"
                        fontWeight="500"
                    >
                        <HomeIcon sx={{ mr: 1 }} fontSize="medium"/>
                        Home
                    </Typography>
                ) : (
                    // Если мы в глубине — ссылка
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

                {/* 2. ОСТАЛЬНОЙ ПУТЬ */}
                {state.breadcrumbs.map((node, index) => {
                    // Проверяем, последний ли это элемент
                    const isLast = index === state.breadcrumbs.length - 1 && node.id === state.currentFolderId;

                    return isLast ? (
                        // ТЕКУЩАЯ ПАПКА -> Неактивный текст (Typography)
                        <Typography key={node.id} color="text.primary" fontWeight="500">
                            {node.name}
                        </Typography>
                    ) : (
                        // РОДИТЕЛЬСКАЯ ПАПКА -> Активная ссылка (Link)
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