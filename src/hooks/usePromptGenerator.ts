import { useState, useCallback, useRef, useEffect } from 'react';
import {
  AppState,
  FormData,
  INITIAL_FORM_DATA,
  GeneratePromptResponse,
  PromptMetadata,
  BRAND_REFERENCES,
} from '@/types/prompt';
import { savePrompt } from '@/api/save-prompt';
import { generateImage, GenerateImageResponse } from '@/api/generate-image';
import { editImage } from '@/api/edit-image';
import { useToast } from '@/hooks/use-toast';

type FormErrors = Partial<Record<keyof FormData, string>>;

// Helper to get reference prompt_name from ID (format: "Label — Description")
function getReferencePromptName(brand: string, referenceId: string): string {
  const references = BRAND_REFERENCES[brand] || [];
  const ref = references.find(r => r.id === referenceId);
  return ref ? `${ref.label} — ${ref.description}` : referenceId;
}

// API call to generate prompt via n8n webhook
async function generatePrompt(formData: FormData): Promise<GeneratePromptResponse> {
  // Transform reference ID to description for API
  const apiData = {
    brand: formData.brand,
    reference: getReferencePromptName(formData.brand, formData.reference),
    subjectPosition: formData.subjectPosition,
    aspectRatio: formData.aspectRatio,
    theme: formData.theme,
    description: formData.description,
    format_layout: formData.format_layout,
    primary_object: formData.primary_object,
    subject: formData.subject,
    lighting: formData.lighting,
    mood: formData.mood,
    background: formData.background,
    positive_prompt: formData.positive_prompt,
    negative_prompt: formData.negative_prompt,
  };

  const response = await fetch('/api/generate-prompt', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(apiData),
  });

  if (!response.ok) {
    throw new Error('Failed to generate prompt');
  }

  return response.json();
}

export type GeneratedImage = {
  displayUrl: string;
  editUrl: string;
  referenceLabel: string;
  provider: 'chatgpt' | 'gemini';
  generatedBrand: string;
};

