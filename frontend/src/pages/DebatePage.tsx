import React, { useState } from 'react';
import { WorkspaceArea } from '../components/WorkspaceArea';
import { apiService } from '../services/api';

export const DebatePage: React.FC = () => {
    const [workflowId, setWorkflowId] = useState<string>();

    const handleWorkflowStart = async (content: string) => {
        const response = await apiService.startDebateWorkflow({
            mode: 'debate',
            initial_content: content,
            max_steps: 6  // 3 rounds with 2 sides each
        });

        if (response.data) {
            setWorkflowId(response.data.workflow_id);
        }
    };

    return (
        <WorkspaceArea
            mode="debate"
            workflowId={workflowId}
            onWorkflowStart={handleWorkflowStart}
        />
    );
};
