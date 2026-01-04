import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const api = axios.create({
  baseURL: `${API_BASE}/api`,
});

export interface FileInfo {
  id: string;
  filename: string;
  filetype: string;
  filesize: number;
  description: string;
  created_at: string;
}

export interface UploadResponse {
  id: string;
  filename: string;
  share_url: string;
}

export const uploadFile = async (
  file: File,
  description: string,
  onProgress?: (progress: number) => void
): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('description', description);

  const response = await api.post<UploadResponse>('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (progressEvent) => {
      if (progressEvent.total && onProgress) {
        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(progress);
      }
    },
  });

  return response.data;
};

export const uploadText = async (
  content: string,
  description: string
): Promise<UploadResponse> => {
  const response = await api.post<UploadResponse>('/text', { content, description });
  return response.data;
};

export const getFileInfo = async (id: string): Promise<FileInfo> => {
  const response = await api.get<FileInfo>(`/file/${id}`);
  return response.data;
};

export const getDownloadUrl = (id: string): string => {
  return `${API_BASE}/api/download/${id}`;
};

export const getPreviewUrl = (id: string): string => {
  return `${API_BASE}/api/preview/${id}`;
};
