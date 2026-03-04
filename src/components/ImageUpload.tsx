import React, { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, X } from 'lucide-react';

interface ImageUploadProps {
  onUpload: (base64: string) => void;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({ onUpload }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      onUpload(base64);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFile(file);
      }}
      onClick={() => fileInputRef.current?.click()}
      className={`
        relative h-64 border-2 border-dashed rounded-2xl transition-all cursor-pointer
        flex flex-col items-center justify-center gap-4
        ${isDragging ? 'border-indigo-500 bg-indigo-50/50' : 'border-zinc-300 hover:border-zinc-400 bg-zinc-50'}
      `}
    >
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
        accept="image/*"
      />
      <div className="p-4 bg-white rounded-full shadow-sm">
        <Upload className="w-8 h-8 text-indigo-600" />
      </div>
      <div className="text-center">
        <p className="text-zinc-900 font-medium">点击或拖拽上传海报</p>
        <p className="text-zinc-500 text-sm mt-1">支持 PNG, JPG, WebP 格式</p>
      </div>
    </div>
  );
};
