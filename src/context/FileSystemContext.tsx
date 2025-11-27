import { createContext, useContext, useReducer, useCallback, ReactNode, useEffect } from 'react';
import { backend, FileSystemNode } from '../services/db';
import { Action, FileSystemContextType, FileSystemState } from './types';

const initialState: FileSystemState = {
    currentFolderId: null,
    breadcrumbs: [],
    items: [],
    isLoading: false,
    error: null,
    isSearching: false,
    searchResults: [],
    uploads: {},
};

function reducer(state: FileSystemState, action: Action): FileSystemState {
    switch (action.type) {
        case 'NAVIGATE_START':
            return { ...state, isLoading: true, error: null, currentFolderId: action.payload };

        case 'NAVIGATE_SUCCESS':
            return {
                ...state,
                isLoading: false,
                items: action.payload.items,
                breadcrumbs: action.payload.breadcrumbs,
                currentFolderId: action.payload.folderId
            };

        case 'NAVIGATE_ERROR':
            return { ...state, isLoading: false, error: action.payload };

        case 'SEARCH_START':
            return { ...state, isSearching: true, error: null };

        case 'SEARCH_SUCCESS':
            return { ...state, isSearching: false, searchResults: action.payload };

        case 'SEARCH_ERROR':
            return { ...state, isSearching: false, error: action.payload };

        case 'CLEAR_SEARCH':
            return { ...state, isSearching: false, searchResults: [] };

        case 'CREATE_NODE_SUCCESS':
            return { ...state, items: [...state.items, action.payload] };

        case 'UPLOAD_PROGRESS':
            return {
                ...state,
                uploads: { ...state.uploads, [action.payload.id]: action.payload.progress }
            };

        case 'UPLOAD_COMPLETE': {
            const newUploads = { ...state.uploads };
            delete newUploads[action.payload.id];
            return {
                ...state,
                uploads: newUploads,
                items: [...state.items, action.payload.node]
            };
        }

        case 'DELETE_NODE':
            return {
                ...state,
                items: state.items.filter(item => item.id !== action.payload)
            };

        case 'RENAME_NODE_SUCCESS':
            return {
                ...state,
                items: state.items.map(item =>
                    item.id === action.payload.id
                        ? { ...item, name: action.payload.name, updatedAt: action.payload.updatedAt }
                        : item
                )
            };

        default:
            return state;
    }
}

const FileSystemContext = createContext<FileSystemContextType | undefined>(undefined);

export const FileSystemProvider = ({ children }: { children: ReactNode }) => {
    const [state, dispatch] = useReducer(reducer, initialState);

    // 1. Load folder contents
    const loadFolder = useCallback(async (folderId: string | null) => {
        dispatch({ type: 'NAVIGATE_START', payload: folderId });
        try {
            const [items, breadcrumbs] = await Promise.all([
                backend.getFolderContents(folderId),
                folderId ? backend.resolvePath(folderId) : Promise.resolve([])
            ]);

            dispatch({
                type: 'NAVIGATE_SUCCESS',
                payload: { items, breadcrumbs, folderId }
            });
        } catch (err) {
            console.error(err);
            dispatch({ type: 'NAVIGATE_ERROR', payload: 'Failed to load folder' });
        }
    }, []);

    // 2. Create folder
    const createFolder = useCallback(async (name: string) => {
        try {
            // Important: your service uses 'root' as the root ID, not null
            const parentId = state.currentFolderId || 'root'; // Default to 'root' if no current folder

            const newNode: FileSystemNode = {
                id: crypto.randomUUID(),
                parentId: parentId,
                name,
                type: 'folder',
                createdAt: Date.now(),
                updatedAt: Date.now(),
            };

            const createdNode = await backend.createNode(newNode);
            dispatch({ type: 'CREATE_NODE_SUCCESS', payload: createdNode });
        } catch (err) {
            console.error("Error creating folder:", err);
            alert(err instanceof Error ? err.message : 'Error creating folder');
        }
    }, [state.currentFolderId]);

    // 3. Upload file
    const uploadFile = useCallback(async (file: File) => {
        const fileId = crypto.randomUUID();
        const parentId = state.currentFolderId || 'root';

        // Emulate progress (Backend saves instantly, but we "draw" upload for UX)
        const totalSteps = 5;
        for (let step = 1; step <= totalSteps; step++) {
            await new Promise(r => setTimeout(r, 100));
            const progress = (step / totalSteps) * 100;
            dispatch({ type: 'UPLOAD_PROGRESS', payload: { id: fileId, progress } });
        }

        const newNode: FileSystemNode = {
            id: fileId,
            parentId: parentId,
            name: file.name,
            type: 'file',
            size: file.size,
            mimeType: file.type,
            content: file, // IndexedDB stores Blob/File well
            createdAt: Date.now(),
            updatedAt: Date.now(),
        };

        try {
            const createdNode = await backend.createNode(newNode);
            dispatch({ type: 'UPLOAD_COMPLETE', payload: { id: fileId, node: createdNode } });
        } catch (err) {
            console.error("Error uploading file:", err);
        }
    }, [state.currentFolderId]);

    const deleteNode = useCallback(async (nodeId: string) => {
        try {
            await backend.deleteNode(nodeId);
            dispatch({ type: 'DELETE_NODE', payload: nodeId });
        } catch (err) {
            console.error("Error deleting node:", err);
            alert("Can't delete node");
        }
    }, []);

    const renameNode = useCallback(async (nodeId: string, newName: string) => {
        try {
            const updatedNode = await backend.renameNode(nodeId, newName);
            dispatch({
                type: 'RENAME_NODE_SUCCESS',
                payload: {
                    id: nodeId,
                    name: updatedNode.name,
                    updatedAt: updatedNode.updatedAt
                }
            });
        } catch (err) {
            console.error("Rename Error:", err);
            alert(err instanceof Error ? err.message : "Can't rename");
        }
    }, []);

    // 6. Search files
    const searchFiles = useCallback(async (query: string) => {
        dispatch({ type: 'SEARCH_START' });
        try {
            const results = await backend.searchNodes(query);
            dispatch({ type: 'SEARCH_SUCCESS', payload: results });
        } catch (err) {
            dispatch({ type: 'SEARCH_ERROR', payload: `Search error: ${err}` });
        }
    }, []);

    // 7. Clear search
    const clearSearch = useCallback(() => {
        dispatch({ type: 'CLEAR_SEARCH' });
    }, []);

    useEffect(() => {
        // Load root folder initially if no current folder is set and items are empty
        if (!state.currentFolderId && state.items.length === 0 && !state.isSearching) {
            loadFolder(null);
        }
    }, [loadFolder, state.currentFolderId, state.items.length]);

    return (
        <FileSystemContext.Provider value={{
            state, loadFolder, createFolder, uploadFile, deleteNode, renameNode,
            searchFiles, clearSearch, searchResults: state.searchResults, isSearching: state.isSearching
        }}>
            {children}
        </FileSystemContext.Provider>
    );
};

export const useFileSystem = () => {
    const ctx = useContext(FileSystemContext);
    if (!ctx) throw new Error("useFileSystem must be used within FileSystemProvider");
    return ctx;
};