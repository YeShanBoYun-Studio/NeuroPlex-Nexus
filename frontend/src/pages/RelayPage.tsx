import React from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Stack,
  Alert,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { WorkspaceArea } from '../components/WorkspaceArea';
import { useLanguage } from '../contexts/LanguageContext';
import type { CreateRelayWorkflowRequest } from '../types/api';
import { createRelayWorkflow } from '../services/workflow';

interface FormErrors {
  name?: string;
  initialContent?: string;
}

interface FormData {
  name: string;
  initialContent: string;
}

const defaultValues: FormData = {
  name: '',
  initialContent: '',
};

export default function RelayPage() {
  const { t, tk } = useLanguage();
  const navigate = useNavigate();
  const [formData, setFormData] = React.useState<FormData>(defaultValues);
  const [errors, setErrors] = React.useState<FormErrors>({});
  const [error, setError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: undefined }));
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    if (!formData.name.trim()) {
      newErrors.name = t(tk.errors.required);
      isValid = false;
    }

    if (!formData.initialContent.trim()) {
      newErrors.initialContent = t(tk.errors.required);
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const request: CreateRelayWorkflowRequest = {
        type: 'relay',
        name: formData.name,
        initialContent: formData.initialContent,
        initialPrompt: formData.initialContent,
        settings: {
          inheritance: 'full',
          maxSteps: 10,
        },
      };

      const response = await createRelayWorkflow(request);

      if (response.success && response.data) {
        navigate(`/workspace/${response.data.sessionId}`);
      } else {
        setError(response.error || t(tk.errors.workflow_error));
      }
    } catch (err: any) {
      console.error('Failed to create relay workflow:', err);
      setError(t(tk.errors.workflow_error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <WorkspaceArea>
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{ width: '100%', maxWidth: 800, mx: 'auto' }}
      >
        <Stack spacing={3}>
          <Typography variant="h5" gutterBottom>
            {t(tk.workflow.relay.description)}
          </Typography>

          {error && (
            <Alert severity="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          <TextField
            name="name"
            label={t(tk.workflow.relay.session_name)}
            variant="outlined"
            fullWidth
            value={formData.name}
            onChange={handleChange}
            error={!!errors.name}
            helperText={errors.name}
            disabled={isSubmitting}
          />

          <TextField
            name="initialContent"
            label={t(tk.workflow.relay.initial_content)}
            placeholder={t(tk.workflow.relay.enter_prompt)}
            multiline
            rows={4}
            variant="outlined"
            fullWidth
            value={formData.initialContent}
            onChange={handleChange}
            error={!!errors.initialContent}
            helperText={errors.initialContent || t(tk.workflow.relay.press_enter)}
            disabled={isSubmitting}
          />

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="large"
              disabled={isSubmitting}
            >
              {isSubmitting ? t(tk.common.loading) : t(tk.workflow.relay.start)}
            </Button>
          </Box>
        </Stack>
      </Box>
    </WorkspaceArea>
  );
}
