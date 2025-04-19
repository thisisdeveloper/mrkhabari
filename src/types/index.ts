export type Method = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';

export interface QueryParam {
  key: string;
  value: string;
  enabled: boolean;
}

export type AuthType = 'none' | 'basic' | 'bearer' | 'apiKey';

export interface AuthConfig {
  type: AuthType;
  config: Record<string, string>;
}

export interface RequestTab {
  id: string;
  name: string;
  method: Method;
  url: string;
  params: QueryParam[];
  headers: Record<string, string>;
  body: string;
  auth: AuthConfig;
  timestamp: number;
}

export interface ResponseData {
  status: number;
  statusText: string;
  data: any;
  headers: Record<string, string>;
  time: number;
  size: string;
  timestamp: number;
}

export interface HistoryItem {
  request: RequestTab;
  response?: ResponseData;
}

export interface CollectionItem {
  id: string;
  name: string;
  type: 'collection' | 'folder' | 'request';
  parentId?: string;
  children?: CollectionItem[];
}
