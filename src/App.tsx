
import { Layout } from './components/Layout';
import { RequestPanel } from './components/RequestPanel';
import { ResponsePanel } from './components/ResponsePanel';
import { Sidebar } from './components/Sidebar';

export default function App() {
  return (
    <div className="h-screen bg-[#f8fafc] dark:bg-gray-900">
      <Layout>
        <div className="flex h-full">
          <Sidebar />
          <div className="flex-1 flex flex-col gap-4 p-6 overflow-auto">
            <RequestPanel />
            <ResponsePanel />
          </div>
        </div>
      </Layout>
    </div>
  );
}
