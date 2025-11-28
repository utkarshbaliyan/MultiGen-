
import { GoogleGenAI, Modality, GenerateContentResponse, Chat } from "@google/genai";

// Helper: Exponential Backoff Retry
async function withRetry<T>(
  operation: () => Promise<T>,
  retries = 3,
  initialDelay = 2000
): Promise<T> {
  let attempt = 0;
  while (true) {
    try {
      return await operation();
    } catch (error: any) {
      const msg = error.message || '';
      // Retry on 429 (Rate Limit), "Rate exceeded", or 503 (Service Unavailable)
      const isRateLimit = msg.includes('429') || msg.includes('Rate exceeded') || msg.includes('Resource has been exhausted');
      const isServerOverload = msg.includes('503') || msg.includes('Overloaded');
      
      if ((isRateLimit || isServerOverload) && attempt < retries) {
        const delay = initialDelay * Math.pow(2, attempt);
        console.warn(`API Error: "${msg}". Retrying in ${delay}ms... (Attempt ${attempt + 1}/${retries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        attempt++;
        continue;
      }
      throw error;
    }
  }
}

// Helper: Standardized Error Handler
const handleApiError = (error: any, defaultMessage: string): string => {
  console.error(defaultMessage, error);
  let msg = error.message || '';
  
  // Try to parse JSON error messages if they come in raw format
  try {
      const errorString = JSON.stringify(error);
      if (msg.trim().startsWith('{')) {
          const parsed = JSON.parse(msg);
          if (parsed.error && parsed.error.message) {
              msg = parsed.error.message;
          }
      } else if (error.error && error.error.message) {
          // Handle nested error object structure often returned by the SDK
          msg = error.error.message;
      }
  } catch (e) {
      // ignore parse error and use original msg
  }

  if (msg.includes('Rate exceeded') || msg.includes('429')) {
    return "Rate limit exceeded. Please wait a moment and try again.";
  }
  if (msg.includes('Quota exceeded')) {
    return "API Quota exceeded. Please check your billing or usage limits.";
  }
  if (msg.includes('SAFETY')) {
    return "The content generation was blocked due to safety settings.";
  }
  if (msg.includes('NOT_FOUND') || msg.includes('404')) {
    return "The requested model is not available for this API key. Please check your project settings.";
  }
  if (msg.includes('PERMISSION_DENIED') || msg.includes('403')) {
    return "Permission denied. Your API key may not have access to this model or project.";
  }
  
  // Return the default message with specific error details if available, but keep it clean
  return msg ? `${defaultMessage}: ${msg}` : defaultMessage;
};

// --- Chat Functions ---

export const createChatSession = (): Chat => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  return ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: "You are a helpful, knowledgeable, and friendly AI assistant inside the MultiGen platform. Keep answers concise but informative.",
    }
  });
};

export const sendChatMessage = async (chat: Chat, message: string): Promise<string> => {
  try {
    const response = await withRetry<GenerateContentResponse>(() => chat.sendMessage({
      message: message
    }));
    return response.text || "I didn't get that.";
  } catch (error) {
    return handleApiError(error, "Error sending message");
  }
};

export const generateText = async (prompt: string): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await withRetry<GenerateContentResponse>(() => ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Generate a highly readable, well-structured response in Markdown format.
      
      Formatting Rules:
      1. Use main headings (#) for the title, subheadings (##) for major sections, and (###) for details.
      2. Use bold text (**text**) for key terms and concepts.
      3. Use bullet points or numbered lists for clarity.
      4. Ensure there is a blank line between every paragraph and section for readability.
      5. Do not use '/**' comments or block comments for text explanations.
      
      Prompt: ${prompt}`,
    }));
    return response.text || "No text returned.";
  } catch (error) {
    return handleApiError(error, "An error occurred while generating text.");
  }
};

export const generateBlog = async (topic: string, title: string): Promise<string> => {
  const prompt = `Write a comprehensive, engaging, and well-structured blog post.
  Topic: ${topic}
  Title: ${title}
  
  Formatting Requirements:
  - Use a # Title at the very top.
  - Use ## Headings for main sections.
  - Use ### Subheadings for breakdown.
  - Use **bold** for emphasis.
  - Include a clear Introduction and Conclusion.
  - Ensure ample spacing between paragraphs.
  - strictly valid Markdown.`;
  
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await withRetry<GenerateContentResponse>(() => ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
    }));
    return response.text || "No content returned.";
  } catch (error) {
    return handleApiError(error, "An error occurred while generating the blog post.");
  }
};

