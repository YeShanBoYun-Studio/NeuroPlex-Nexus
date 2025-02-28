import axios, { AxiosInstance } from 'axios';
import {
    WorkflowStart,
    WorkflowResponse,
    UserInput,
    BranchCreate,
    BranchResponse,
    StepResponse,
    CacheEntry,
    ApiResponse
} from '../types/api';

class ApiService {
    private api: AxiosInstance;
    private ws: WebSocket | null = null;
    private wsCallbacks: ((data: any) => void)[] = [];

    constructor() {
        this.api = axios.create({
            baseURL: 'http://localhost:8000',
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }

    // Cache Settings
    async updateCacheSettings(settings: {
        max_size_mb: number;
        compression_enabled: boolean;
        compression_threshold: number;
    }): Promise<ApiResponse<void>> {
        try {
            const response = await this.api.post('/cache/settings', settings);
            return { data: response.data };
        } catch (error: any) {
            return { error: error.response?.data?.detail || 'Failed to update cache settings' };
        }
    }

    // Workflow Management
    async startRelayWorkflow(data: WorkflowStart): Promise<ApiResponse<WorkflowResponse>> {
        try {
            const response = await this.api.post('/workflows/relay', data);
            return { data: response.data };
        } catch (error: any) {
            return { error: error.response?.data?.detail || 'Failed to start relay workflow' };
        }
    }

    async startDebateWorkflow(data: WorkflowStart): Promise<ApiResponse<WorkflowResponse>> {
        try {
            const response = await this.api.post('/workflows/debate', data);
            return { data: response.data };
        } catch (error: any) {
            return { error: error.response?.data?.detail || 'Failed to start debate workflow' };
        }
    }

    async startCustomWorkflow(data: WorkflowStart): Promise<ApiResponse<WorkflowResponse>> {
        try {
            const response = await this.api.post('/workflows/custom', data);
            return { data: response.data };
        } catch (error: any) {
            return { error: error.response?.data?.detail || 'Failed to start custom workflow' };
        }
    }

    // Step Execution
    async executeStep(workflowId: string, modelName?: string): Promise<ApiResponse<StepResponse>> {
        try {
            const response = await this.api.post(`/workflows/${workflowId}/step`, { model_name: modelName });
            return { data: response.data };
        } catch (error: any) {
            return { error: error.response?.data?.detail || 'Failed to execute step' };
        }
    }

    // User Input
    async addUserInput(workflowId: string, input: UserInput): Promise<ApiResponse<StepResponse>> {
        try {
            const response = await this.api.post(`/workflows/${workflowId}/input`, input);
            return { data: response.data };
        } catch (error: any) {
            return { error: error.response?.data?.detail || 'Failed to add user input' };
        }
    }

    // History Management
    async getHistory(workflowId: string): Promise<ApiResponse<CacheEntry[]>> {
        try {
            const response = await this.api.get(`/workflows/${workflowId}/history`);
            return { data: response.data };
        } catch (error: any) {
            return { error: error.response?.data?.detail || 'Failed to get history' };
        }
    }

    // Branch Management
    async createBranch(data: BranchCreate): Promise<ApiResponse<BranchResponse>> {
        try {
            const response = await this.api.post('/workflows/branch', data);
            return { data: response.data };
        } catch (error: any) {
            return { error: error.response?.data?.detail || 'Failed to create branch' };
        }
    }

    // WebSocket Connection
    connectWebSocket(workflowId: string, callback: (data: any) => void) {
        if (this.ws?.readyState === WebSocket.OPEN) {
            this.ws.close();
        }

        this.ws = new WebSocket(`ws://localhost:8000/ws/${workflowId}`);
        this.wsCallbacks.push(callback);

        this.ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            this.wsCallbacks.forEach(cb => cb(data));
        };

        this.ws.onerror = (error) => {
            console.error('WebSocket error:', error);
        };

        this.ws.onclose = () => {
            console.log('WebSocket connection closed');
            // Attempt to reconnect after 5 seconds
            setTimeout(() => this.connectWebSocket(workflowId, callback), 5000);
        };
    }

    disconnectWebSocket() {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
            this.wsCallbacks = [];
        }
    }
}

// Create a singleton instance
export const apiService = new ApiService();
