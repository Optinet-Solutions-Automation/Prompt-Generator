// src/hooks/usePromptLibrary.ts

import { useState, useCallback, useEffect } from 'react';
import { 
  fetchLibraryPrompts, 
  createLibraryPrompt, 
  updateLibraryPrompt, 
  deleteLibraryPrompt,
  LibraryPrompt 
} from '@/api/prompt-library';
import { useToast } from '@/hooks/use-toast';

export function usePromptLibrary() {
  const [prompts, setPrompts] = useState<LibraryPrompt[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const refreshPrompts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchLibraryPrompts();
      setPrompts(data);
    } catch (error) {
      console.error('Failed to fetch library:', error);
      toast({
        title: "Error",
        description: "Could not load prompt library.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Initial load
  useEffect(() => {
    refreshPrompts();
  }, [refreshPrompts]);

  const addPrompt = async (data: Omit<LibraryPrompt, 'id'>) => {
    try {
      await createLibraryPrompt(data);
      toast({ title: "Success", description: "Prompt added to library." });
      refreshPrompts(); // Reload list
    } catch (error) {
      toast({ title: "Error", description: "Failed to add prompt.", variant: "destructive" });
      throw error;
    }
  };

  const editPrompt = async (id: string, data: Partial<Omit<LibraryPrompt, 'id'>>) => {
    try {
      await updateLibraryPrompt(id, data);
      toast({ title: "Success", description: "Prompt updated." });
      refreshPrompts();
    } catch (error) {
      toast({ title: "Error", description: "Failed to update prompt.", variant: "destructive" });
      throw error;
    }
  };

  const removePrompt = async (id: string) => {
    try {
      await deleteLibraryPrompt(id);
      toast({ title: "Success", description: "Prompt deleted." });
      refreshPrompts();
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete prompt.", variant: "destructive" });
      throw error;
    }
  };

  return {
    prompts,
    loading,
    refreshPrompts,
    addPrompt,
    editPrompt,
    removePrompt
  };
}