import React, { useRef, useState } from 'react';
import { UploadCloud, FileText, CheckCircle2, X } from 'lucide-react';
import { cn } from '../../lib/utils.js';

interface FileUploaderProps {
  accept?: string;
  maxSizeMB?: number;
  onFileSelect?: (file: File) => void;
  className?: string;
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  accept = 'image/*,application/pdf',
  maxSizeMB = 5,
  onFileSelect,
  className,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`File size must be under ${maxSizeMB} MB`);
      return;
    }
    setError(null);
    setSelectedFile(file);
    onFileSelect?.(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleRemove = () => {
    setSelectedFile(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className={cn('w-full', className)}>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {!selectedFile ? (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={cn(
            'flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-[16px] cursor-pointer transition-colors text-center',
            dragActive
              ? 'border-primary-500 bg-primary-50/50'
              : 'border-slate-300 hover:border-slate-400 bg-slate-50/50',
          )}
        >
          <div className="mb-2 rounded-full bg-white p-3 text-primary-600 shadow-xs">
            <UploadCloud className="h-6 w-6" />
          </div>
          <p className="text-sm font-semibold text-slate-800">Click to upload or drag & drop</p>
          <p className="mt-1 text-xs text-slate-500">Max {maxSizeMB} MB (PDF, JPG, PNG)</p>
        </div>
      ) : (
        <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-[12px]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white rounded-md border border-slate-200 text-primary-600">
              <FileText className="h-5 w-5" />
            </div>
            <div className="text-left">
              <p className="text-xs font-bold text-slate-900 truncate max-w-[200px]">
                {selectedFile.name}
              </p>
              <p className="text-[11px] text-slate-400">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB • Ready
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            <button
              type="button"
              onClick={handleRemove}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-md cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {error && <p className="mt-1.5 text-xs text-red-500 font-medium">{error}</p>}
    </div>
  );
};
