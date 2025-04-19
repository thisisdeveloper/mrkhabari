
import React from 'react';
import { Folder, Edit, Trash2 } from 'lucide-react';

interface ContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
  onAction: (action: string) => void;
}

export function ContextMenu({ x, y, onClose, onAction }: ContextMenuProps) {
  const menuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const actions = [
    { id: 'new-folder', icon: Folder, label: 'New Folder' },
    { id: 'rename', icon: Edit, label: 'Rename' },
    { id: 'delete', icon: Trash2, label: 'Delete' },
  ];

  return (
    <div
      ref={menuRef}
      className="fixed bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 w-48 z-50"
      style={{ top: y, left: x }}
    >
      {actions.map(({ id, icon: Icon, label }) => (
        <button
          key={id}
          onClick={() => {
            onAction(id);
            onClose();
          }}
          className="w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
        >
          <Icon className="w-4 h-4" />
          {label}
        </button>
      ))}
    </div>
  );
}
