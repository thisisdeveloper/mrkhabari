
import React from 'react';
import { FolderTree, Search, Plus, Folder } from 'lucide-react';
import { ContextMenu } from './ContextMenu';
import { useStore } from '../store';
import { CollectionItem } from '../types';

export function Sidebar() {
  const { collections, addCollection, updateCollection, deleteCollection } = useStore();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [contextMenu, setContextMenu] = React.useState<{ x: number; y: number; item: CollectionItem } | null>(null);
  const [showNewCollectionInput, setShowNewCollectionInput] = React.useState(false);
  const [newCollectionName, setNewCollectionName] = React.useState('');

  const handleContextMenu = (e: React.MouseEvent, item: CollectionItem) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      item
    });
  };

  const handleNewCollection = () => {
    if (newCollectionName.trim()) {
      addCollection(newCollectionName.trim());
      setNewCollectionName('');
      setShowNewCollectionInput(false);
    }
  };

  const handleAction = (action: string) => {
    if (!contextMenu) return;

    switch (action) {
      case 'new-folder':
        const folderName = prompt('Enter folder name:');
        if (folderName) {
          addCollection(folderName, contextMenu.item.id);
        }
        break;
      case 'rename':
        const newName = prompt('Enter new name:', contextMenu.item.name);
        if (newName) {
          updateCollection(contextMenu.item.id, newName);
        }
        break;
      case 'delete':
        if (confirm('Are you sure you want to delete this item?')) {
          deleteCollection(contextMenu.item.id);
        }
        break;
    }
    setContextMenu(null);
  };

  const filteredCollections = React.useMemo(() => {
    if (!searchQuery.trim()) {
      return collections;
    }
    
    const filterItems = (items: CollectionItem[]): CollectionItem[] => {
      return items.filter(item => {
        const matchesName = item.name.toLowerCase().includes(searchQuery.toLowerCase());
        
        if (item.children && item.children.length > 0) {
          const filteredChildren = filterItems(item.children);
          item = { ...item, children: filteredChildren };
          
          return matchesName || filteredChildren.length > 0;
        }
        
        return matchesName;
      });
    };
    
    return filterItems([...collections]);
  }, [collections, searchQuery]);

  const renderCollectionItem = (item: CollectionItem) => (
    <div key={item.id} className="space-y-1">
      <button
        onContextMenu={(e) => handleContextMenu(e, item)}
        className="w-full text-left px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition flex items-center gap-2"
      >
        {item.type === 'collection' ? <FolderTree className="w-4 h-4" /> : <Folder className="w-4 h-4" />}
        {item.name}
      </button>
      {item.children && item.children.length > 0 && (
        <div className="ml-6 space-y-1">
          {item.children.map(child => renderCollectionItem(child))}
        </div>
      )}
    </div>
  );

  return (
    <div className="w-64 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex flex-col">
      <div className="p-4">
        <div className="relative mb-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search collections..."
            className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400"
          />
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
        </div>

        <button
          onClick={() => setShowNewCollectionInput(true)}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition"
        >
          <Plus className="w-4 h-4" />
          New Collection
        </button>

        {showNewCollectionInput && (
          <div className="mt-2 flex gap-2">
            <input
              type="text"
              value={newCollectionName}
              onChange={(e) => setNewCollectionName(e.target.value)}
              placeholder="Collection name"
              className="flex-1 px-3 py-1 text-sm border rounded"
              onKeyDown={(e) => e.key === 'Enter' && handleNewCollection()}
              autoFocus
            />
            <button
              onClick={handleNewCollection}
              className="px-3 py-1 text-sm bg-emerald-500 text-white rounded hover:bg-emerald-600"
            >
              Add
            </button>
          </div>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-2">
        {filteredCollections.map(collection => renderCollectionItem(collection))}
      </nav>

      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
          onAction={handleAction}
        />
      )}
    </div>
  );
}
