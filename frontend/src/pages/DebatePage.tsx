import React from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  Stack,
  Alert,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { WorkspaceArea } from '../components/WorkspaceArea';
import { useLanguage } from '../contexts/LanguageContext';
import type { CreateDebateWorkflowRequest } from '../types/api';
import { createDebateWorkflow } from '../services/workflow';

interface FormErrors {
  topic?: string;
  position?: string;
}

interface FormData {
  topic: string;
  position: 'pro' | 'con';
}

const defaultValues: FormData = {
  topic: '',
  position: 'pro',
};

export default function DebatePage() {
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

    if (!formData.topic.trim()) {
      newErrors.topic = t(tk.errors.required);
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
      const request: CreateDebateWorkflowRequest = {
        type: 'debate',
        name: formData.topic,
        topic: formData.topic,
        position: formData.position,
        settings: {
          inheritance: 'full',
          maxSteps: 10,
        },
      };

      const response = await createDebateWorkflow(request);

      if (response.success && response.data) {
        navigate(`/workspace/${response.data.sessionId}`);
      } else {
        setError(response.error || t(tk.errors.workflow_error));
      }
    } catch (err: any) {
      console.error('Failed to create debate workflow:', err);
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
            {t(tk.workflow.debate.description)}
          </Typography>

          {error && (
            <Alert severity="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          <FormControl fullWidth>
            <Typography variant="subtitle1" gutterBottom>
              {t(tk.workflow.debate.select_topic)}
            </Typography>
            <TextField
              name="topic"
              label={t(tk.workflow.debate.enter_topic)}
              variant="outlined"
              fullWidth
              value={formData.topic}
              onChange={handleChange}
              error={!!errors.topic}
              helperText={errors.topic}
              multiline
              rows={3}
              disabled={isSubmitting}
            />
          </FormControl>

          <FormControl>
            <Typography variant="subtitle1" gutterBottom>
              {t(tk.workflow.debate.your_position)}
            </Typography>
            <RadioGroup
              name="position"
              value={formData.position}
              onChange={handleChange}
              row
            >
              <FormControlLabel
                value="pro"
                control={<Radio />}
                label={t(tk.workflow.debate.pro)}
                disabled={isSubmitting}
              />
              <FormControlLabel
                value="con"
                control={<Radio />}
                label={t(tk.workflow.debate.con)}
                disabled={isSubmitting}
              />
            </RadioGroup>
          </FormControl>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="large"
              disabled={isSubmitting}
            >
              {isSubmitting ? t(tk.common.loading) : t(tk.workflow.debate.start)}
            </Button>
          </Box>
        </Stack>
      </Box>
    </WorkspaceArea>
  );
}
