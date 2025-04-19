import { Hash, Code2, Database, Clock } from 'lucide-react';

const collections = [
  { id: '1', name: 'Authentication', requests: 4 },
  { id: '2', name: 'Users API', requests: 6 },
  { id: '3', name: 'Products', requests: 3 },
];

export default function Workspace() {
  return (
    <div className="bg-gray-50 w-64 border-r border-gray-200 flex flex-col">
      <div className="p-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search requests..."
            className="w-full pl-10 pr-4 py-2 bg-white rounded-lg text-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <Hash className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
        </div>
      </div>
      
      <nav className="flex-1 overflow-y-auto">
        <div className="px-3 mb-2">
          <div className="flex items-center px-3 py-2 text-sm font-medium text-gray-600">
            <Code2 className="w-4 h-4 mr-2" />
            Collections
          </div>
          {collections.map((collection) => (
            <button
              key={collection.id}
              className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition"
            >
              {collection.name}
              <span className="ml-2 text-xs text-gray-400">
                {collection.requests}
              </span>
            </button>
          ))}
        </div>
        
        <div className="px-3 mb-2">
          <div className="flex items-center px-3 py-2 text-sm font-medium text-gray-600">
            <Database className="w-4 h-4 mr-2" />
            Environment
          </div>
          <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition">
            Development
          </button>
          <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition">
            Production
          </button>
        </div>

        <div className="px-3">
          <div className="flex items-center px-3 py-2 text-sm font-medium text-gray-600">
            <Clock className="w-4 h-4 mr-2" />
            History
          </div>
          <div className="text-sm text-gray-500 px-3 py-2">
            No recent requests
          </div>
        </div>
      </nav>
    </div>
  );
}
