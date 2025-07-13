
import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Upload, FileText, X, Check } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface ResumeUploadProps {
  onResumeUploaded: (file: File, extractedText: string) => void;
  uploadedFile?: File | null;
  onRemoveFile: () => void;
}

export const ResumeUpload = ({ onResumeUploaded, uploadedFile, onRemoveFile }: ResumeUploadProps) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    if (file.type !== 'application/pdf') {
      toast({
        title: "Invalid File Type",
        description: "Please upload a PDF resume file.",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      toast({
        title: "File Too Large",
        description: "Please upload a file smaller than 10MB.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      // For now, we'll use a placeholder text extraction
      // In a real implementation, you'd use a PDF text extraction library
      const extractedText = `Resume content from ${file.name}`;
      
      onResumeUploaded(file, extractedText);
      
      toast({
        title: "Resume Uploaded",
        description: "Your resume has been uploaded and is ready for optimization.",
      });
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "Failed to process the resume. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  if (uploadedFile) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="w-5 h-5 mr-2 text-green-600" />
            Resume Uploaded
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
            <div className="flex items-center">
              <Check className="w-5 h-5 text-green-600 mr-2" />
              <span className="text-sm font-medium">{uploadedFile.name}</span>
            </div>
            <Button
              onClick={onRemoveFile}
              variant="ghost"
              size="sm"
              className="text-red-600 hover:text-red-700"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Your resume is ready for AI optimization. Fill in the form below and click "Optimize with AI".
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Upload className="w-5 h-5 mr-2 text-blue-600" />
          Upload Your Resume
        </CardTitle>
        <CardDescription>
          Upload your current resume (PDF) to optimize it with AI
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragOver
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <div className="space-y-2">
            <p className="text-lg font-medium">
              {isProcessing ? 'Processing...' : 'Drop your resume here'}
            </p>
            <p className="text-sm text-gray-600">
              or click to browse files
            </p>
            <Button
              onClick={openFileDialog}
              disabled={isProcessing}
              className="mt-4"
            >
              {isProcessing ? 'Processing...' : 'Choose File'}
            </Button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            onChange={handleFileInput}
            className="hidden"
          />
        </div>
        <div className="mt-4 text-xs text-gray-500">
          <p>• Supported format: PDF</p>
          <p>• Maximum file size: 10MB</p>
        </div>
      </CardContent>
    </Card>
  );
};
