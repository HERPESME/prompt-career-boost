
import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, FileText, X, Check, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import * as pdfjsLib from "pdfjs-dist";

// Use inline worker (no CDN dependency)
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.mjs',
  import.meta.url
).toString();

interface ResumeUploadProps {
  onResumeUploaded: (file: File, extractedText: string) => void;
  uploadedFile?: File | null;
  onRemoveFile: () => void;
  isProcessing?: boolean;
}

async function extractTextFromPDF(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    
    let fullText = "";
    
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(" ");
      fullText += pageText + "\n";
    }
    
    return fullText.trim();
  } catch (error) {
    console.error("PDF.js extraction failed:", error);
    throw error;
  }
}

export const ResumeUpload = ({ 
  onResumeUploaded, 
  uploadedFile, 
  onRemoveFile,
  isProcessing: externalProcessing = false 
}: ResumeUploadProps) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isProcessing = isExtracting || externalProcessing;

  const handleFileSelect = async (file: File) => {
    if (file.type !== 'application/pdf') {
      toast({
        title: "Invalid File Type",
        description: "Please upload a PDF resume file.",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please upload a file smaller than 10MB.",
        variant: "destructive",
      });
      return;
    }

    setIsExtracting(true);
    try {
      const extractedText = await extractTextFromPDF(file);
      
      if (!extractedText || extractedText.length < 50) {
        toast({
          title: "Could Not Extract Text",
          description: "The PDF may be image-based or encrypted. Please use a text-based PDF.",
          variant: "destructive",
        });
        setIsExtracting(false);
        return;
      }
      
      console.log("✅ Extracted text length:", extractedText.length);
      onResumeUploaded(file, extractedText);
      
      toast({
        title: "Resume Uploaded",
        description: "Parsing your resume with AI...",
      });
    } catch (error) {
      console.error("PDF extraction error:", error);
      toast({
        title: "Upload Failed",
        description: "Could not read PDF. Please try a different file.",
        variant: "destructive",
      });
    } finally {
      setIsExtracting(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) handleFileSelect(files[0]);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => setIsDragOver(false);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) handleFileSelect(files[0]);
  };

  const openFileDialog = () => fileInputRef.current?.click();

  if (uploadedFile) {
    return (
      <Card className="border-slate-200">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center text-slate-800">
            <FileText className="w-5 h-5 mr-2 text-green-600" />
            Resume Uploaded
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center min-w-0">
              <Check className="w-5 h-5 text-green-600 mr-2 flex-shrink-0" />
              <span className="text-sm font-medium truncate">{uploadedFile.name}</span>
            </div>
            <Button
              onClick={onRemoveFile}
              variant="ghost"
              size="sm"
              className="text-red-600 hover:text-red-700 flex-shrink-0 ml-2"
              disabled={isProcessing}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          {externalProcessing && (
            <div className="flex items-center gap-2 mt-3 text-sm text-indigo-600">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>AI is parsing your resume...</span>
            </div>
          )}
          
          {!externalProcessing && (
            <p className="text-sm text-slate-600 mt-3">
              ✓ Resume parsed! Review the fields and add your job description.
            </p>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-slate-200">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center text-slate-800">
          <Upload className="w-5 h-5 mr-2 text-indigo-600" />
          Upload Your Resume
        </CardTitle>
        <CardDescription>PDF only - auto-fills the form</CardDescription>
      </CardHeader>
      <CardContent>
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
            isDragOver ? 'border-indigo-500 bg-indigo-50' : 'border-slate-300 hover:border-indigo-400'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={openFileDialog}
        >
          {isProcessing ? (
            <Loader2 className="w-10 h-10 text-indigo-500 mx-auto mb-3 animate-spin" />
          ) : (
            <Upload className="w-10 h-10 text-slate-400 mx-auto mb-3" />
          )}
          <p className="text-sm font-medium text-slate-700">
            {isProcessing ? 'Extracting text...' : 'Drop resume or click to browse'}
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            onChange={handleFileInput}
            className="hidden"
          />
        </div>
      </CardContent>
    </Card>
  );
};
