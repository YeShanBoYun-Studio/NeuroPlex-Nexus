import React, { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Switch,
    FormControlLabel,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Alert,
    IconButton,
    Grid,
    Tooltip,
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Check as CheckIcon,
    Error as ErrorIcon,
} from '@mui/icons-material';
import { apiService } from '../../services/api';
import { AIConfig, ProviderType } from '../../types/api';

const PROVIDER_FIELDS: Record<ProviderType, { label: string; type: string; required?: boolean }[]> = {
    openai: [
        { label: 'API Key', type: 'password', required: true },
        { label: 'Model Name', type: 'select', required: true },
    ],
    azure: [
        { label: 'API Key', type: 'password', required: true },
        { label: 'Endpoint', type: 'url', required: true },
        { label: 'Deployment Name', type: 'text', required: true },
    ],
    ollama: [
        { label: 'Base URL', type: 'url', required: true },
        { label: 'Model Name', type: 'text', required: true },
    ],
    huggingface: [
        { label: 'API Token', type: 'password', required: true },
        { label: 'Repository ID', type: 'text', required: true },
    ],
    anthropic: [
        { label: 'API Key', type: 'password', required: true },
        { label: 'Model Name', type: 'select', required: true },
    ],
};

const MODEL_OPTIONS: Record<ProviderType, string[]> = {
    openai: ['gpt-4', 'gpt-3.5-turbo'],
    azure: ['gpt-4', 'gpt-35-turbo'],
    ollama: ['llama2', 'mistral', 'codellama'],
    huggingface: [],
    anthropic: ['claude-3-opus', 'claude-3-sonnet', 'claude-2.1'],
};

export const AIConfigManager: React.FC = () => {
    const [configs, setConfigs] = useState<AIConfig[]>([]);
    const [open, setOpen] = useState(false);
    const [editConfig, setEditConfig] = useState<AIConfig | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [testingConnection, setTestingConnection] = useState(false);

    useEffect(() => {
        loadConfigs();
    }, []);

    const loadConfigs = async () => {
        try {
            const response = await apiService.listAIConfigs();
            setConfigs(response.data);
        } catch (err) {
            setError('Failed to load configurations');
        }
    };

    const handleSave = async (config: AIConfig) => {
        try {
            await apiService.saveAIConfig(config);
            await loadConfigs();
            setOpen(false);
            setEditConfig(null);
        } catch (err) {
            setError('Failed to save configuration');
        }
    };

    const handleDelete = async (name: string) => {
        if (window.confirm('Are you sure you want to delete this configuration?')) {
            try {
                await apiService.deleteAIConfig(name);
                await loadConfigs();
            } catch (err) {
                setError('Failed to delete configuration');
            }
        }
    };

    const handleTest = async (config: AIConfig) => {
        setTestingConnection(true);
        try {
            const result = await apiService.testAIConfig(config);
            if (result.data.success) {
                alert('Connection test successful!');
            } else {
                alert('Connection test failed: ' + result.data.error);
            }
        } catch (err) {
            alert('Connection test failed');
        } finally {
            setTestingConnection(false);
        }
    };

    return (
        <Box p={3}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h5">AI Configuration</Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => {
                        setEditConfig(null);
                        setOpen(true);
                    }}
                >
                    Add Configuration
                </Button>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}

            <Grid container spacing={2}>
                {configs.map((config) => (
                    <Grid item xs={12} sm={6} md={4} key={config.name}>
                        <Card>
                            <CardContent>
                                <Box display="flex" justifyContent="space-between" alignItems="center">
                                    <Typography variant="h6">{config.name}</Typography>
                                    <Box>
                                        <IconButton
                                            size="small"
                                            onClick={() => {
                                                setEditConfig(config);
                                                setOpen(true);
                                            }}
                                        >
                                            <EditIcon />
                                        </IconButton>
                                        <IconButton
                                            size="small"
                                            onClick={() => handleDelete(config.name)}
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </Box>
                                </Box>
                                <Typography color="textSecondary">{config.provider}</Typography>
                                <Box mt={2}>
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={config.is_active}
                                                onChange={(e) =>
                                                    handleSave({
                                                        ...config,
                                                        is_active: e.target.checked,
                                                    })
                                                }
                                            />
                                        }
                                        label="Active"
                                    />
                                    <Button
                                        size="small"
                                        onClick={() => handleTest(config)}
                                        disabled={testingConnection}
                                    >
                                        Test Connection
                                    </Button>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            <ConfigDialog
                open={open}
                config={editConfig}
                onClose={() => {
                    setOpen(false);
                    setEditConfig(null);
                }}
                onSave={handleSave}
            />
        </Box>
    );
};

interface ConfigDialogProps {
    open: boolean;
    config: AIConfig | null;
    onClose: () => void;
    onSave: (config: AIConfig) => void;
}

const ConfigDialog: React.FC<ConfigDialogProps> = ({ open, config, onClose, onSave }) => {
    const [formData, setFormData] = useState<AIConfig>({
        provider: 'openai',
        name: '',
        credentials: {},
        is_active: true,
        priority: 1,
    });

    useEffect(() => {
        if (config) {
            setFormData(config);
        } else {
            setFormData({
                provider: 'openai',
                name: '',
                credentials: {},
                is_active: true,
                priority: 1,
            });
        }
    }, [config]);

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>{config ? 'Edit Configuration' : 'New Configuration'}</DialogTitle>
            <DialogContent>
                <Box sx={{ mt: 2 }}>
                    <TextField
                        fullWidth
                        label="Name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        sx={{ mb: 2 }}
                    />

                    <FormControl fullWidth sx={{ mb: 2 }}>
                        <InputLabel>Provider</InputLabel>
                        <Select
                            value={formData.provider}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    provider: e.target.value as ProviderType,
                                    credentials: {},
                                })
                            }
                        >
                            {Object.keys(PROVIDER_FIELDS).map((provider) => (
                                <MenuItem key={provider} value={provider}>
                                    {provider.toUpperCase()}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    {PROVIDER_FIELDS[formData.provider]?.map((field) => (
                        <TextField
                            key={field.label}
                            fullWidth
                            label={field.label}
                            type={field.type}
                            required={field.required}
                            value={formData.credentials[field.label.toLowerCase().replace(' ', '_')] || ''}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    credentials: {
                                        ...formData.credentials,
                                        [field.label.toLowerCase().replace(' ', '_')]: e.target.value,
                                    },
                                })
                            }
                            sx={{ mb: 2 }}
                            select={field.type === 'select'}
                        >
                            {field.type === 'select' &&
                                MODEL_OPTIONS[formData.provider]?.map((option) => (
                                    <MenuItem key={option} value={option}>
                                        {option}
                                    </MenuItem>
                                ))}
                        </TextField>
                    ))}

                    <FormControlLabel
                        control={
                            <Switch
                                checked={formData.is_active}
                                onChange={(e) =>
                                    setFormData({ ...formData, is_active: e.target.checked })
                                }
                            />
                        }
                        label="Active"
                    />
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button onClick={() => onSave(formData)} variant="contained">
                    Save
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default AIConfigManager;
