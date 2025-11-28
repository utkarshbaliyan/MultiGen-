
import { Tool, ToolType } from './types';
import TextGenerator from './components/TextGenerator';
import BlogWriter from './components/BlogWriter';
import BackgroundRemover from './components/BackgroundRemover';
import ResumeBuilder from './components/ResumeBuilder';
import ImageGenerator from './components/ImageGenerator';
import CodeGenerator from './components/CodeGenerator';
import VideoGenerator from './components/VideoGenerator';
import TextToSpeech from './components/TextToSpeech';
import SpeechToText from './components/SpeechToText';
import DocumentConverter from './components/DocumentConverter';

// Icon components
const ChatIcon = ({ className = 'w-6 h-6' }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
);
const BlogIcon = ({ className = 'w-6 h-6' }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 12h6m-1 8h.01" /></svg>
);
const ImageIcon = ({ className = 'w-6 h-6' }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
);
const ResumeIcon = ({ className = 'w-6 h-6' }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
);
const CodeIcon = ({ className = 'w-6 h-6' }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
);
const VideoIcon = ({ className = 'w-6 h-6' }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
);
const SpeakerIcon = ({ className = 'w-6 h-6' }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 3.464a5 5 0 00-6.072 0L4.293 8.172A1 1 0 004 8.828v6.344a1 1 0 00.293.656l5.171 4.708a5 5 0 006.072 0l4.171-4.708A1 1 0 0020 15.172V8.828a1 1 0 00-.293-.656l-4.171-4.708z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v8" /></svg>
);
const MicIcon = ({ className = 'w-6 h-6' }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
);
const ConvertIcon = ({ className = 'w-6 h-6' }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
);


export const TOOLS: Tool[] = [
  {
    id: ToolType.TEXT_GENERATION,
    name: 'Chat',
    description: 'Engage in a continuous, helpful conversation with AI.',
    icon: ChatIcon,
    component: TextGenerator,
  },
  {
    id: ToolType.BLOG_WRITING,
    name: 'Blog Writer',
    description: 'Create engaging, long-form content for your blog.',
    icon: BlogIcon,
    component: BlogWriter,
  },
  {
    id: ToolType.IMAGE_GENERATOR,
    name: 'Image Generator',
    description: 'Turn your text prompts into stunning visuals.',
    icon: ImageIcon,
    component: ImageGenerator,
  },
  {
    id: ToolType.VIDEO_GENERATION,
    name: 'Video Generator',
    description: 'Create stunning videos from text prompts.',
    icon: VideoIcon,
    component: VideoGenerator,
  },
    {
    id: ToolType.BACKGROUND_REMOVER,
    name: 'Background Remover',
    description: 'Easily remove the background from any image.',
    icon: ImageIcon,
    component: BackgroundRemover,
  },
  {
    id: ToolType.TEXT_TO_SPEECH,
    name: 'Text to Speech',
    description: 'Convert your text into lifelike spoken audio.',
    icon: SpeakerIcon,
    component: TextToSpeech,
  },
  {
    id: ToolType.SPEECH_TO_TEXT,
    name: 'Speech to Text',
    description: 'Transcribe voice recordings into structured text.',
    icon: MicIcon,
    component: SpeechToText,
  },
  {
    id: ToolType.DOCUMENT_CONVERTER,
    name: 'Doc Converter',
    description: 'Convert Word to PDF and PDF to Word intelligently.',
    icon: ConvertIcon,
    component: DocumentConverter,
  },
  {
    id: ToolType.RESUME_BUILDER,
    name: 'Resume Reviewer',
    description: 'Get AI-powered feedback to improve your resume.',
    icon: ResumeIcon,
    component: ResumeBuilder,
  },
  {
    id: ToolType.CODE_GENERATION,
    name: 'Code Generator',
    description: 'Generate code snippets in various languages.',
    icon: CodeIcon,
    component: CodeGenerator,
  },
];
