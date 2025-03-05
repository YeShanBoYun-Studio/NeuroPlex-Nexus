import axios, { AxiosInstance } from 'axios';
import { configService } from './config';
import type { 
  CreateWorkflowRequest,
  CreateWorkflowResponse,
  WorkflowStepRequest,
  WorkflowStepResponse,
  BranchCreateRequest,
  BranchCreateResponse,
  CacheEntry,
  CacheSettings,
  CacheStats,
  WebSocketMessage,
} from '../types/api';

class ApiService {
  private axios: AxiosInstance;

  constructor() {
    this.axios = axios.create({
      baseURL: configService.getApiUrl(),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add response interceptor for error handling
    this.axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (configService.isFeatureEnabled('debug')) {
          console.error('API Error:', error);
        }
        return Promise.reject(error);
      }
    );
  }

  // Workflow Management
  async createWorkflow(request: CreateWorkflowRequest): Promise<CreateWorkflowResponse> {
    const response = await this.axios.post('/workflows', request);
    return response.data;
  }

  async getWorkflowHistory(workflowId: string): Promise<CacheEntry[]> {
    const response = await this.axios.get(`/workflows/${workflowId}/history`);
    return response.data;
  }

  async executeStep(request: WorkflowStepRequest): Promise<WorkflowStepResponse> {
    const response = await this.axios.post(`/workflows/${request.workflow_id}/step`, request);
    return response.data;
  }

  async createBranch(request: BranchCreateRequest): Promise<BranchCreateResponse> {
    const response = await this.axios.post('/workflows/branch', request);
    return response.data;
  }

  // Cache Management
  async getCacheSettings(): Promise<CacheSettings> {
    const response = await this.axios.get('/cache/settings');
    return response.data;
  }

  async updateCacheSettings(settings: Partial<CacheSettings>): Promise<CacheSettings> {
    const response = await this.axios.patch('/cache/settings', settings);
    return response.data;
  }

  async getCacheStats(): Promise<CacheStats> {
    const response = await this.axios.get('/cache/stats');
    return response.data;
  }

  async clearCache(): Promise<void> {
    await this.axios.post('/cache/clear');
  }
}

export class WebSocketClient {
  private ws: WebSocket | null = null;
  private messageHandlers: ((data: WebSocketMessage) => void)[] = [];
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectTimeout = 1000;

  constructor(private workflowId: string) {
    this.connect();
  }

  private connect() {
    const wsUrl = `${configService.getWsUrl()}/workflows/${this.workflowId}`;
    this.ws = new WebSocket(wsUrl);

    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data) as WebSocketMessage;
      this.messageHandlers.forEach(handler => handler(data));
    };

    this.ws.onclose = () => {
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        setTimeout(() => {
          this.reconnectAttempts++;
          this.connect();
        }, this.reconnectTimeout * Math.pow(2, this.reconnectAttempts));
      }
    };

    this.ws.onerror = (error) => {
      if (configService.isFeatureEnabled('debug')) {
        console.error('WebSocket Error:', error);
      }
    };
  }

  onMessage(handler: (data: WebSocketMessage) => void) {
    this.messageHandlers.push(handler);
  }

  close() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  send(data: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    }
  }
}

export const apiService = new ApiService();
