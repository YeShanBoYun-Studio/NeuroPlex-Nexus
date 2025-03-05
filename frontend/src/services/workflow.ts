import { http, ApiResponse } from '../utils/http';

export interface WorkflowConfig {
  maxSteps: number;
  inheritance: 'full' | 'last3' | 'chain';
  contextWindow: number;
}

export interface WorkflowSession {
  id: string;
  name: string;
  type: 'relay' | 'debate' | 'custom';
  config: WorkflowConfig;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSessionParams {
  type: WorkflowSession['type'];
  name: string;
  config?: Partial<WorkflowConfig>;
}

class WorkflowService {
  private readonly baseEndpoint = '/api/workflows';

  async createSession({ type, name, config }: CreateSessionParams): Promise<WorkflowSession> {
    const response = await http.post<ApiResponse<WorkflowSession>>(`${this.baseEndpoint}/sessions`, {
      type,
      name,
      config,
    });

    return response.data;
  }

  async getSession(id: string): Promise<WorkflowSession> {
    const response = await http.get<ApiResponse<WorkflowSession>>(
      `${this.baseEndpoint}/sessions/${id}`
    );

    return response.data;
  }

  async listSessions(params?: { type?: WorkflowSession['type'] }): Promise<WorkflowSession[]> {
    const response = await http.get<ApiResponse<WorkflowSession[]>>(
      this.baseEndpoint + '/sessions',
      params as Record<string, string>
    );

    return response.data;
  }

  async updateSession(
    id: string,
    updates: Partial<Pick<WorkflowSession, 'name' | 'config'>>
  ): Promise<WorkflowSession> {
    const response = await http.put<ApiResponse<WorkflowSession>>(
      `${this.baseEndpoint}/sessions/${id}`,
      updates
    );

    return response.data;
  }

  async deleteSession(id: string): Promise<void> {
    await http.delete<ApiResponse<void>>(`${this.baseEndpoint}/sessions/${id}`);
  }
}

export const workflowService = new WorkflowService();
export default workflowService;
