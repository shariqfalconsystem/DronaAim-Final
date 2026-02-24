export interface Category {
  id: string;
  name: string;
  icon: string;
}

export interface ContentItemType {
  id: number;
  category: string;
  title: string;
  date: string;
  placeholder: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  count: number;
}

export interface PublishedContentItemType {
  id: string;
  category: string;
  title: string;
  subtitle?: string;
  date: string;
  placeholder: string;
  content: any;
  publishedBy: string;
  publishedVersion: number;
  activePersonas?: string[];
}
export interface PageDetails {
  totalRecords: number;
  pageSize: number;
  currentPage: number;
}

export interface ApiResponse {
  pageDetails: PageDetails;
  publishedList: PublishedItem[];
}

export interface PublishedItem {
  publishedId: string;
  topicNames: string[];
  title: string;
  subTitle: string;
  content: ContentBlock;
  createdAt: number;
  createdBy: string;
  publishedBy: string;
  publishedVersion: number;
}

export interface ContentBlock {
  time: number;
  version: string;
  blocks: Block[];
}

export interface Block {
  id: string;
  type: string;
  data: any;
}

export interface EditorBlock {
  id: string;
  type: string;
  data: any;
}

export interface EditorContent {
  blocks: EditorBlock[];
  time?: number;
  version?: string;
}

export interface PublishedData {
  publishedId?: string;
  title?: string;
  subTitle?: string;
  topicNames?: string[];
  content?: EditorContent;
  createdAt?: string;
  publishedBy?: string;
  publishedVersion?: number;
  activePersonas?: string[];
}

export interface NotificationState {
  open: boolean;
  message: string;
  severity: 'success' | 'info' | 'warning' | 'error';
}
