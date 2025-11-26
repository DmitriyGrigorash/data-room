import { Link } from 'react-router-dom';
import { useFileSystem } from '../context/FileSystemContext';

const FileExplorer = () => {
    const { state } = useFileSystem();

    if (state.items.length === 0) {
        return <div style={{ padding: '20px', color: '#888' }}>This folder is empty.</div>;
    }

    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '15px', padding: '20px' }}>
            {state.items.map((node) => (
                <div key={node.id} style={{ textAlign: 'center' }}>
                    {node.type === 'folder' ? (
                        <Link to={`/folder/${node.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                            <div style={{ fontSize: '40px' }}>📁</div>
                            <div style={{ wordBreak: 'break-word' }}>{node.name}</div>
                        </Link>
                    ) : (
                        <div style={{ cursor: 'pointer' }}>
                            <div style={{ fontSize: '40px' }}>📄</div>
                            <div style={{ wordBreak: 'break-word' }}>{node.name}</div>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default FileExplorer;