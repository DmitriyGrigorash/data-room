# Data Room - File Manager

This is a Single Page Application (SPA) developed using React, TypeScript, and Vite, which provides a full-featured interface for managing files and folders. The application simulates working with cloud storage, but all data storage logic is implemented on the client-side using **IndexedDB**, making it completely self-contained.

## Core Technologies

*   **Framework:** [React](https://reactjs.org/)
*   **Language:** [TypeScript](https://www.typescriptlang.org/)
*   **Build Tool:** [Vite](https://vitejs.dev/)
*   **UI Library:** [Material-UI (MUI)](https://mui.com/)
*   **Routing:** [React Router DOM](https://reactrouter.com/)
*   **Authentication:** [Clerk](https://clerk.com/)
*   **Data Storage (Client-side):** [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API) (with the `idb` library)
*   **State Management:** React Context API (`useContext` + `useReducer`)

## Features

*   **User Authentication:** Secure sign-in and sign-out using Clerk.
*   **File and Folder Browsing:** Hierarchical structure displayed as a list.
*   **Navigation:**
    *   Navigate through folders.
    *   Breadcrumb navigation to track the current path.
*   **CRUD Operations:**
    *   **Create**: Upload files and create new folders.
    *   **Read**: View folder contents and enjoy a full-screen preview for PDF files.
    *   **Update**: Rename files and folders.
    *   **Delete**: Remove files and folders (with recursive deletion for folders).
*   **Search:** Full-text search across all file and folder names in the system.

## Project Architecture

The project has a clear component-based structure where logic and data are separated from the presentation.

### Key Directories and Files

*   **`src/services/db.ts`**:
    *   The `MockBackendService` class simulates an API server, performing all operations (read, write, delete, search) with the IndexedDB database.
    *   All methods are asynchronous, making them easy to replace with real HTTP requests in the future.

*   **`src/context/FileSystemContext.tsx`**:
    *   Centralized state management for the file system.
    *   Uses the `useReducer` hook for predictable state changes.
    *   Provides global state and functions (`loadFolder`, `createFolder`, `deleteNode`, `searchFiles`, etc.) through the custom `useFileSystem()` hook.

*   **`src/components/`**:
    *   **`FileManagerLayout.tsx`**: The main layout component, which includes the `AppBar` with search, navigation, and the main content area.
    *   **`FileExplorer/`**:
        *   `FileExplorer.tsx`: Displays the list of files and folders, and manages the context menu (rename/delete).
        *   Contains dialog components extracted into separate files (`DeleteDialog`, `RenameDialog`, `PdfPreviewDialog`) for cleaner code.
    *   **`ActionBar/ActionBar.tsx`**: The bottom action bar with "Upload" and "New Folder" buttons.
    *   **`BreadcrumbsNav.tsx`**: The breadcrumb navigation component.

*   **`src/pages/Dashboard.tsx`**:
    *   The entry point for the authenticated part of the application.
    *   Wraps all routes in `FileSystemProvider` and defines the internal routing (`/` and `/folder/:folderId`).

### How It Works

1.  A user signs in via Clerk.
2.  `Dashboard.tsx` renders the `FileManagerLayout`.
3.  `FileManagerLayout` uses the `useParams` hook to determine the current `folderId` from the URL.
4.  It calls the `loadFolder` function from `FileSystemContext`.
5.  `FileSystemContext` calls the corresponding `getFolderContents` method from `MockBackendService`.
6.  `MockBackendService` executes a query against IndexedDB and returns a list of files and folders.
7.  `FileSystemContext` updates its state via `dispatch`, which triggers a re-render of the components.
8.  `FileManagerLayout` passes the retrieved list to `FileExplorer`, which then displays it.

## Getting Started

1.  **Install dependencies:**
    ```shell
    npm install
    ```

2.  **Set up Clerk environment variables:**
    *   Create a `.env.local` file in the project root.
    *   Add your Publishable Key from the Clerk dashboard to it:
    ```
    VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
    ```

3.  **Start the development server:**
    ```shell
    npm run dev
    ```

4.  Open your browser and navigate to the address shown in the terminal (usually `http://localhost:5173`).

## Building for Production

To create an optimized version of the application, run the command:

```bash
npm run build
```

The ready-to-deploy files will be located in the `dist` folder.

