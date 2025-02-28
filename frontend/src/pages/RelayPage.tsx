import React, { useState } from 'react';
import { WorkspaceArea } from '../components/WorkspaceArea';
import { apiService } from '../services/api';

export const RelayPage: React.FC = () => {
    const [workflowId, setWorkflowId] = useState<string>();

    const handleWorkflowStart = async (content: string) => {
        const response = await apiService.startRelayWorkflow({
            mode: 'relay',
            initial_content: content,
            roles: ['worldbuilder', 'character_designer', 'plot_developer'],
            max_steps: 10
        });

        if (response.data) {
            setWorkflowId(response.data.workflow_id);
        }
    };

    return (
        <WorkspaceArea
            mode="relay"
            workflowId={workflowId}
            onWorkflowStart={handleWorkflowStart}
        />
    );
};
