import { openDB, DBSchema, IDBPDatabase } from 'idb';

export type NodeType = 'file' | 'folder';

export interface FileSystemNode {
    id: string;             // UUID v4
    parentId: string | null;// Ссылка на родителя
    name: string;           // Имя пользователя
    type: NodeType;
    content?: Blob;         // Для файлов: бинарные данные
    size?: number;          // Размер в байтах
    mimeType?: string;      // MIME тип
    createdAt: number;      // Timestamp
    updatedAt: number;      // Timestamp
    path?: string;        // Опционально: материализованный путь для оптимизации
}

interface FileSystemDB extends DBSchema {
    nodes: {
        key: string;
        value: FileSystemNode;
        indexes: {
            'by-parent': string; // Индекс для быстрого получения содержимого папки
            'by-name': string;   // Индекс для проверки уникальности имен
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
                // Создаем хранилище объектов
                const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
                // Создаем индексы для оптимизации запросов
                store.createIndex('by-parent', 'parentId');
                store.createIndex('by-name', 'name');
            },
        });
    }

    // Эмуляция задержки сети
    private async delay(ms: number = 300) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Получить содержимое папки
    async getFolderContents(parentId: string | null): Promise<FileSystemNode[]> {
        await this.delay();
        const db = await this.dbPromise;
        // Используем индекс для мгновенного поиска всех детей
        return db.getAllFromIndex(STORE_NAME, 'by-parent', parentId || 'root');
    }

    // Создать новый узел (файл или папку)
    async createNode(node: FileSystemNode): Promise<FileSystemNode> {
        await this.delay(500); // Чуть дольше для записи
        const db = await this.dbPromise;

        // Проверка транзакции: имя должно быть уникальным в папке
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const index = tx.store.index('by-parent');
        const siblings = await index.getAll(node.parentId || 'root');

        if (siblings.some(s => s.name === node.name)) {
            throw new Error(`Item with name "${node.name}" already exists.`);
        }

        await tx.store.add(node);
        await tx.done;
        return node;
    }

    // Получить узел по ID
    async getNode(id: string): Promise<FileSystemNode | undefined> {
        const db = await this.dbPromise;
        return db.get(STORE_NAME, id);
    }

    // Рекурсивное построение пути (Breadcrumbs)
    // Это критично для понимания "где я нахожусь" при глубокой вложенности
    async resolvePath(nodeId: string): Promise<FileSystemNode[]> {
        const db = await this.dbPromise;
        const path: FileSystemNode[] = [];
        let currentId: string | null = nodeId;

        while (currentId) {
            const node: FileSystemNode | undefined = await db.get(STORE_NAME, currentId);
            if (!node) break;
            path.unshift(node);
            if (node.parentId === null) break; // Reached the root
            currentId = node.parentId;
        }
        return path;
    }

    // Удаление узла (файла или папки рекурсивно)
    async deleteNode(id: string): Promise<void> {
        await this.delay(200); // Эмуляция сетевой задержки
        const db = await this.dbPromise;

        // 1. Сначала получаем сам узел, чтобы проверить, папка это или файл
        const node = await db.get(STORE_NAME, id);

        // Если узла нет (например, уже удален), просто выходим
        if (!node) return;

        // 2. Если это папка, нужно найти и удалить всех её "детей"
        if (node.type === 'folder') {
            // Используем индекс parentId для поиска содержимого этой папки
            const children = await db.getAllFromIndex(STORE_NAME, 'by-parent', id);

            // Запускаем удаление для каждого дочернего элемента
            // Promise.all позволяет удалять их параллельно, а не по очереди
            await Promise.all(children.map(child => this.deleteNode(child.id)));
        }

        // 3. Удаляем сам узел из базы
        await db.delete(STORE_NAME, id);
    }

    // --- НОВЫЙ МЕТОД: ПЕРЕИМЕНОВАНИЕ ---
    async renameNode(id: string, newName: string): Promise<FileSystemNode> {
        await this.delay(200);
        const db = await this.dbPromise;

        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.store;

        // 1. Получаем текущий узел
        const node = await store.get(id);
        if (!node) throw new Error('Node not found');

        if (node.name === newName) return node; // Имя не изменилось

        // 2. Проверяем дубликаты в той же папке
        const index = store.index('by-parent');
        const siblings = await index.getAll(node.parentId || 'root');

        // Ищем совпадение имени, исключая сам текущий файл
        const exists = siblings.some(s => s.name === newName && s.id !== id);
        if (exists) {
            throw new Error(`Item with name "${newName}" already exists in this folder.`);
        }

        // 3. Обновляем поля
        node.name = newName;
        node.updatedAt = Date.now();

        // 4. Сохраняем (put обновляет существующую запись)
        await store.put(node);
        await tx.done;

        return node;
    }
}

export const backend = new MockBackendService();