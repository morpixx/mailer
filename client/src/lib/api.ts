import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
});

export interface Account {
  id: number;
  email: string;
  createdAt: string;
}

export interface SendLog {
  id: number;
  email: string;
  status: 'success' | 'failed';
  errorMessage?: string;
  template?: string;
  timestamp: string;
}

export interface UploadResponse {
  message: string;
  totalEmails: number;
  saved: number;
  skipped: number;
  errors: string[];
}

export interface SendResponse {
  message: string;
  total: number;
  success: number;
  failed: number;
  details: Array<{
    email: string;
    success: boolean;
    error?: string;
  }>;
}

// Загрузка файла с email адресами
export const uploadFile = async (file: File): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post<UploadResponse>('/upload', formData);
  return response.data;
};

// Получение всех email адресов
export const getAccounts = async (): Promise<Account[]> => {
  const response = await api.get<Account[]>('/accounts');
  return response.data;
};

// Удаление email адреса
export const deleteAccount = async (id: number): Promise<void> => {
  await api.delete(`/accounts/${id}`);
};

// Очистка всех email адресов
export const clearAccounts = async (): Promise<void> => {
  await api.delete('/accounts');
};

// Отправка email рассылки
export const sendEmails = async (
  subject: string,
  template: string
): Promise<SendResponse> => {
  const response = await api.post<SendResponse>('/send', {
    subject,
    template,
  });

  return response.data;
};

// Получение логов отправки
export const getLogs = async (): Promise<SendLog[]> => {
  const response = await api.get<SendLog[]>('/logs');
  return response.data;
};