export type GeneratedImages = { 
  chatgpt: GeneratedImage[]; 
  gemini: GeneratedImage[] 
};

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
  
  const [generatedImages, setGeneratedImages] = useState<GeneratedImages>({ chatgpt: [], gemini: [] });
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isRegeneratingPrompt, setIsRegeneratingPrompt] = useState(false);
  
  const { toast } = useToast();
  const timerRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  // Timer effect
  useEffect(() => {
    if (appState === 'PROCESSING' || isGeneratingImage) {
      if (!timerRef.current) {
        startTimeRef.current = Date.now();
        timerRef.current = window.setInterval(() => {
          setElapsedTime(Math.floor((Date.now() - startTimeRef.current) / 1000));
        }, 100);
      }
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
  }, [appState, isGeneratingImage]);

  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.brand) newErrors.brand = 'Please select a brand';
    if (!formData.reference) newErrors.reference = 'Please select a reference';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleFieldChange = useCallback((field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
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

  // Restored handleGenerateImage logic
  const handleGenerateImage = useCallback(async (provider: 'chatgpt' | 'gemini', prompt?: string) => {
    if (!promptMetadata && !prompt) return;
    
    setIsGeneratingImage(true);
    setErrorMessage('');
    
    try {
      // Use provided prompt or fall back to state
      const promptText = prompt || generatedPrompt;
      
      const response = await generateImage({
        prompt: promptText,
        provider,
        aspectRatio: promptMetadata?.aspectRatio || '1:1',
      });
      
      const newImage: GeneratedImage = {
        displayUrl: response.displayUrl,
        editUrl: response.editUrl || '',
        referenceLabel: promptMetadata?.reference ? getReferencePromptName(promptMetadata.brand, promptMetadata.reference) : 'Unknown',
        provider,
        generatedBrand: promptMetadata?.brand || 'No Brand'
      };
      
      setGeneratedImages(prev => ({
        ...prev,
        [provider]: [...prev[provider], newImage]
      }));
      
    } catch (error) {
      console.error(`Error generating image with ${provider}:`, error);
      setErrorMessage(`Failed to generate image with ${provider}. Please try again.`);
    } finally {
      setIsGeneratingImage(false);
    }
  }, [generatedPrompt, promptMetadata]);

  // Restored handleEditImage logic (placeholder if you use it)
  const handleEditImage = useCallback(async (imageUrl: string, prompt: string) => {
    // Implementation depends on your edit-image.ts API
    try {
        await editImage({ imageUrl, prompt });
        toast({ title: "Success", description: "Image edit request sent." });
    } catch (error) {
        console.error('Error editing image:', error);
        toast({ title: "Error", description: "Failed to edit image.", variant: "destructive" });
    }
  }, [toast]);

  // New Save Handler with Title support
  const handleSave = useCallback(async (title: string, promptToSave: string) => {
    if (!promptMetadata) return;

    setAppState('SAVING');

    try {
      await savePrompt({
        brand: promptMetadata.brand,
        title: title,
        reference: promptMetadata.reference,
        saved_prompt: promptToSave,
      });
      
      setAppState('SAVED');
      
      toast({
        title: "Success",
        description: "Prompt saved successfully.",
      });

      setTimeout(() => {
        setAppState('RESULT');
      }, 2000);

    } catch (error) {
      console.error('Error saving prompt:', error);
      setErrorMessage('Failed to save prompt. Please try again.');
      setAppState('RESULT');
      toast({
        title: "Error",
        description: "Failed to save prompt.",
        variant: "destructive",
      });
    }
  }, [promptMetadata, toast]);

  const handleDontSave = useCallback(() => {
    setAppState('SAVED');
  }, []);

  const handleGenerateAgain = useCallback(async () => {
    if (promptMetadata) {
      setIsRegeneratingPrompt(true);
      setErrorMessage('');

      try {
        const startTime = Date.now();
        const response = await fetch('/api/generate-prompt', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(promptMetadata),
        });

        if (!response.ok) throw new Error('Failed to generate prompt');

        const data = await response.json();
        const endTime = Date.now();
        setGeneratedPrompt(data.prompt);
        setPromptMetadata(data.metadata);
        setProcessingTime((endTime - startTime) / 1000);
        setGeneratedTimestamp(new Date().toISOString());
      } catch (error) {
        console.error('Error generating prompt:', error);
        setErrorMessage('Something went wrong. Please try again.');
      } finally {
        setIsRegeneratingPrompt(false);
      }
    } else {
      handleSubmit();
    }
  }, [promptMetadata, handleSubmit]);

  const handleAddGeneratedImage = useCallback((provider: 'chatgpt' | 'gemini', image: { displayUrl: string; editUrl: string; referenceLabel: string; generatedBrand: string }) => {
    setGeneratedImages(prev => ({
      ...prev,
      [provider]: [...prev[provider], { ...image, provider }]
    }));
  }, []);

  const handleRemoveGeneratedImage = useCallback((provider: 'chatgpt' | 'gemini', index: number) => {
    setGeneratedImages(prev => ({
      ...prev,
      [provider]: prev[provider].filter((_, i) => i !== index)
    }));
  }, []);

  const handlePromptChange = useCallback((newPrompt: string) => {
    setGeneratedPrompt(newPrompt);
  }, []);

  const handleMetadataChange = useCallback((field: keyof PromptMetadata, value: string) => {
    setPromptMetadata((prev) => prev ? { ...prev, [field]: value } : null);
  }, []);

  const handleClearForm = useCallback(() => {
    setFormData(INITIAL_FORM_DATA);
    setErrors({});
    setGeneratedPrompt('');
    setPromptMetadata(null);
    setProcessingTime(0);
    setElapsedTime(0);
    setErrorMessage('');
    setGeneratedTimestamp('');
    setGeneratedImages({ chatgpt: [], gemini: [] });
    setAppState('FORM');
  }, []);

  const handleGoBack = useCallback(() => {
    setErrorMessage('');
    setAppState('FORM');
  }, []);

  const handleEditForm = useCallback(() => {
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
    generatedImages,
    isGeneratingImage,
    isRegeneratingPrompt,
    handleFieldChange,
    handleSubmit,
    handleSave,
    handleDontSave,
    handleEditForm,
    handleGenerateAgain,
    handleGenerateImage,
    handleEditImage,
    handleClearForm,
    handleGoBack,
    handlePromptChange,
    handleMetadataChange,
    handleAddGeneratedImage,
    handleRemoveGeneratedImage,
  };
}
