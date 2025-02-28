import React, { useEffect, useState } from 'react';
import {
    Box,
    Paper,
    TextField,
    Button,
    Typography,
    Divider,
    Card,
    CardContent,
    IconButton,
    Tooltip,
} from '@mui/material';
import {
    Send as SendIcon,
    Add as AddIcon,
    PlayArrow as PlayArrowIcon,
} from '@mui/icons-material';
import ReactMarkdown from 'react-markdown';
import { apiService } from '../services/api';
import { CacheEntry, UserInput } from '../types/api';

interface WorkspaceAreaProps {
    workflowId?: string;
    mode: 'relay' | 'debate' | 'custom';
    onWorkflowStart: (content: string) => Promise<void>;
}

export const WorkspaceArea: React.FC<WorkspaceAreaProps> = ({
    workflowId,
    mode,
    onWorkflowStart,
}) => {
    const [history, setHistory] = useState<CacheEntry[]>([]);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (workflowId) {
            loadHistory();
            setupWebSocket();
        }
        return () => {
            apiService.disconnectWebSocket();
        };
    }, [workflowId]);

    const loadHistory = async () => {
        if (!workflowId) return;
        const response = await apiService.getHistory(workflowId);
        if (response.data) {
            setHistory(response.data);
        }
    };

    const setupWebSocket = () => {
        if (!workflowId) return;
        apiService.connectWebSocket(workflowId, (update) => {
            if (update.type === 'history_update') {
                setHistory(update.data);
            }
        });
    };

    const handleUserInput = async () => {
        if (!workflowId || !userInput.trim()) return;

        setIsLoading(true);
        const input: UserInput = {
            content: userInput,
            prompt: `User input for ${mode} mode`,
        };

        const response = await apiService.addUserInput(workflowId, input);
        if (response.data) {
            setUserInput('');
            await loadHistory();
        }
        setIsLoading(false);
    };

    const handleExecuteStep = async () => {
        if (!workflowId) return;

        setIsLoading(true);
        const response = await apiService.executeStep(workflowId);
        if (response.data) {
            await loadHistory();
        }
        setIsLoading(false);
    };

    const handleCreateBranch = async (entryId: string) => {
        if (!workflowId) return;

        const prompt = window.prompt('Enter new branch prompt:');
        if (prompt) {
            const response = await apiService.createBranch({
                base_id: entryId,
                new_prompt: prompt,
            });
            if (response.data) {
                // You might want to navigate to the new branch here
                console.log('Created branch:', response.data.branch_id);
            }
        }
    };

    if (!workflowId) {
        return (
            <Box sx={{ p: 3 }}>
                <Paper sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom>
                        Start New {mode.charAt(0).toUpperCase() + mode.slice(1)} Workflow
                    </Typography>
                    <TextField
                        fullWidth
                        multiline
                        rows={4}
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        placeholder="Enter initial content..."
                        variant="outlined"
                        sx={{ mb: 2 }}
                    />
                    <Button
                        variant="contained"
                        onClick={() => onWorkflowStart(userInput)}
                        disabled={!userInput.trim() || isLoading}
                    >
                        Start Workflow
                    </Button>
                </Paper>
            </Box>
        );
    }

    return (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* History View */}
            <Box sx={{ flex: 1, overflowY: 'auto', mb: 2 }}>
                {history.map((entry) => (
                    <Card key={entry.entry_id} sx={{ mb: 2 }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography color="textSecondary" gutterBottom>
                                    {entry.author}
                                </Typography>
                                <Box>
                                    <Tooltip title="Create Branch">
                                        <IconButton
                                            size="small"
                                            onClick={() => handleCreateBranch(entry.entry_id)}
                                        >
                                            <AddIcon />
                                        </IconButton>
                                    </Tooltip>
                                </Box>
                            </Box>
                            <Divider sx={{ mb: 1 }} />
                            <Box sx={{ mb: 1 }}>
                                <ReactMarkdown>{entry.content}</ReactMarkdown>
                            </Box>
                            <Typography variant="caption" color="textSecondary">
                                {new Date(entry.timestamp).toLocaleString()}
                            </Typography>
                        </CardContent>
                    </Card>
                ))}
            </Box>

            {/* Control Panel */}
            <Paper sx={{ p: 2, mb: 2 }}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleExecuteStep}
                        disabled={isLoading}
                        startIcon={<PlayArrowIcon />}
                    >
                        Execute Step
                    </Button>
                </Box>
            </Paper>

            {/* Input Area */}
            <Paper sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <TextField
                        fullWidth
                        multiline
                        rows={3}
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        placeholder="Enter your input..."
                        variant="outlined"
                    />
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleUserInput}
                        disabled={!userInput.trim() || isLoading}
                        sx={{ minWidth: 100 }}
                    >
                        <SendIcon />
                    </Button>
                </Box>
            </Paper>
        </Box>
    );
};
