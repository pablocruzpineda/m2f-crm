/**
 * @module shared/ui
 * @description Reusable image upload component with drag-and-drop
 */

import { useRef, useState } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { Button } from './button';
import { cn } from '../lib/utils';

interface ImageUploadProps {
  currentImage?: string | null;
  onUpload: (file: File) => void;
  onRemove?: () => void;
  maxSize?: number; // in bytes
  acceptedFormats?: string[];
  isLoading?: boolean;
  label?: string;
  className?: string;
}

const DEFAULT_ACCEPTED_FORMATS = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml'];
const DEFAULT_MAX_SIZE = 2 * 1024 * 1024; // 2MB

export function ImageUpload({
  currentImage,
  onUpload,
  onRemove,
  maxSize = DEFAULT_MAX_SIZE,
  acceptedFormats = DEFAULT_ACCEPTED_FORMATS,
  isLoading = false,
  label = 'Upload Image',
  className,
}: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > maxSize) {
      const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(1);
      return `File size must be less than ${maxSizeMB}MB`;
    }

    // Check file type
    if (!acceptedFormats.includes(file.type)) {
      const formats = acceptedFormats.map(f => f.split('/')[1]?.toUpperCase() || f).join(', ');
      return `File must be one of: ${formats}`;
    }

    return null;
  };

  const handleFileSelect = (file: File) => {
    const validationError = validateFile(file);
    
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    onUpload(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemove = () => {
    setError(null);
    onRemove?.();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(1);
  const formats = acceptedFormats.map(f => f.split('/')[1]?.toUpperCase() || f).join(', ');

  return (
    <div className={cn('space-y-4', className)}>
      {/* Current Image Preview */}
      {currentImage && (
        <div className="relative inline-block">
          <img
            src={currentImage}
            alt="Current logo"
            className="h-24 w-auto max-w-xs rounded-lg border border-border object-contain bg-muted"
          />
          {onRemove && !isLoading && (
            <Button
              variant="destructive"
              size="icon"
              className="absolute -right-2 -top-2 h-6 w-6 rounded-full"
              onClick={handleRemove}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      )}

      {/* Upload Area */}
      <div
        className={cn(
          'relative rounded-lg border-2 border-dashed p-8 transition-colors',
          isDragging ? 'border-primary bg-primary/5' : 'border-border',
          isLoading && 'pointer-events-none opacity-50'
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedFormats.join(',')}
          onChange={handleFileInputChange}
          className="hidden"
          disabled={isLoading}
        />

        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="rounded-full bg-muted p-4">
            {isLoading ? (
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            ) : (
              <ImageIcon className="h-8 w-8 text-muted-foreground" />
            )}
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">
              {isLoading ? 'Uploading...' : label}
            </p>
            <p className="text-xs text-muted-foreground">
              Drag and drop or click to browse
            </p>
            <p className="text-xs text-muted-foreground">
              {formats} • Max {maxSizeMB}MB
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleClick}
            disabled={isLoading}
            type="button"
          >
            <Upload className="mr-2 h-4 w-4" />
            Choose File
          </Button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}
    </div>
  );
}
