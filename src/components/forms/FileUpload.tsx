import { useState, useCallback } from "react";
import { Upload, X, FileImage, File, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface FileUploadProps {
  label: string;
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // in bytes
  onFilesChange: (files: File[]) => void;
  value?: File[];
  required?: boolean;
  description?: string;
}

export const FileUpload = ({
  label,
  accept = "image/*",
  multiple = false,
  maxSize = 5 * 1024 * 1024, // 5MB default
  onFilesChange,
  value = [],
  required = false,
  description
}: FileUploadProps) => {
  const [dragActive, setDragActive] = useState(false);
  const { toast } = useToast();

  const validateFile = (file: File): boolean => {
    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: `File size must be less than ${(maxSize / (1024 * 1024)).toFixed(1)}MB`,
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const newFiles = Array.from(e.dataTransfer.files);
      const validFiles = newFiles.filter(validateFile);
      
      if (multiple) {
        onFilesChange([...value, ...validFiles]);
      } else {
        onFilesChange(validFiles.slice(0, 1));
      }
    }
  }, [value, multiple, onFilesChange, maxSize]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      const newFiles = Array.from(e.target.files);
      const validFiles = newFiles.filter(validateFile);
      
      if (multiple) {
        onFilesChange([...value, ...validFiles]);
      } else {
        onFilesChange(validFiles.slice(0, 1));
      }
    }
  };

  const removeFile = (index: number) => {
    const newFiles = value.filter((_, i) => i !== index);
    onFilesChange(newFiles);
  };

  const isImage = (file: File) => file.type.startsWith("image/");

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">
          {label} {required && <span className="text-destructive">*</span>}
        </label>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </div>

      <div
        className={`
          relative border-2 border-dashed rounded-lg p-6 transition-all duration-200 cursor-pointer
          ${dragActive 
            ? 'border-primary bg-primary/5' 
            : 'border-border hover:border-primary/50 hover:bg-accent/50'
          }
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => document.getElementById(`file-input-${label}`)?.click()}
      >
        <input
          id={`file-input-${label}`}
          type="file"
          className="hidden"
          accept={accept}
          multiple={multiple}
          onChange={handleChange}
        />
        
        <div className="text-center">
          <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-sm text-foreground mb-2">
            Click to upload or drag and drop
          </p>
          <p className="text-xs text-muted-foreground">
            {accept.includes("image") ? "PNG, JPG, GIF" : "PDF, DOC, DOCX"} up to {(maxSize / (1024 * 1024)).toFixed(1)}MB
          </p>
        </div>
      </div>

      {value.length > 0 && (
        <div className="space-y-2">
          {value.map((file, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-card rounded-lg border">
              <div className="flex items-center space-x-3">
                {isImage(file) ? (
                  <FileImage className="h-5 w-5 text-primary" />
                ) : (
                  <File className="h-5 w-5 text-primary" />
                )}
                <div>
                  <p className="text-sm font-medium text-foreground">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="h-4 w-4 text-success" />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(index);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};