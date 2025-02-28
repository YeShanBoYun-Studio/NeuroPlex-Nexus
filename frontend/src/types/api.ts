type UUID = string;

export interface WorkflowStart {
    initial_content: string;
    config?: WorkflowConfig;
}

export interface WorkflowResponse {
    workflow_id: UUID;
}

export interface UserInput {
    content: string;
    prompt?: string;
}

export interface BranchCreate {
    base_id: UUID;
    new_prompt: string;
}

export interface BranchResponse {
    branch_id: UUID;
}

export interface StepResponse {
    entry_id: UUID;
    content: string;
}

export interface CacheEntry {
    entry_id: UUID;
    parent_id?: UUID;
    content: string;
    prompt: string;
    author: string;
    timestamp: string;
    metadata: Record<string, any>;
}

export interface WorkflowConfig {
    mode: string;
    prompt_template: string;
    inheritance_rules: Record<string, boolean>;
    termination_conditions: Record<string, number>;
}

export interface ApiResponse<T> {
    data?: T;
    error?: string;
}

export interface CacheSettings {
    max_size_mb: number;
    compression_enabled: boolean;
    compression_threshold: number;
}
