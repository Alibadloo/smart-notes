export interface User {
  userId: number;
  email: string;
  fullName: string;
  token: string;
}

export type NoteStatus = 'Active' | 'Archived' | 'Deleted';

export interface Note {
  id: number;
  title: string;
  content: string;
  status: NoteStatus;
  isPinned: boolean;
  tags: string[];
  categoryId?: number;
  categoryName?: string;
  categoryColor?: string;
  createdAt: string;
  updatedAt: string;
  attachmentCount: number;
  versionCount: number;
}

export interface NoteVersion {
  id: number;
  title: string;
  content: string;
  versionNumber: number;
  createdAt: string;
}

export interface Attachment {
  id: number;
  fileName: string;
  contentType: string;
  fileSize: number;
  uploadedAt: string;
}

export interface Category {
  id: number;
  name: string;
  color: string;
  icon: string;
  isDefault: boolean;
  noteCount: number;
}

export interface CreateNotePayload {
  title: string;
  content: string;
  categoryId?: number;
  tags: string[];
  isPinned?: boolean;
}

export interface UpdateNotePayload {
  title?: string;
  content?: string;
  categoryId?: number;
  tags?: string[];
  isPinned?: boolean;
}

export interface CreateCategoryPayload {
  name: string;
  color: string;
  icon: string;
}
