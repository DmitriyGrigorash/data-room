import { Routes, Route } from 'react-router-dom';

import { FileSystemProvider } from "../context/FileSystemContext";
import { FileManagerLayout } from '../components/FileManagerLayout';

const Dashboard = () => {
    return (
        <FileSystemProvider>
            <Routes>
                <Route path="/" element={<FileManagerLayout />} />
                <Route path="/folder/:folderId" element={<FileManagerLayout />} />

                {/* Обработка 404 */}
                <Route path="*" element={<div>Page not found</div>} />
            </Routes>
        </FileSystemProvider>
    );
}

export default Dashboard;
