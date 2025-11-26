// context/types.ts
import { FileSystemNode } from '../services/db';

export interface FileSystemState {
  currentFolderId: string | null; // null означает корневую папку
  breadcrumbs: FileSystemNode[];  // Исправлено: это массив узлов
  items: FileSystemNode[];        // Исправлено: это массив узлов
  isLoading: boolean;
  error: string | null;
  uploads: Record<string, number>; // ID файла -> Процент (0-100)
}

export type Action =
  | { type: 'NAVIGATE_START'; payload: string | null }
  | { type: 'NAVIGATE_SUCCESS'; payload: { items: FileSystemNode[]; breadcrumbs: FileSystemNode[]; folderId: string | null } }
  | { type: 'NAVIGATE_ERROR'; payload: string }
  | { type: 'CREATE_NODE_SUCCESS'; payload: FileSystemNode }
  | { type: 'UPLOAD_PROGRESS'; payload: { id: string; progress: number } }
  | { type: 'UPLOAD_COMPLETE'; payload: { id: string; node: FileSystemNode } }
  | { type: 'DELETE_NODE'; payload: string }; // ID удаляемого узла