export const generateImage = async (prompt: string, style: string = 'none'): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    let finalPrompt = prompt;
    if (style && style !== 'none') {
        finalPrompt = `${prompt}. Art Style: ${style}. High quality, detailed.`;
    }

    try {
        // Use gemini-2.5-flash-image directly to ensure wide compatibility and avoid 403 errors
        const response = await withRetry<GenerateContentResponse>(() => ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [{ text: finalPrompt }],
            },
            config: {
                responseModalities: [Modality.IMAGE],
                // gemini-2.5-flash-image supports aspectRatio but not imageSize in the same way as Pro
            },
        }));

        const candidate = response.candidates?.[0];
        if (!candidate) return "No candidates returned.";

        if (candidate.finishReason === 'SAFETY') {
            return "Image generation blocked due to safety settings.";
        }
        for (const part of candidate.content?.parts || []) {
            if (part.inlineData) {
                const base64ImageBytes: string = part.inlineData.data;
                const mimeType = part.inlineData.mimeType || 'image/png';
                return `data:${mimeType};base64,${base64ImageBytes}`;
            }
        }
        throw new Error("No image data returned from API.");

    } catch (error: any) {
        return handleApiError(error, "Generation failed");
    }
};

export const generateVideo = async (prompt: string): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Retry initiation
    let operation = await withRetry<any>(() => ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: prompt,
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: '16:9'
      }
    }));

    // Retry polling loop operations
    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 5000)); // Poll every 5 seconds
      operation = await withRetry<any>(() => ai.operations.getVideosOperation({ operation: operation }));
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (downloadLink) {
        return `${downloadLink}&key=${process.env.API_KEY}`;
    } else {
        throw new Error("Video generation completed, but no download link was found.");
    }
  } catch (error: any) {
    console.error("Error generating video:", error);
    
    // Specifically handle the 404 Not Found for Veo, which implies lack of access/billing
    const errMsg = error.message || JSON.stringify(error);
    if (errMsg.includes('Requested entity was not found') || errMsg.includes('404') || errMsg.includes('NOT_FOUND')) {
      return 'Video generation failed. This feature (Veo model) requires a paid Google Cloud Project with the "Vertex AI API" enabled. Please check your project billing and permissions.';
    }
    
    return handleApiError(error, "An error occurred while generating the video.");
  }
};

export const removeBackground = async (base64Image: string, mimeType: string): Promise<string> => {
    const prompt = "Remove the background from this image. Make the background transparent.";
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await withRetry<GenerateContentResponse>(() => ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [
                    { inlineData: { data: base64Image, mimeType: mimeType } },
                    { text: prompt },
                ],
            },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        }));
        
        const candidate = response.candidates?.[0];
        if (candidate?.finishReason === 'SAFETY') {
            return "Background removal blocked due to safety settings.";
        }

        for (const part of candidate?.content?.parts || []) {
            if (part.inlineData) {
                const base64ImageBytes: string = part.inlineData.data;
                const responseMimeType = part.inlineData.mimeType || 'image/png';
                return `data:${responseMimeType};base64,${base64ImageBytes}`;
            }
        }
        throw new Error("No image data returned from API.");
    } catch (error: any) {
        return handleApiError(error, "Error removing background");
    }
};

export const reviewResume = async (
  resumeInput: string | { data: string; mimeType: string }, 
  context?: string
): Promise<string> => {
  const systemPrompt = `You are a professional resume reviewer and career coach. Please provide constructive feedback on the provided resume.
  
  Formatting Rules:
  - Use ## Headings for sections (Summary, Experience, Skills).
  - Use bullet points for specific feedback items.
  - Use **bold** for highlighting corrections or keywords.
  - Ensure clear separation between sections.
  
  ${context ? `\nAdditional User Context/Requests: ${context}` : ''}`;

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    let parts: any[] = [];
    
    if (typeof resumeInput === 'string') {
       parts.push({ text: systemPrompt + "\n\nResume Content:\n" + resumeInput });
    } else {
       parts.push({ text: systemPrompt });
       parts.push({ inlineData: resumeInput });
    }

    const response = await withRetry<GenerateContentResponse>(() => ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: { parts },
    }));
    return response.text || "No feedback generated.";
  } catch (error) {
    return handleApiError(error, "An error occurred while reviewing the resume.");
  }
};

