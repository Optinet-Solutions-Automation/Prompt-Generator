import { useState, useCallback, useRef, useEffect } from 'react';
import {
  AppState,
  FormData,
  INITIAL_FORM_DATA,
  GeneratePromptResponse,
} from '@/types/prompt';

type FormErrors = Partial<Record<keyof FormData, string>>;

// Mock API call - replace with real API when backend is ready
async function mockGeneratePrompt(formData: FormData): Promise<GeneratePromptResponse> {
  // Simulate API delay (2-5 seconds)
  const delay = 2000 + Math.random() * 3000;
  await new Promise((resolve) => setTimeout(resolve, delay));

  // Generate a mock prompt based on form data
  const prompt = `Create a stunning ${formData.image_type.toLowerCase()} image for ${formData.brand} with a ${formData.theme} theme. 

The image should capture: ${formData.description}

Style guidelines:
- Use vibrant, engaging colors that align with the ${formData.brand} brand identity
- Ensure the composition is balanced and eye-catching
- Optimize for ${formData.image_type === 'Email Visuals' ? 'email' : formData.image_type === 'Banners' ? 'banner' : 'web'} format
${formData.additional_instructions ? `\nAdditional requirements: ${formData.additional_instructions}` : ''}

Technical specifications for ${formData.llm_tool}:
- High resolution, professional quality
- Modern, clean aesthetic
- Brand-consistent visual language`;

  return {
    prompt,
    processing_time: delay / 1000,
    timestamp: new Date().toISOString(),
  };
}

async function mockSavePrompt(): Promise<{ success: boolean; message: string }> {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return { success: true, message: 'Saved successfully' };
}

export function usePromptGenerator() {
  const [appState, setAppState] = useState<AppState>('FORM');
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA);
  const [errors, setErrors] = useState<FormErrors>({});
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [processingTime, setProcessingTime] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');

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
    if (!formData.image_type) newErrors.image_type = 'Please select an image type';
    if (!formData.theme.trim()) newErrors.theme = 'Please enter a theme';
    if (!formData.description.trim()) newErrors.description = 'Please enter a description';
    if (!formData.llm_tool) newErrors.llm_tool = 'Please select an LLM tool';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleFieldChange = useCallback((field: keyof FormData, value: string) => {
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
      const response = await mockGeneratePrompt(formData);
      setGeneratedPrompt(response.prompt);
      setProcessingTime(response.processing_time);
      setAppState('RESULT');
    } catch {
      setErrorMessage('Something went wrong. Please try again.');
      setAppState('FORM');
    }
  }, [formData, validateForm]);

  const handleSave = useCallback(async () => {
    setAppState('SAVING');

    try {
      await mockSavePrompt();
      setAppState('SAVED');
    } catch {
      setErrorMessage('Failed to save prompt. Please try again.');
      setAppState('RESULT');
    }
  }, []);

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
    setProcessingTime(0);
    setElapsedTime(0);
    setErrorMessage('');
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
