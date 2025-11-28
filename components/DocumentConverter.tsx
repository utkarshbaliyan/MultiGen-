
import React, { useState } from 'react';
import { convertDocumentContent } from '../services/geminiService';
import GlowingButton from './common/GlowingButton';

interface DocumentConverterProps {
  addToHistory: (itemData: { prompt: string; result: string }) => void;
}

const DocumentConverter: React.FC<DocumentConverterProps> = ({ addToHistory }) => {
  const [file, setFile] = useState<File | null>(null);
  const [targetFormat, setTargetFormat] = useState<'pdf' | 'docx'>('docx');
  const [isConverting, setIsConverting] = useState(false);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [error, setError] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setResultBlob(null);
      setError('');
      
      // Auto-detect target format
      // Default to DOCX for most things as it's editable, unless it's a PDF/Image where user might want OCR->Word
      if (selectedFile.type === 'application/pdf') {
        setTargetFormat('docx');
      } else if (
        selectedFile.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
        selectedFile.type === 'application/msword'
      ) {
        setTargetFormat('pdf');
      }
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(',')[1]);
      };
      reader.onerror = error => reject(error);
    });
  };

  const fileToText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsText(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
  };

  const handleConversion = async () => {
    if (!file) return;
    setIsConverting(true);
    setError('');
    setResultBlob(null);

    try {
        let input: string | { data: string; mimeType: string };

        // 1. Image handling (OCR)
        if (file.type.startsWith('image/')) {
            const base64 = await fileToBase64(file);
            input = { data: base64, mimeType: file.type };
        }
        // 2. PDF handling
        else if (file.type === 'application/pdf') {
             const base64 = await fileToBase64(file);
             input = { data: base64, mimeType: file.type };
        }
        // 3. Word handling (Mammoth)
        else if (file.name.match(/\.(docx|doc)$/i)) {
             const arrayBuffer = await file.arrayBuffer();
             
             // Dynamic import for mammoth
             let mammothInstance: any = null;
             try {
                 // @ts-ignore
                 await import('mammoth'); 
                 if ((window as any).mammoth) {
                     mammothInstance = (window as any).mammoth;
                 } else {
                     // @ts-ignore
                     const m = await import('mammoth');
                     mammothInstance = m.default || m;
                 }
             } catch (e) {
                 if ((window as any).mammoth) {
                     mammothInstance = (window as any).mammoth;
                 }
             }

             if (!mammothInstance || typeof mammothInstance.convertToHtml !== 'function') {
                 // Fallback: Try reading as simple text if mammoth fails, though unlikely to work well for binary doc
                 throw new Error("Document processor could not be loaded. Please refresh.");
             }

             const result = await mammothInstance.convertToHtml({ arrayBuffer });
             input = result.value;
        } 
        // 4. Text-based formats (TXT, MD, HTML, CSV, JSON, XML, RTF, etc.)
        else {
             // Treat as text
             input = await fileToText(file);
        }

        const htmlContent = await convertDocumentContent(input);

        if (targetFormat === 'docx') {
            // Generate DOCX
            const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' " +
                "xmlns:w='urn:schemas-microsoft-com:office:word' " +
                "xmlns='http://www.w3.org/TR/REC-html40'>" +
                "<head><meta charset='utf-8'><title>Export HTML to Word Document with JavaScript</title></head><body>";
            const footer = "</body></html>";
            const sourceHTML = header + htmlContent + footer;
            
            const blob = new Blob(['\ufeff', sourceHTML], {
                type: 'application/msword'
            });
            setResultBlob(blob);
        } else {
            // Generate PDF
            // @ts-ignore
            const jsPDFModule = await import('jspdf');
            const jsPDF = jsPDFModule.jsPDF || jsPDFModule.default;
            
            if (!jsPDF) throw new Error("Failed to load PDF generator.");

            const doc = new jsPDF();
            
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = htmlContent;
            tempDiv.style.width = '550px';
            tempDiv.style.padding = '20px';
            tempDiv.style.fontFamily = 'Arial, sans-serif';
            tempDiv.style.fontSize = '12px';
            tempDiv.className = 'prose';
            
            tempDiv.style.position = 'absolute';
            tempDiv.style.left = '-9999px';
            
            document.body.appendChild(tempDiv);

            await doc.html(tempDiv, {
                callback: (pdf: any) => {
                   setResultBlob(pdf.output('blob'));
                   document.body.removeChild(tempDiv);
                   setIsConverting(false);
                },
                x: 10,
                y: 10,
                width: 180,
                windowWidth: 600
            });
            
            return; 
        }
        
        addToHistory({ prompt: `Converted ${file.name} to .${targetFormat}`, result: "Success" });

    } catch (err: any) {
        console.error(err);
        setError(err.message || "Conversion failed. Please ensure the file is supported.");
    } finally {
        if (targetFormat === 'docx') {
            setIsConverting(false);
        }
    }
  };

  const handleDownload = () => {
    if (!resultBlob || !file) return;
    const url = URL.createObjectURL(resultBlob);
    const a = document.createElement('a');
    // Keep original name but change extension
    const fileName = file.name.substring(0, file.name.lastIndexOf('.')) + '.' + targetFormat;
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const removeFile = () => {
    setFile(null);
    setResultBlob(null);
    setError('');
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-gray-400">Convert almost any file format to PDF or Word using AI reconstruction.</p>
      </div>

      <div className="max-w-2xl mx-auto">
        {/* Upload Area */}
        <div className={`relative p-8 border-2 border-dashed rounded-xl transition-all duration-300 text-center cursor-pointer group
            ${file ? 'border-purple-500 bg-purple-900/10' : 'border-gray-700 bg-gray-900 hover:border-purple-500 hover:bg-gray-800'}`}
        >
             <input
                type="file"
                // Extensive accept list
                accept=".pdf,.docx,.doc,.txt,.md,.html,.htm,.csv,.json,.xml,.rtf,.jpg,.jpeg,.png,.webp"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                disabled={isConverting}
            />
            
            {file ? (
                <div className="flex flex-col items-center justify-center space-y-3">
                    <div className="w-16 h-16 bg-purple-600/20 rounded-full flex items-center justify-center text-purple-400">
                         {file.type.startsWith('image/') ? (
                             <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                             </svg>
                         ) : (
                             <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                         )}
                    </div>
                    <div>
                        <p className="text-lg font-medium text-white">{file.name}</p>
                        <p className="text-sm text-gray-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                    <button 
                        onClick={(e) => { e.stopPropagation(); removeFile(); }}
                        className="px-3 py-1 text-xs bg-gray-800 hover:bg-red-900/50 text-red-400 rounded-full border border-gray-700 hover:border-red-500/50 transition-colors z-20"
                    >
                        Remove File
                    </button>
                </div>
            ) : (
                <div className="flex flex-col items-center text-gray-500 group-hover:text-purple-400 transition-colors py-6">
                    <svg className="w-12 h-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                    <p className="font-medium text-lg mb-1">Drop file here</p>
                    <p className="text-sm opacity-70">PDF, Docs, Text, Code, Images (OCR)</p>
                </div>
            )}
        </div>

        {/* Controls */}
        {file && (
            <div className="mt-6 p-6 bg-gray-900 border border-gray-800 rounded-xl space-y-6 animate-fade-in">
                <div className="flex items-center justify-between">
                    <span className="text-gray-400">Convert to:</span>
                    <div className="flex space-x-2 bg-gray-800 p-1 rounded-lg">
                        <button 
                            onClick={() => setTargetFormat('docx')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${targetFormat === 'docx' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'}`}
                        >
                            Word (.docx)
                        </button>
                        <button 
                            onClick={() => setTargetFormat('pdf')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${targetFormat === 'pdf' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'}`}
                        >
                            PDF (.pdf)
                        </button>
                    </div>
                </div>

                {!resultBlob && (
                    <GlowingButton onClick={handleConversion} isLoading={isConverting} className="w-full">
                        {isConverting ? 'Processing Document...' : `Convert to ${targetFormat.toUpperCase()}`}
                    </GlowingButton>
                )}
                
                {error && <p className="text-red-500 text-center">{error}</p>}

                {resultBlob && (
                    <div className="text-center space-y-4">
                        <div className="p-4 bg-green-900/20 border border-green-500/30 rounded-lg text-green-400 flex items-center justify-center space-x-2">
                             <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span>Conversion Complete!</span>
                        </div>
                        <GlowingButton onClick={handleDownload} className="w-full !bg-green-600 !border-green-500">
                            Download {targetFormat.toUpperCase()}
                        </GlowingButton>
                        <button onClick={() => setResultBlob(null)} className="text-sm text-gray-500 hover:text-white underline">
                            Convert another way
                        </button>
                    </div>
                )}
            </div>
        )}
      </div>
      
      <div className="mt-10 p-4 bg-gray-900/50 border border-gray-800 rounded-lg text-sm text-gray-400">
          <h3 className="font-semibold text-gray-300 mb-2">Supported Formats:</h3>
          <p>
              <span className="text-purple-400">Documents:</span> PDF, Word (DOC/DOCX), RTF<br/>
              <span className="text-purple-400">Data & Code:</span> TXT, Markdown, HTML, CSV, JSON, XML<br/>
              <span className="text-purple-400">Images (OCR):</span> JPG, PNG, WEBP
          </p>
      </div>
    </div>
  );
};

export default DocumentConverter;
