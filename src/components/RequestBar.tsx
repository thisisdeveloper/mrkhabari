import { Send } from 'lucide-react';

const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'];

interface RequestBarProps {
  method: string;
  url: string;
  onMethodChange: (method: string) => void;
  onUrlChange: (url: string) => void;
  onSend: () => void;
}

export default function RequestBar({ method, url, onMethodChange, onUrlChange, onSend }: RequestBarProps) {
  return (
    <div className="flex gap-3 bg-white p-4 rounded-xl shadow-sm">
      <div className="relative">
        <select
          value={method}
          onChange={(e) => onMethodChange(e.target.value)}
          className="appearance-none bg-gray-50 px-4 py-2.5 pr-8 rounded-lg text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 hover:bg-gray-100 transition"
        >
          {methods.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
      </div>
      <div className="flex-1 relative">
        <input
          type="text"
          value={url}
          onChange={(e) => onUrlChange(e.target.value)}
          placeholder="Enter your API endpoint"
          className="w-full px-4 py-2.5 bg-gray-50 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 hover:bg-gray-100 transition"
        />
      </div>
      <button
        onClick={onSend}
        className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center gap-2 transition-colors"
      >
        <Send className="w-4 h-4" />
        Send
      </button>
    </div>
  );
}
