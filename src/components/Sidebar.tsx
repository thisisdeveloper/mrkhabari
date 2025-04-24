
import React, { useState, useEffect } from 'react';
import { useStore } from '../store';
import { ChevronRight, ChevronDown, Plus, File, Trash } from 'lucide-react';

export function Sidebar() {
  const [activeFolder, setActiveFolder] = useState<number | null>(null);

  // Fix: removing unused state variable
  // const [newRequestName, setNewRequestName] = useState('');
  
  const {
    folders,
    selectedRequest,
    addRequest,
    deleteRequest,
    selectRequest,
    addFolder,
    deleteFolder,
  } = useStore();

  const toggleFolder = (folderId: number) => {
    if (activeFolder === folderId) {
      setActiveFolder(null);
    } else {
      setActiveFolder(folderId);
    }
  };

  const handleAddRequest = (folderId: number | null) => {
    const name = `New Request ${Math.floor(Math.random() * 1000)}`;
    // Fix: pass only 2 arguments as expected
    addRequest(name, folderId);
  };

  return (
    <div className="w-64 bg-white dark:bg-gray-800 border-r dark:border-gray-700 overflow-y-auto">
      <div className="p-4 flex flex-col h-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold text-gray-800 dark:text-gray-200">Requests</h2>
          <div className="flex space-x-1">
            <button
              onClick={() => addFolder('New Folder')}
              className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-600 dark:text-gray-300"
              aria-label="Add folder"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => handleAddRequest(null)}
              className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-600 dark:text-gray-300"
              aria-label="Add request"
            >
              <File className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="space-y-1">
          {folders.map((folder) => (
            <div key={folder.id} className="text-sm">
              <div
                className="flex justify-between items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer"
                onClick={() => toggleFolder(folder.id)}
              >
                <div className="flex items-center">
                  {activeFolder === folder.id ? (
                    <ChevronDown className="w-4 h-4 text-gray-400 mr-2" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-gray-400 mr-2" />
                  )}
                  <span className="text-gray-800 dark:text-gray-200">{folder.name}</span>
                </div>
                <div className="flex space-x-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddRequest(folder.id);
                    }}
                    className="p-0.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded text-gray-500 dark:text-gray-400"
                    aria-label="Add request to folder"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteFolder(folder.id);
                    }}
                    className="p-0.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded text-gray-500 dark:text-gray-400"
                    aria-label="Delete folder"
                  >
                    <Trash className="w-3 h-3" />
                  </button>
                </div>
              </div>
              {activeFolder === folder.id && folder.requests.length > 0 && (
                <div className="ml-6 mt-1 space-y-1">
                  {folder.requests.map((request) => (
                    <div
                      key={request.id}
                      className={`flex justify-between items-center p-2 rounded cursor-pointer ${
                        selectedRequest?.id === request.id
                          ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}
                      onClick={() => selectRequest(request.id)}
                    >
                      <span>{request.name}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteRequest(request.id);
                        }}
                        className="p-0.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded opacity-0 group-hover:opacity-100 text-gray-500 dark:text-gray-400"
                        aria-label="Delete request"
                      >
                        <Trash className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          <div className="mt-2">
            {/* Standalone requests outside folders */}
            {folders
              .find((f) => f.id === 0)
              ?.requests.map((request) => (
                <div
                  key={request.id}
                  className={`group flex justify-between items-center p-2 rounded cursor-pointer ${
                    selectedRequest?.id === request.id
                      ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                  onClick={() => selectRequest(request.id)}
                >
                  <span>{request.name}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteRequest(request.id);
                    }}
                    className="p-0.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded opacity-0 group-hover:opacity-100 text-gray-500 dark:text-gray-400"
                    aria-label="Delete request"
                  >
                    <Trash className="w-3 h-3" />
                  </button>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
