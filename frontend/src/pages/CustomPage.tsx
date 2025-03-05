import React from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Stack,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControl,
  RadioGroup,
  Radio,
  FormControlLabel,
} from '@mui/material';
import { ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { WorkspaceArea } from '../components/WorkspaceArea';
import { useLanguage } from '../contexts/LanguageContext';
import type { CreateCustomWorkflowRequest } from '../types/api';
import { createCustomWorkflow } from '../services/workflow';

interface FormErrors {
  name?: string;
  template?: string;
  variables?: string;
}

interface FormData {
  name: string;
  template: string;
  variables: string;
  initialContent: string;
  inheritance: 'full' | 'last3' | 'chain';
  maxSteps: number;
}

const defaultValues: FormData = {
  name: '',
  template: '',
  variables: '',
  initialContent: '',
  inheritance: 'full',
  maxSteps: 10,
};

export default function CustomPage() {
  const { t, tk } = useLanguage();
  const navigate = useNavigate();
  const [formData, setFormData] = React.useState<FormData>(defaultValues);
  const [errors, setErrors] = React.useState<FormErrors>({});
  const [error, setError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'maxSteps' ? Number(value) : value,
    }));
    setErrors(prev => ({ ...prev, [name]: undefined }));
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    if (!formData.name.trim()) {
      newErrors.name = t(tk.errors.required);
      isValid = false;
    }

    if (!formData.template.trim()) {
      newErrors.template = t(tk.errors.required);
      isValid = false;
    }

    if (formData.variables) {
      try {
        JSON.parse(formData.variables);
      } catch (e) {
        newErrors.variables = t(tk.errors.invalid_json);
        isValid = false;
      }
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
      const request: CreateCustomWorkflowRequest = {
        type: 'custom',
        name: formData.name,
        template: formData.template,
        variables: formData.variables ? JSON.parse(formData.variables) : {},
        initialContent: formData.initialContent,
        settings: {
          inheritance: formData.inheritance,
          maxSteps: formData.maxSteps,
        },
      };

      const response = await createCustomWorkflow(request);

      if (response.success && response.data) {
        navigate(`/workspace/${response.data.sessionId}`);
      } else {
        setError(response.error || t(tk.errors.workflow_error));
      }
    } catch (err: any) {
      console.error('Failed to create custom workflow:', err);
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
            {t(tk.workflow.custom.description)}
          </Typography>

          {error && (
            <Alert severity="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          <TextField
            name="name"
            label={t(tk.workflow.custom.workflow_name)}
            variant="outlined"
            fullWidth
            value={formData.name}
            onChange={handleChange}
            error={!!errors.name}
            helperText={errors.name}
            disabled={isSubmitting}
          />

          <TextField
            name="template"
            label={t(tk.workflow.custom.prompt_template)}
            multiline
            rows={4}
            variant="outlined"
            fullWidth
            value={formData.template}
            onChange={handleChange}
            error={!!errors.template}
            helperText={errors.template}
            disabled={isSubmitting}
          />

          <TextField
            name="variables"
            label={t(tk.workflow.custom.prompt_variables)}
            multiline
            rows={2}
            variant="outlined"
            fullWidth
            value={formData.variables}
            onChange={handleChange}
            error={!!errors.variables}
            helperText={errors.variables}
            disabled={isSubmitting}
            placeholder='{"key": "value"}'
          />

          <TextField
            name="initialContent"
            label={t(tk.workflow.custom.initial_content)}
            multiline
            rows={2}
            variant="outlined"
            fullWidth
            value={formData.initialContent}
            onChange={handleChange}
            disabled={isSubmitting}
          />

          <Accordion disabled={isSubmitting}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>{t(tk.workflow.custom.advanced_settings)}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Stack spacing={3}>
                <FormControl>
                  <Typography variant="subtitle1" gutterBottom>
                    {t(tk.settings.inheritance.title)}
                  </Typography>
                  <RadioGroup
                    name="inheritance"
                    value={formData.inheritance}
                    onChange={handleChange}
                    row
                  >
                    <FormControlLabel
                      value="full"
                      control={<Radio />}
                      label={t(tk.settings.inheritance.full_history)}
                      disabled={isSubmitting}
                    />
                    <FormControlLabel
                      value="last3"
                      control={<Radio />}
                      label={t(tk.settings.inheritance.last_3_steps)}
                      disabled={isSubmitting}
                    />
                    <FormControlLabel
                      value="chain"
                      control={<Radio />}
                      label={t(tk.settings.inheritance.prompt_chain)}
                      disabled={isSubmitting}
                    />
                  </RadioGroup>
                </FormControl>

                <TextField
                  name="maxSteps"
                  type="number"
                  label={t(tk.settings.max_steps)}
                  variant="outlined"
                  fullWidth
                  value={formData.maxSteps}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  inputProps={{ min: 1, max: 100 }}
                />
              </Stack>
            </AccordionDetails>
          </Accordion>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="large"
              disabled={isSubmitting}
            >
              {isSubmitting ? t(tk.common.loading) : t(tk.workflow.custom.start)}
            </Button>
          </Box>
        </Stack>
      </Box>
    </WorkspaceArea>
  );
}
