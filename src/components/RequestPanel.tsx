import { useEffect, useRef, useState } from 'react';
import { Play, Plus, Save, FileJson, X } from 'lucide-react';
import { useStore } from '../store';
import { sendRequest } from '../utils/api';
import { Method } from '../types';
import { Editor } from '@monaco-editor/react';
import { formatJSON } from '../utils/jsonFormatter';
import { parseQueryString, buildUrl, getBaseUrl } from '../utils/urlUtils';
import { Authorization } from './Authorization';

const methods: Method[] = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
const bodyAllowedMethods = ['POST', 'PUT', 'PATCH'];

const editorOptions = {
  minimap: { enabled: false },
  fontSize: 13,
  lineNumbers: 'off' as const,
  folding: false,
  lineDecorationsWidth: 0,
  lineNumbersMinChars: 0,
  automaticLayout: true,
  padding: { top: 8, bottom: 8 },
  scrollBeyondLastLine: false,
  renderLineHighlight: 'none',
  overviewRulerLanes: 0,
  hideCursorInOverviewRuler: true,
  overviewRulerBorder: false,
  scrollbar: {
    vertical: 'hidden',
    horizontal: 'hidden',
  },
};

export function RequestPanel() {
  const {
    tabs,
    activeTab,
    activeSection,
    setActiveTab,
    setActiveSection,
    addTab,
    removeTab,
    updateTab,
    setResponse,
    setIsLoading,
    addToHistory
  } = useStore();

  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    tabId: string;
  } | null>(null);
  
  const [editingTabId, setEditingTabId] = useState<string | null>(null);
  const [editingTabName, setEditingTabName] = useState('');
  const editInputRef = useRef<HTMLInputElement>(null);

  const activeRequest = tabs.find(tab => tab.id === activeTab);
  const currentParams = Array.isArray(activeRequest?.params) ? activeRequest.params : [];

  useEffect(() => {
    if (editingTabId && editInputRef.current) {
      editInputRef.current.focus();
    }
  }, [editingTabId]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (contextMenu) {
        const target = e.target as HTMLElement;
        if (!target.closest('.context-menu')) {
          setContextMenu(null);
        }
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [contextMenu]);

  const handleTabContextMenu = (e: React.MouseEvent, tabId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      tabId,
    });
  };

  const handleStartRename = (tabId: string) => {
    const tab = tabs.find(t => t.id === tabId);
    if (tab) {
      setEditingTabId(tabId);
      setEditingTabName(tab.name);
      setContextMenu(null);
    }
  };

  const handleFinishRename = () => {
    if (editingTabId && editingTabName.trim()) {
      updateTab(editingTabId, { name: editingTabName.trim() });
      setEditingTabId(null);
      setEditingTabName('');
    }
  };

  const handleTabKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleFinishRename();
    } else if (e.key === 'Escape') {
      setEditingTabId(null);
      setEditingTabName('');
    }
  };

  const handleUrlChange = (url: string) => {
    if (!activeRequest) return;

    const params = parseQueryString(url);
    const baseUrl = getBaseUrl(url);

    updateTab(activeRequest.id, {
      url: baseUrl,
      params
    });
  };

  const handleParamChange = (paramIndex: number, key: string, value: string, enabled: boolean = true) => {
    if (!activeRequest) return;

    const newParams = [...currentParams];
    
    if (paramIndex < newParams.length) {
      newParams[paramIndex] = { key, value, enabled };
    } else {
      newParams.push({ key, value, enabled });
    }

    while (newParams.length > 0 && !newParams[newParams.length - 1].key && !newParams[newParams.length - 1].value) {
      newParams.pop();
    }

    updateTab(activeRequest.id, { params: newParams });
  };

  const handleParamToggle = (index: number) => {
    if (!activeRequest || !activeRequest.params) return;

    const newParams = [...currentParams];
    if (index < newParams.length) {
      newParams[index] = { ...newParams[index], enabled: !newParams[index].enabled };
      updateTab(activeRequest.id, { params: newParams });
    }
  };

  const handleRemoveParam = (index: number) => {
    if (!activeRequest || !activeRequest.params) return;

    const newParams = [...currentParams];
    newParams.splice(index, 1);
    updateTab(activeRequest.id, { params: newParams });
  };

  useEffect(() => {
    if (!activeRequest) return;
    
    const fullUrl = buildUrl(activeRequest.url, currentParams);
    if (fullUrl !== activeRequest.url) {
      updateTab(activeRequest.id, { url: fullUrl });
    }
  }, [activeRequest?.params]);

  const handleSend = async () => {
    if (!activeRequest) return;
    
    setIsLoading(true);
    
    try {
      const response = await sendRequest(activeRequest);
      setResponse(response);
      addToHistory({
        ...activeRequest,
        timestamp: Date.now()
      });
    } catch (err) {
      const error = err as Error;
      console.error('Request failed:', error);
      setResponse({
        status: 0,
        statusText: error.message,
        data: { error: error.message },
        headers: {},
        time: 0,
        size: '0 bytes',
        timestamp: Date.now()
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleHeaderChange = (index: number, key: string, value: string) => {
    if (!activeRequest) return;
    
    const headers = { ...activeRequest.headers };
    if (key) {
      headers[key] = value;
    }
    
    updateTab(activeRequest.id, { headers });
  };

  const handleFormatJSON = () => {
    if (!activeRequest || !activeRequest.body) return;
    
    const formatted = formatJSON(activeRequest.body);
    updateTab(activeRequest.id, { body: formatted });
  };

  const handleCloseTab = (e: React.MouseEvent, tabId: string) => {
    e.stopPropagation();
    removeTab(tabId);
  };

  const isBodyEnabled = activeRequest && bodyAllowedMethods.includes(activeRequest.method);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 w-full">
          <select
            value={activeRequest?.method}
            onChange={(e) => {
              if (activeRequest) {
                updateTab(activeRequest.id, { method: e.target.value as Method });
              }
            }}
            className="w-28 px-3 py-1.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400"
          >
            {methods.map(method => (
              <option key={method} value={method}>{method}</option>
            ))}
          </select>
          <input
            type="text"
            value={activeRequest?.url || ''}
            onChange={(e) => handleUrlChange(e.target.value)}
            placeholder="Enter request URL"
            className="flex-1 px-3 py-1.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400"
          />
          <button 
            onClick={handleSend}
            className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-md text-sm font-medium transition flex items-center gap-2 whitespace-nowrap"
          >
            <Play className="w-4 h-4" />
            Send
          </button>
          <button className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-emerald-500 dark:hover:text-emerald-400">
            <Save className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex items-center px-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex-1 flex">
          {tabs.map(tab => (
            <div
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              onContextMenu={(e) => handleTabContextMenu(e, tab.id)}
              className={`group px-4 py-2 text-sm font-medium border-b-2 transition flex items-center gap-2 cursor-pointer ${
                activeTab === tab.id
                  ? 'border-emerald-500 text-emerald-500 dark:text-emerald-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              {editingTabId === tab.id ? (
                <input
                  ref={editInputRef}
                  type="text"
                  value={editingTabName}
                  onChange={(e) => setEditingTabName(e.target.value)}
                  onKeyDown={handleTabKeyDown}
                  onBlur={handleFinishRename}
                  onClick={(e) => e.stopPropagation()}
                  className="w-32 px-1 py-0.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-400"
                />
              ) : (
                <span>{tab.name}</span>
              )}
              {tabs.length > 1 && (
                <div
                  onClick={(e) => handleCloseTab(e, tab.id)}
                  className={`p-0.5 rounded-full opacity-0 group-hover:opacity-100 transition cursor-pointer ${
                    activeTab === tab.id
                      ? 'hover:bg-emerald-100 dark:hover:bg-emerald-900'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <X className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          ))}
        </div>
        <button
          onClick={addTab}
          className="p-2 text-gray-500 dark:text-gray-400 hover:text-emerald-500 dark:hover:text-emerald-400"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {contextMenu && (
        <div
          className="context-menu fixed z-50 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1"
          style={{ top: contextMenu.y, left: contextMenu.x }}
        >
          <button
            onClick={() => handleStartRename(contextMenu.tabId)}
            className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
          >
            Rename
          </button>
          <button
            onClick={() => {
              removeTab(contextMenu.tabId);
              setContextMenu(null);
            }}
            className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
          >
            Close
          </button>
        </div>
      )}

      <div className="p-4">
        <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveSection('params')}
            className={`px-4 py-2 text-sm font-medium ${
              activeSection === 'params'
                ? 'text-emerald-600 border-b-2 border-emerald-600'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Query Params
          </button>
          <button
            onClick={() => setActiveSection('headers')}
            className={`px-4 py-2 text-sm font-medium ${
              activeSection === 'headers'
                ? 'text-emerald-600 border-b-2 border-emerald-600'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Headers
          </button>
          <button
            onClick={() => setActiveSection('auth')}
            className={`px-4 py-2 text-sm font-medium ${
              activeSection === 'auth'
                ? 'text-emerald-600 border-b-2 border-emerald-600'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Authorization
          </button>
          <button
            onClick={() => setActiveSection('body')}
            className={`px-4 py-2 text-sm font-medium ${
              activeSection === 'body'
                ? 'text-emerald-600 border-b-2 border-emerald-600'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Body
          </button>
        </div>

        <div className="p-4">
          {activeSection === 'params' && (
            <div className="space-y-3">
              {[...currentParams, { key: '', value: '', enabled: true }].map((param, index) => (
                <div key={index} className="flex gap-3 items-center">
                  <button
                    onClick={() => handleParamToggle(index)}
                    className={`p-2 rounded-md transition ${
                      param.enabled
                        ? 'text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/30'
                        : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <div className={`w-4 h-4 border-2 rounded ${
                      param.enabled
                        ? 'border-emerald-500 bg-emerald-500'
                        : 'border-gray-400'
                    }`} />
                  </button>
                  <input
                    type="text"
                    value={param.key}
                    onChange={(e) => handleParamChange(index, e.target.value, param.value, param.enabled)}
                    placeholder="Key"
                    className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400"
                  />
                  <input
                    type="text"
                    value={param.value}
                    onChange={(e) => handleParamChange(index, param.key, e.target.value, param.enabled)}
                    placeholder="Value"
                    className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400"
                  />
                  {index < currentParams.length && (
                    <button
                      onClick={() => handleRemoveParam(index)}
                      className="p-2 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {activeSection === 'headers' && (
            <div className="space-y-3">
              {[0, 1].map((i) => (
                <div key={i} className="flex gap-3">
                  <input
                    type="text"
                    placeholder="Key"
                    onChange={(e) => {
                      handleHeaderChange(i, e.target.value, '');
                    }}
                    className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400"
                  />
                  <input
                    type="text"
                    placeholder="Value"
                    onChange={(e) => {
                      handleHeaderChange(i, Object.keys(activeRequest?.headers || {})[i] || '', e.target.value);
                    }}
                    className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400"
                  />
                </div>
              ))}
              <button className="text-sm text-emerald-500 dark:text-emerald-400 hover:text-emerald-600 dark:hover:text-emerald-300 flex items-center gap-1.5">
                <Plus className="w-4 h-4" />
                Add Row
              </button>
            </div>
          )}

          {activeSection === 'auth' && (
            <Authorization />
          )}

          {activeSection === 'body' && (
            <div className="space-y-2">
              {isBodyEnabled ? (
                <>
                  <div className="flex justify-end">
                    <button
                      onClick={handleFormatJSON}
                      className="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition flex items-center gap-1.5"
                    >
                      <FileJson className="w-4 h-4" />
                      Format JSON
                    </button>
                  </div>
                  <div className="resize-y overflow-hidden border border-gray-200 dark:border-gray-600 rounded-md"
                       style={{ minHeight: '12rem', height: '12rem', maxHeight: '50vh' }}>
                    <Editor
                      defaultLanguage="json"
                      value={activeRequest?.body || ''}
                      onChange={(value) => {
                        if (activeRequest) {
                          updateTab(activeRequest.id, { body: value || '' });
                        }
                      }}
                      options={{
                        ...editorOptions,
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                      }}
                      beforeMount={(monaco) => {
                        monaco.editor.defineTheme('khabariLight', {
                          base: 'vs',
                          inherit: true,
                          rules: [],
                          colors: {
                            'editor.background': '#ffffff',
                            'editor.foreground': '#374151',
                          },
                        });
                        monaco.editor.defineTheme('khabariDark', {
                          base: 'vs-dark',
                          inherit: true,
                          rules: [],
                          colors: {
                            'editor.background': '#1f2937',
                            'editor.foreground': '#e5e7eb',
                          },
                        });
                      }}
                      theme={document.documentElement.classList.contains('dark') ? 'khabariDark' : 'khabariDark'} // khabariLight
                    />
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  Body is only available for POST, PUT, and PATCH requests
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
