import { createContext, useContext, useReducer, useCallback, ReactNode, useEffect } from 'react';
import { backend, FileSystemNode } from '../services/db';
import { Action, FileSystemState } from './types';

const initialState: FileSystemState = {
    currentFolderId: null,
    breadcrumbs: [],
    items: [],
    isLoading: false,
    error: null,
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

        default:
            return state;
    }
}

// --- 2. Контекст ---

interface FileSystemContextType {
    state: FileSystemState;
    loadFolder: (folderId: string | null) => Promise<void>;
    createFolder: (name: string) => Promise<void>;
    uploadFile: (file: File) => Promise<void>;
    deleteNode: (nodeId: string) => Promise<void>;
}

const FileSystemContext = createContext<FileSystemContextType | undefined>(undefined);

export const FileSystemProvider = ({ children }: { children: ReactNode }) => {
    const [state, dispatch] = useReducer(reducer, initialState);

    // 1. Загрузка папки
    const loadFolder = useCallback(async (folderId: string | null) => {
        dispatch({ type: 'NAVIGATE_START', payload: folderId });
        try {
            // Запрашиваем данные параллельно
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
            dispatch({ type: 'NAVIGATE_ERROR', payload: 'Не удалось загрузить папку' });
        }
    }, []);

    // 2. Создание папки
    const createFolder = useCallback(async (name: string) => {
        try {
            // Важно: твой сервис использует 'root' как ID корня, а не null
            const parentId = state.currentFolderId || 'root';

            const newNode: FileSystemNode = {
                id: crypto.randomUUID(),
                parentId: parentId,
                name,
                type: 'folder', // Тип из твоего db.ts
                createdAt: Date.now(),
                updatedAt: Date.now(),
            };

            const createdNode = await backend.createNode(newNode);
            dispatch({ type: 'CREATE_NODE_SUCCESS', payload: createdNode });
        } catch (err) {
            console.error("Ошибка создания папки:", err);
            alert(err instanceof Error ? err.message : 'Ошибка создания папки');
        }
    }, [state.currentFolderId]);

    // 3. Загрузка файла
    const uploadFile = useCallback(async (file: File) => {
        const fileId = crypto.randomUUID();
        const parentId = state.currentFolderId || 'root';

        // Эмуляция прогресса (Backend сохраняет мгновенно, но мы "рисуем" загрузку для UX)
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
            content: file, // IDB отлично хранит Blob/File
            createdAt: Date.now(),
            updatedAt: Date.now(),
        };

        try {
            const createdNode = await backend.createNode(newNode);
            dispatch({ type: 'UPLOAD_COMPLETE', payload: { id: fileId, node: createdNode } });
        } catch (err) {
            console.error("Ошибка загрузки файла:", err);
            // В случае ошибки нужно бы убрать прогресс-бар, но пока опустим для краткости
        }
    }, [state.currentFolderId]);

    // 4. Удаление (НОВОЕ)
    const deleteNode = useCallback(async (nodeId: string) => {
        try {
            // Сначала удаляем из БД
            await backend.deleteNode(nodeId);
            // Если успешно, убираем из UI
            dispatch({ type: 'DELETE_NODE', payload: nodeId });
        } catch (err) {
            console.error("Ошибка при удалении:", err);
            alert("Не удалось удалить элемент.");
        }
    }, []);

    //   useEffect(() => {
    //       loadFolder(null);
    //   }, [loadFolder]);

    // Автозагрузка корня
    useEffect(() => {
        // Загружаем корень только если мы не инициировали навигацию (можно улучшить логику роутингом)
        // В данном случае оставим просто начальную загрузку, если items пустые
        if (!state.currentFolderId && state.items.length === 0) {
            loadFolder(null);
        }
    }, [loadFolder, state.currentFolderId, state.items.length]);

    return (
        <FileSystemContext.Provider value={{ state, loadFolder, createFolder, uploadFile, deleteNode }}>
            {children}
        </FileSystemContext.Provider>
    );
};

export const useFileSystem = () => {
    const ctx = useContext(FileSystemContext);
    if (!ctx) throw new Error("useFileSystem must be used within FileSystemProvider");
    return ctx;
};