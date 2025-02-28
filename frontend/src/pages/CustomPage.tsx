import React, { useState } from 'react';
import { Box, TextField } from '@mui/material';
import { WorkspaceArea } from '../components/WorkspaceArea';
import { apiService } from '../services/api';
import { WorkflowConfig } from '../types/api';

export const CustomPage: React.FC = () => {
    const [workflowId, setWorkflowId] = useState<string>();
    const [promptTemplate, setPromptTemplate] = useState<string>(
        "You are an expert collaborator. Review the content and continue in this style:\n\n{context}"
    );

    const handleWorkflowStart = async (content: string) => {
        const config: WorkflowConfig = {
            mode: 'custom',
            prompt_template: promptTemplate,
            inheritance_rules: {
                full_history: true,
                last_3_steps: false,
                prompt_chain: true
            },
            termination_conditions: {
                max_steps: 10,
                inactivity_timeout: 300
            }
        };

        const response = await apiService.startCustomWorkflow({
            mode: 'custom',
            initial_content: content,
            config: config
        });

        if (response.data) {
            setWorkflowId(response.data.workflow_id);
        }
    };

    if (!workflowId) {
        return (
            <Box sx={{ p: 3 }}>
                <TextField
                    fullWidth
                    multiline
                    rows={4}
                    value={promptTemplate}
                    onChange={(e) => setPromptTemplate(e.target.value)}
                    label="Prompt Template"
                    placeholder="Enter your custom prompt template..."
                    variant="outlined"
                    sx={{ mb: 3 }}
                />
                <WorkspaceArea
                    mode="custom"
                    workflowId={workflowId}
                    onWorkflowStart={handleWorkflowStart}
                />
            </Box>
        );
    }

    return (
        <WorkspaceArea
            mode="custom"
            workflowId={workflowId}
            onWorkflowStart={handleWorkflowStart}
        />
    );
};
