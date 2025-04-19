
import { Zap, Settings, Moon } from 'lucide-react';

export default function Header() {
  return (
    <header className="bg-gradient-to-r from-purple-700 to-indigo-800 text-white px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Zap className="w-6 h-6" />
          <h1 className="text-2xl font-bold tracking-tight">Mr. Khabri Client</h1>
        </div>
        <div className="flex items-center space-x-4">
          <button className="p-2 hover:bg-white/10 rounded-full transition">
            <Moon className="w-5 h-5" />
          </button>
          <button className="p-2 hover:bg-white/10 rounded-full transition">
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
