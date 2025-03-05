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
    Snackbar,
    Alert,
} from '@mui/material';
import {
    Send as SendIcon,
    Add as AddIcon,
    PlayArrow as PlayArrowIcon,
} from '@mui/icons-material';
import ReactMarkdown from 'react-markdown';
import { apiService } from '../services/api';
import { WorkspaceAreaProps, CacheEntry, UserInput, WorkflowConfig } from '../types/api';
import { useTranslation } from '../contexts/LanguageContext';

export const WorkspaceArea: React.FC<WorkspaceAreaProps> = ({
    mode,
    workflowId,
    onWorkflowStart,
}) => {
    const { t } = useTranslation();
    const [history, setHistory] = useState<CacheEntry[]>([]);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

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
        try {
            const response = await apiService.getHistory(workflowId);
            setHistory(response.data);
        } catch (e) {
            setError(t('errors.network_error'));
        }
    };

    const setupWebSocket = () => {
        if (!workflowId) return;
        apiService.connectWebSocket(workflowId, (update) => {
            if (update.type === 'history_update' && Array.isArray(update.data)) {
                setHistory(update.data);
            }
        });
    };

    const handleUserInput = async () => {
        if (!workflowId || !userInput.trim()) return;

        setIsLoading(true);
        try {
            const input: UserInput = {
                content: userInput,
                prompt: `${t('workflow.user_input')} (${mode})`,
                metadata: {}
            };

            await apiService.addUserInput(workflowId, input);
            setUserInput('');
            await loadHistory();
        } catch (e) {
            setError(t('errors.model_error'));
        } finally {
            setIsLoading(false);
        }
    };

    const handleExecuteStep = async () => {
        if (!workflowId) return;

        setIsLoading(true);
        try {
            await apiService.executeStep(workflowId, null);
            await loadHistory();
        } catch (e) {
            setError(t('errors.model_error'));
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateBranch = async (entryId: string) => {
        if (!workflowId) return;

        const prompt = window.prompt(t('workflow.branch_prompt'));
        if (prompt) {
            try {
                const response = await apiService.createBranch(workflowId, {
                    base_id: entryId,
                    prompt,
                    metadata: {}
                });
                // Handle branch creation success
                console.log('Created branch:', response.data.branch_id);
            } catch (e) {
                setError(t('errors.network_error'));
            }
        }
    };

    if (!workflowId) {
        return (
            <Box sx={{ p: 3 }}>
                <Paper sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom>
                        {t(`workflow.${mode}.title`)}
                    </Typography>
                    <Typography color="textSecondary" gutterBottom>
                        {t(`workflow.${mode}.description`)}
                    </Typography>
                    <TextField
                        fullWidth
                        multiline
                        rows={4}
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        placeholder={t('workflow.initial_content')}
                        variant="outlined"
                        sx={{ mb: 2 }}
                    />
                    <Button
                        variant="contained"
                        onClick={() => {
                            const config: WorkflowConfig = {
                                prompt_template: '',
                                inheritance_rules: {
                                    full_history: false,
                                    last_3_steps: true,
                                    prompt_chain: true
                                },
                                termination_conditions: {
                                    max_steps: 10,
                                    inactivity_timeout: 300
                                }
                            };
                            onWorkflowStart(userInput, config);
                        }}
                        disabled={!userInput.trim() || isLoading}
                    >
                        {t(`workflow.${mode}.start`)}
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
                                    <Tooltip title={t('workflow.new_branch')}>
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
                        {t('workflow.execute')}
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
                        placeholder={t('workflow.input_placeholder')}
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

            <Snackbar
                open={!!error}
                autoHideDuration={6000}
                onClose={() => setError(null)}
            >
                <Alert severity="error" onClose={() => setError(null)}>
                    {error}
                </Alert>
            </Snackbar>
        </Box>
    );
};
