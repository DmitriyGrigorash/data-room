import { FileSystemNode } from '../services/db';

export interface FileSystemState {
  currentFolderId: string | null; // null means root folder
  breadcrumbs: FileSystemNode[];  // An array of nodes representing the path
  items: FileSystemNode[];        // An array of nodes in the current folder
  isSearching: boolean;
  searchResults: FileSystemNode[];
  isLoading: boolean;
  error: string | null;
  uploads: Record<string, number>;
}

export type Action =
    | { type: 'NAVIGATE_START'; payload: string | null }
    | { type: 'NAVIGATE_SUCCESS'; payload: { items: FileSystemNode[]; breadcrumbs: FileSystemNode[]; folderId: string | null } }
    | { type: 'NAVIGATE_ERROR'; payload: string }
    | { type: 'SEARCH_START' }
    | { type: 'SEARCH_SUCCESS'; payload: FileSystemNode[] }
    | { type: 'SEARCH_ERROR'; payload: string }
    | { type: 'CLEAR_SEARCH' }
    | { type: 'CREATE_NODE_SUCCESS'; payload: FileSystemNode }
    | { type: 'UPLOAD_PROGRESS'; payload: { id: string; progress: number } }
    | { type: 'UPLOAD_COMPLETE'; payload: { id: string; node: FileSystemNode } }
    | { type: 'DELETE_NODE'; payload: string }
    | { type: 'RENAME_NODE_SUCCESS'; payload: { id: string; name: string; updatedAt: number } };

export interface FileSystemContextType {
    state: FileSystemState;
    loadFolder: (folderId: string | null) => Promise<void>;
    createFolder: (name: string) => Promise<void>;
    uploadFile: (file: File) => Promise<void>;
    deleteNode: (nodeId: string) => Promise<void>;
    renameNode: (nodeId: string, newName: string) => Promise<void>;
    searchFiles: (query: string) => Promise<void>; // Function to initiate file search
    clearSearch: () => void; // Function to clear search results
    searchResults: FileSystemNode[];
    isSearching: boolean;
}