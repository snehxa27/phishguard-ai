import axios from 'axios';

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface ScanRequest {
  text: string;
}

export interface HighlightItem {
  start: number;
  end: number;
  word: string;
  type: string;
}

export interface URLAnalysis {
  url: string;
  risk_score: number;
  status: string;
  reason: string;
}

export interface ScanResponse {
  id?: number;
  score: number;
  risk: "Low" | "Medium" | "High" | "low" | "medium" | "high";
  tactics: Record<string, number>;
  explanation: string;
  highlights: HighlightItem[];
  extracted_text?: string;
  subject?: string;
  sender?: string;
  urls?: URLAnalysis[];
}

export const scanText = async (text: string): Promise<ScanResponse> => {
  const response = await api.post<ScanResponse>('/scan', { text } as ScanRequest);
  return response.data;
};

export const uploadFile = async (file: File): Promise<ScanResponse> => {
  const formData = new FormData();
  formData.append("file", file);
  
  const response = await api.post<ScanResponse>('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

export interface HistorySummary {
  id: number;
  target: string;
  source: string;
  timestamp: string;
  risk: string;
  score: number;
  result: string;
}

export interface HistoryDetail extends HistorySummary {
  tactics: Record<string, number>;
  explanation: string;
  urls?: URLAnalysis[];
}

export const getHistory = async (): Promise<HistorySummary[]> => {
  const response = await api.get<HistorySummary[]>('/history');
  return response.data;
};

export const getScanById = async (id: number): Promise<HistoryDetail> => {
  const response = await api.get<HistoryDetail>(`/history/${id}`);
  return response.data;
};

export default api;