export const generateCode = async (language: string, description: string): Promise<string> => {
  const prompt = `Generate a code snippet in ${language} that performs the following task: ${description}.
  
  IMPORTANT INSTRUCTIONS:
  1. Provide ONLY the code. No explanatory text, no introduction, no conclusion.
  2. Do NOT use Markdown code blocks (no \`\`\` or \`\`\`${language}).
  3. Do NOT include any comments (no // or /* ... */). The code must be clean and ready to execute.
  4. If imports are needed, include them.`;
  
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await withRetry<GenerateContentResponse>(() => ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
    }));
    // Double check to remove markdown fences if the model ignores instructions
    return response.text ? response.text.replace(/```[\w]*\n/g, '').replace(/```/g, '').trim() : "No code generated.";
  } catch (error) {
    return handleApiError(error, "An error occurred while generating the code.");
  }
};

// --- Text to Speech Helper ---
function pcmToWav(pcmData: Uint8Array, sampleRate: number = 24000): string {
  const numChannels = 1;
  const byteRate = sampleRate * numChannels * 2; // 2 bytes per sample
  const blockAlign = numChannels * 2;
  const dataSize = pcmData.length;
  const fileSize = 36 + dataSize;

  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  // RIFF identifier
  writeString(view, 0, 'RIFF');
  // File size
  view.setUint32(4, fileSize, true);
  // WAVE type
  writeString(view, 8, 'WAVE');
  // fmt chunk identifier
  writeString(view, 12, 'fmt ');
  // fmt chunk length
  view.setUint32(16, 16, true);
  // Sample format (1 is PCM)
  view.setUint16(20, 1, true);
  // Channels
  view.setUint16(22, numChannels, true);
  // Sample rate
  view.setUint32(24, sampleRate, true);
  // Byte rate
  view.setUint32(28, byteRate, true);
  // Block align
  view.setUint16(32, blockAlign, true);
  // Bits per sample
  view.setUint16(34, 16, true);
  // Data chunk identifier
  writeString(view, 36, 'data');
  // Data chunk length
  view.setUint32(40, dataSize, true);

  // Write PCM data
  const pcmBytes = new Uint8Array(buffer, 44);
  pcmBytes.set(pcmData);

  const blob = new Blob([buffer], { type: 'audio/wav' });
  return URL.createObjectURL(blob);
}

function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

export const generateSpeech = async (text: string, voiceName: string = 'Kore'): Promise<string> => {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await withRetry<GenerateContentResponse>(() => ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: { parts: [{ text: text }] },
            config: {
                responseModalities: ['AUDIO'],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: voiceName },
                    },
                },
            },
        }));

        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        
        if (base64Audio) {
             const binaryString = atob(base64Audio);
             const len = binaryString.length;
             const bytes = new Uint8Array(len);
             for (let i = 0; i < len; i++) {
                 bytes[i] = binaryString.charCodeAt(i);
             }
             return pcmToWav(bytes, 24000);
        }
        
        throw new Error("No audio data returned");
    } catch (error) {
        console.error("Error generating speech:", error);
        throw error;
    }
};

export const transcribeAudio = async (audioBase64: string, mimeType: string): Promise<string> => {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await withRetry<GenerateContentResponse>(() => ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: {
                parts: [
                    { inlineData: { data: audioBase64, mimeType: mimeType } },
                    { text: "Please transcribe this audio file exactly as spoken. Do not add any commentary or introductory text. Just the transcription." }
                ]
            },
        }));
        return response.text || "No transcription available.";
    } catch (error) {
        return handleApiError(error, "An error occurred during transcription.");
    }
};

export const convertDocumentContent = async (input: string | { data: string; mimeType: string }): Promise<string> => {
  const prompt = `You are a professional document reconstruction AI.
  
  Task: Extract ALL content from the provided input (text, file, or image) and reconstruct it.
  Output Format: Valid HTML5 string (only body content, no <html> or <body> tags).
  
  Requirements:
  1. Preserve the structure (Headings as <h1>-<h6>, paragraphs as <p>, lists as <ul>/<ol>).
  2. Maintain strictly the content. Do not summarize.
  3. If there are tables, format them as HTML <table>.
  4. If the input is an image, perform OCR to extract text and layout.
  5. Do not include Markdown fences (no \`\`\`html).
  6. Ensure the HTML is clean and styled with basic inline CSS for readability (e.g., standard fonts, spacing).`;

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const parts = [];
    
    if (typeof input === 'string') {
        parts.push({ text: `Here is the content of the document:\n\n${input}` });
    } else {
        parts.push({ inlineData: input });
    }
    parts.push({ text: prompt });

    const response = await withRetry<GenerateContentResponse>(() => ai.models.generateContent({
      model: 'gemini-2.5-flash', 
      contents: { parts }
    }));
    
    return response.text ? response.text.replace(/```html/g, '').replace(/```/g, '').trim() : "";
  } catch (error) {
    console.error("Error converting document:", error);
    throw new Error("Failed to process the document. Please ensure the file is supported.");
  }
};
