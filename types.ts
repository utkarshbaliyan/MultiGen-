// Fix: Import ComponentType from react to resolve namespace error.
import type { ComponentType } from 'react';

export enum ToolType {
  TEXT_GENERATION = 'Text Generation',
  BLOG_WRITING = 'Blog Writing',
  BACKGROUND_REMOVER = 'Background Remover',
  RESUME_BUILDER = 'Resume Builder',
  IMAGE_GENERATOR = 'Image Generator',
  CODE_GENERATION = 'Code Generation',
  VIDEO_GENERATION = 'Video Generation',
  TEXT_TO_SPEECH = 'Text to Speech',
  SPEECH_TO_TEXT = 'Speech to Text',
  DOCUMENT_CONVERTER = 'Document Converter',
}

export interface HistoryItem {
  id: string;
  timestamp: string;
  prompt: string; // Can be text prompt, or input data for other tools
  result: string; // Can be text result, or a data URL for images/videos
}

// Fix: Use Partial<Record<...>> to allow the history object to be initialized as empty 
// and have properties added dynamically, which resolves the type error in App.tsx.
export type History = Partial<Record<ToolType, HistoryItem[]>>;

export interface Tool {
  id: ToolType;
  name: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
  component: ComponentType<{
    addToHistory: (itemData: Omit<HistoryItem, 'id' | 'timestamp'>) => void;
  }>;
}

export interface User {
  id: string;
  name: string;
  email: string;
}