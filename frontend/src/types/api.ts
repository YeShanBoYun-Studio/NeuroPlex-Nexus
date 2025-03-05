export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

// Workflow Types
export interface WorkflowConfig {
  id: string;
  name: string;
  type: 'relay' | 'debate' | 'custom';
  settings: {
    inheritance?: 'full' | 'last3' | 'chain';
    maxSteps?: number;
  };
}

export interface CreateWorkflowRequest {
  name: string;
  type: WorkflowConfig['type'];
  initialContent?: string;
  settings?: WorkflowConfig['settings'];
}

export interface CreateWorkflowResponse {
  success: boolean;
  data: {
    workflowId: string;
    sessionId: string;
  };
  error?: string;
}

// Session Types
export interface WorkflowSession {
  id: string;
  workflowId: string;
  status: 'active' | 'completed' | 'error';
  steps: WorkflowStep[];
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowStep {
  id: string;
  workflow_id: string;
  session_id: string;
  content: string;
  role: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface WorkflowStepRequest {
  workflow_id: string;
  session_id: string;
  content: string;
  role?: string;
  metadata?: Record<string, unknown>;
}

export interface WorkflowStepResponse extends ApiResponse<WorkflowStep> {}

// Branch Types
export interface BranchCreateRequest {
  workflow_id: string;
  session_id: string;
  step_id: string;
  content: string;
  metadata?: Record<string, unknown>;
}

export interface BranchCreateResponse extends ApiResponse<{
  branchId: string;
  sessionId: string;
}> {}

// Cache Types
export interface CacheEntry {
  key: string;
  value: string;
  metadata?: Record<string, unknown>;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface CacheSettings {
  maxSize: number;
  ttl: number;
  cleanupInterval: number;
  allowOverwrite?: boolean;
}

export interface CacheStats {
  size: number;
  hits: number;
  misses: number;
  hitRate: number;
  lastCleanup?: string;
}

// WebSocket Types
export type WebSocketMessageType = 
  | 'connect'
  | 'disconnect'
  | 'step'
  | 'error'
  | 'status'
  | 'progress';

export interface WebSocketMessage<T = unknown> {
  type: WebSocketMessageType;
  payload: T;
  sessionId?: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

// Request Types
export type CreateRelayWorkflowRequest = CreateWorkflowRequest & {
  type: 'relay';
  initialPrompt: string;
  name: string;
  settings?: WorkflowConfig['settings'];
};

export type CreateDebateWorkflowRequest = CreateWorkflowRequest & {
  type: 'debate';
  topic: string;
  position: 'pro' | 'con';
  name: string;
  settings?: WorkflowConfig['settings'];
};

export type CreateCustomWorkflowRequest = CreateWorkflowRequest & {
  type: 'custom';
  template: string;
  variables: Record<string, string>;
  name: string;
  settings?: WorkflowConfig['settings'];
};

// Error Types
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  timestamp?: string;
}

// Response Types
export type WorkflowResponse = ApiResponse<WorkflowConfig>;
export type SessionResponse = ApiResponse<WorkflowSession>;
export type StepResponse = ApiResponse<WorkflowStep>;
export type GetWorkflowResponse = ApiResponse<WorkflowConfig>;
export type ListWorkflowsResponse = ApiResponse<WorkflowConfig[]>;
export type GetSessionResponse = ApiResponse<WorkflowSession>;
export type ListSessionsResponse = ApiResponse<WorkflowSession[]>;
