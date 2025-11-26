import { Link } from 'react-router-dom';
import { useFileSystem } from '../context/FileSystemContext';
import Button from '@mui/material/Button';

const BreadcrumbsNav = () => {
    const { state } = useFileSystem();

    return (
        <nav style={{ padding: '10px 20px', background: '#f5f5f5' }}>
            <Button component={Link} to="/">
                Home
            </Button>

            {state.breadcrumbs.map((node) => (
                <span key={node.id}>
                    <span style={{ margin: '0 5px' }}>/</span>
                    {/* Последний элемент не должен быть ссылкой */}
                    {node.id === state.currentFolderId ? (
                        <Button>{node.name}</Button>
                    ) : (
                        <Button component={Link} to={`/folder/${node.id}`}>{node.name}</Button>
                    )}
                </span>
            ))}
        </nav>
    );
};

export default BreadcrumbsNav;