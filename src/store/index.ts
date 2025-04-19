import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { RequestTab, ResponseData } from '../types';

interface CollectionItem {
  id: string;
  name: string;
  type: 'collection' | 'folder';
  parentId?: string;
  children: CollectionItem[];
}

interface AppState {
  tabs: RequestTab[];
  activeTab: string;
  activeSection: 'params' | 'headers' | 'body' | 'auth';
  response: ResponseData | null;
  isLoading: boolean;
  history: RequestTab[];
  tabResponses: Record<string, ResponseData>;
  collections: CollectionItem[];
  addTab: () => void;
  removeTab: (id: string) => void;
  updateTab: (id: string, updates: Partial<RequestTab>) => void;
  setActiveTab: (id: string) => void;
  setActiveSection: (section: 'params' | 'headers' | 'body' | 'auth') => void;
  setResponse: (response: ResponseData | null) => void;
  setTabResponse: (tabId: string, response: ResponseData) => void;
  setIsLoading: (loading: boolean) => void;
  addToHistory: (request: RequestTab) => void;
  addCollection: (name: string, parentId?: string) => void;
  updateCollection: (id: string, name: string) => void;
  deleteCollection: (id: string) => void;
}

const DEFAULT_REQUEST: Partial<RequestTab> = {
  method: 'GET',
  url: '',
  params: [],
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  },
  body: '',
  auth: {
    type: 'none',
    config: {}
  }
};

const DEFAULT_STATE = {
  tabs: [{
    id: '1',
    name: 'New Request',
    ...DEFAULT_REQUEST,
    timestamp: Date.now()
  } as RequestTab],
  activeTab: '1',
  activeSection: 'params' as const,
  response: null,
  isLoading: false,
  history: [],
  tabResponses: {},
  collections: []
};

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      ...DEFAULT_STATE,

      addTab: () => set((state) => {
        const newTab: RequestTab = {
          id: (state.tabs.length + 1).toString(),
          name: `New Request ${state.tabs.length + 1}`,
          ...DEFAULT_REQUEST,
          timestamp: Date.now()
        } as RequestTab;
        return {
          tabs: [...state.tabs, newTab],
          activeTab: newTab.id
        };
      }),

      removeTab: (id) => set((state) => {
        if (state.tabs.length === 1) return state;
        const newTabs = state.tabs.filter(tab => tab.id !== id);
        const { [id]: removedResponse, ...remainingResponses } = state.tabResponses;
        return {
          tabs: newTabs,
          activeTab: state.activeTab === id ? newTabs[0].id : state.activeTab,
          tabResponses: remainingResponses,
          response: state.activeTab === id ? null : state.response
        };
      }),

      updateTab: (id, updates) => set((state) => ({
        tabs: state.tabs.map(tab =>
          tab.id === id ? { ...tab, ...updates } : tab
        )
      })),

      setActiveTab: (id) => set((state) => ({ 
        activeTab: id,
        response: state.tabResponses[id] || null
      })),
      
      setActiveSection: (section) => set({ activeSection: section }),
      
      setResponse: (response) => set((state) => {
        if (response) {
          return {
            response,
            tabResponses: {
              ...state.tabResponses,
              [state.activeTab]: response
            }
          };
        }
        return { response };
      }),
      
      setTabResponse: (tabId, response) => set((state) => ({
        tabResponses: {
          ...state.tabResponses,
          [tabId]: response
        },
        response: state.activeTab === tabId ? response : state.response
      })),

      setIsLoading: (loading) => set({ isLoading: loading }),
      
      addToHistory: (request) => set((state) => ({
        history: [request, ...state.history].slice(0, 50) // Keep last 50 requests
      })),

      addCollection: (name, parentId) => set((state) => {
        const newCollection: CollectionItem = {
          id: Date.now().toString(),
          name,
          type: parentId ? 'folder' : 'collection',
          parentId,
          children: []
        };
        
        return {
          collections: parentId 
            ? state.collections.map(c => {
                if (c.id === parentId) {
                  return { ...c, children: [...(c.children || []), newCollection] };
                }
                return c;
              })
            : [...state.collections, newCollection]
        };
      }),

      updateCollection: (id, name) => set((state) => ({
        collections: state.collections.map(c => 
          c.id === id ? { ...c, name } : c
        )
      })),

      deleteCollection: (id) => set((state) => ({
        collections: state.collections.filter(c => c.id !== id)
      }))
    }),
    {
      name: 'khabari-storage',
      partialize: (state) => ({
        tabs: state.tabs,
        activeTab: state.activeTab,
        response: state.response,
        tabResponses: state.tabResponses,
        history: state.history,
        collections: state.collections
      })
    }
  )
);
