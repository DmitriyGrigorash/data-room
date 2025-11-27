import { openDB, DBSchema, IDBPDatabase } from 'idb';

export type NodeType = 'file' | 'folder';
// Defines the structure for a file system node (either a file or a folder)
export interface FileSystemNode {
    id: string;             // Unique identifier (UUID v4)
    parentId: string | null;// Reference to the parent folder's ID
    name: string;           // Name of the file or folder
    type: NodeType;
    content?: Blob;         // For files: binary data (e.g., file content)
    size?: number;          // Size in bytes (for files)
    mimeType?: string;      // MIME type (for files)
    createdAt: number;      // Creation timestamp
    updatedAt: number;      // Last update timestamp
    path?: string;        // Optional: materialized path for optimization
}

interface FileSystemDB extends DBSchema {
    nodes: {
        key: string;
        value: FileSystemNode;
        indexes: {
            'by-parent': string; // Index for quickly getting folder contents
            'by-name': string;   // Index for checking name uniqueness within a parent
        };
    };
}

const DB_NAME = 'ReactFileSystemV1';
const STORE_NAME = 'nodes';

class MockBackendService {
    private dbPromise: Promise<IDBPDatabase<FileSystemDB>>;

    constructor() {
        this.dbPromise = openDB<FileSystemDB>(DB_NAME, 1, {
            upgrade(db) {
                // Create the object store
                const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
                // Create indexes for query optimization
                store.createIndex('by-parent', 'parentId');
                store.createIndex('by-name', 'name');
            },
        });
    }

    // Get contents of a specific folder
    async getFolderContents(parentId: string | null): Promise<FileSystemNode[]> {
        const db = await this.dbPromise;
        // Use the index to quickly find all children
        return db.getAllFromIndex(STORE_NAME, 'by-parent', parentId || 'root');
    }

    // Create a new node (file or folder)
    async createNode(node: FileSystemNode): Promise<FileSystemNode> {
        const db = await this.dbPromise;

        // Transaction check: name must be unique within the folder
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const index = tx.store.index('by-parent');
        const siblings = await index.getAll(node.parentId || 'root'); // Get all siblings to check for name conflicts

        if (siblings.some(s => s.name === node.name)) {
            throw new Error(`Item with name "${node.name}" already exists.`);
        }

        await tx.store.add(node);
        await tx.done;
        return node;
    }

    // Get a node by its ID
    async getNode(id: string): Promise<FileSystemNode | undefined> {
        const db = await this.dbPromise;
        return db.get(STORE_NAME, id);
    }

    // Recursively build the path (Breadcrumbs)
    // This is crucial for understanding "where I am" in deep nesting
    async resolvePath(nodeId: string): Promise<FileSystemNode[]> {
        const db = await this.dbPromise;
        const path: FileSystemNode[] = [];
        let currentId: string | null = nodeId;

        while (currentId) { // Traverse up the parent chain
            const node: FileSystemNode | undefined = await db.get(STORE_NAME, currentId);
            if (!node) break;
            path.unshift(node);
            if (node.parentId === null) break; // Reached the root
            currentId = node.parentId;
        }
        return path;
    }

    // Delete a node (file or folder recursively)
    async deleteNode(id: string): Promise<void> {
        const db = await this.dbPromise;

        // 1. First, get the node itself to check if it's a folder or file
        const node = await db.get(STORE_NAME, id);

        // If the node doesn't exist (e.g., already deleted), just exit
        if (!node) return;

        // 2. If it's a folder, find and delete all its children
        if (node.type === 'folder') {
            // Use the parentId index to find the contents of this folder
            const children = await db.getAllFromIndex(STORE_NAME, 'by-parent', id);

            // Initiate deletion for each child element
            // Promise.all allows deleting them in parallel, not sequentially
            await Promise.all(children.map(child => this.deleteNode(child.id)));
        }

        // 3. Delete the node itself from the database
        await db.delete(STORE_NAME, id);
    }

    // --- NEW METHOD: RENAME ---
    async renameNode(id: string, newName: string): Promise<FileSystemNode> {
        const db = await this.dbPromise;

        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.store;

        // 1. Get the current node
        const node = await store.get(id);
        if (!node) throw new Error('Node not found');

        if (node.name === newName) return node; // Name has not changed

        // 2. Check for duplicates in the same folder
        const index = store.index('by-parent');
        const siblings = await index.getAll(node.parentId || 'root');

        // Look for a name match, excluding the current file itself
        const exists = siblings.some(s => s.name === newName && s.id !== id);
        if (exists) {
            throw new Error(`Item with name "${newName}" already exists in this folder.`);
        }

        // 3. Update fields
        node.name = newName;
        node.updatedAt = Date.now();

        // 4. Save (put updates an existing record)
        await store.put(node);
        await tx.done;

        return node;
    }

    // --- NEW METHOD: SEARCH ALL NODES ---
    async searchNodes(query: string): Promise<FileSystemNode[]> {
        const db = await this.dbPromise;

        // If the query is empty, return an empty array
        if (!query.trim()) {
            return [];
        }

        const lowerCaseQuery = query.toLowerCase();
        const allNodes = await db.getAll(STORE_NAME);

        // Filter all nodes by name
        const results = allNodes.filter(node =>
            node.name.toLowerCase().includes(lowerCaseQuery)
        );

        return results;
    }
}

export const backend = new MockBackendService();