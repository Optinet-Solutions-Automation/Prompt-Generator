import { useState, useCallback, useRef, useEffect } from 'react';
import {
  AppState,
  FormData,
  INITIAL_FORM_DATA,
  GeneratePromptResponse,
  PromptMetadata,
} from '@/types/prompt';

type FormErrors = Partial<Record<keyof FormData, string>>;

// Real API call to generate prompt via n8n webhook
async function generatePrompt(formData: FormData): Promise<GeneratePromptResponse> {
  const response = await fetch('/api/generate-prompt', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(formData),
  });

  if (!response.ok) {
    throw new Error('Failed to generate prompt');
  }

  return response.json();
}

// Real API call to save prompt via n8n webhook
async function savePrompt(
  formData: FormData,
  generatedPrompt: string,
  timestamp: string
): Promise<{ success: boolean; message: string }> {
  const response = await fetch('/api/save-prompt', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...formData,
      generated_prompt: generatedPrompt,
      timestamp,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to save prompt');
  }

  return response.json();
}

export function usePromptGenerator() {
  const [appState, setAppState] = useState<AppState>('FORM');
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA);
  const [errors, setErrors] = useState<FormErrors>({});
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [promptMetadata, setPromptMetadata] = useState<PromptMetadata | null>(null);
  const [processingTime, setProcessingTime] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [generatedTimestamp, setGeneratedTimestamp] = useState('');

  const timerRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  // Timer effect
  useEffect(() => {
    if (appState === 'PROCESSING') {
      startTimeRef.current = Date.now();
      timerRef.current = window.setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }, 100);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [appState]);

  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.brand) newErrors.brand = 'Please select a brand';
    if (!formData.spec_id) newErrors.spec_id = 'Please select a spec ID';
    if (!formData.theme.trim()) newErrors.theme = 'Please enter a theme';
    if (!formData.description.trim()) newErrors.description = 'Please enter a description';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleFieldChange = useCallback((field: keyof FormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  }, [errors]);

  const handleSubmit = useCallback(async () => {
    if (!validateForm()) return;

    setAppState('PROCESSING');
    setElapsedTime(0);
    setErrorMessage('');

    try {
      const startTime = Date.now();
      const response = await generatePrompt(formData);
      const endTime = Date.now();
      setGeneratedPrompt(response.prompt);
      setPromptMetadata(response.metadata);
      setProcessingTime((endTime - startTime) / 1000);
      setGeneratedTimestamp(new Date().toISOString());
      setAppState('RESULT');
    } catch (error) {
      console.error('Error generating prompt:', error);
      setErrorMessage('Something went wrong. Please try again.');
      setAppState('FORM');
    }
  }, [formData, validateForm]);

  const handleSave = useCallback(async () => {
    setAppState('SAVING');

    try {
      await savePrompt(formData, generatedPrompt, generatedTimestamp);
      setAppState('SAVED');
    } catch (error) {
      console.error('Error saving prompt:', error);
      setErrorMessage('Failed to save prompt. Please try again.');
      setAppState('RESULT');
    }
  }, [formData, generatedPrompt, generatedTimestamp]);

  const handleDontSave = useCallback(() => {
    setAppState('SAVED'); // Just hide the save buttons
  }, []);

  const handleGenerateAgain = useCallback(() => {
    // Keep form data, just regenerate
    handleSubmit();
  }, [handleSubmit]);

  const handleClearForm = useCallback(() => {
    setFormData(INITIAL_FORM_DATA);
    setErrors({});
    setGeneratedPrompt('');
    setPromptMetadata(null);
    setProcessingTime(0);
    setElapsedTime(0);
    setErrorMessage('');
    setGeneratedTimestamp('');
    setAppState('FORM');
  }, []);

  const handleGoBack = useCallback(() => {
    setErrorMessage('');
    setAppState('FORM');
  }, []);

  return {
    appState,
    formData,
    errors,
    generatedPrompt,
    promptMetadata,
    processingTime,
    elapsedTime,
    errorMessage,
    handleFieldChange,
    handleSubmit,
    handleSave,
    handleDontSave,
    handleGenerateAgain,
    handleClearForm,
    handleGoBack,
  };
}