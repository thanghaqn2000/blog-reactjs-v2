import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useUpload } from '@/hooks/useUpload';
import { FileImage, X } from 'lucide-react';
import React, { useState } from 'react';

interface ImageUploadProps {
  value?: string;
  onChange?: (url: string) => void;
  onRemove?: () => void;
  folder?: string;
  aspectRatio?: number;
  className?: string;
  disabled?: boolean;
  placeholder?: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  value,
  onChange,
  onRemove,
  folder = 'uploads',
  aspectRatio = 16 / 9,
  className = '',
  disabled = false,
  placeholder = 'Chọn ảnh'
}) => {
  const [preview, setPreview] = useState<string>(value || '');
  const [isUploading, setIsUploading] = useState(false);

  const { uploadFile, validateFile } = useUpload({
    folder,
    onSuccess: (fileUrl) => {
      setPreview(fileUrl);
      onChange?.(fileUrl);
    },
    onError: (error) => {
      console.error('Upload failed:', error);
    }
  });

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file
    if (!validateFile(file)) {
      return;
    }

    setIsUploading(true);

    try {
      // Preview image
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Upload file
      await uploadFile(file);
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = () => {
    setPreview('');
    onChange?.('');
    onRemove?.();
    const fileInput = document.getElementById('image-upload') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <Label>Ảnh</Label>
      
      {/* Preview */}
      <div className="mb-2">
        <AspectRatio ratio={aspectRatio} className="bg-muted overflow-hidden rounded-md border">
          {preview ? (
            <img 
              src={preview} 
              alt="Preview" 
              className="w-full h-full object-cover" 
            />
          ) : (
            <div className="flex items-center justify-center h-full w-full bg-muted">
              <FileImage className="h-10 w-10 text-muted-foreground" />
            </div>
          )}
        </AspectRatio>
      </div>

      {/* Upload Controls */}
      <div className="flex flex-wrap gap-2">
        <Button 
          variant="outline" 
          type="button"
          disabled={disabled || isUploading}
          onClick={() => document.getElementById('image-upload')?.click()}
          className="flex items-center gap-2"
        >
          <FileImage className="h-4 w-4" />
          {isUploading ? 'Đang upload...' : placeholder}
        </Button>
        
        <Input 
          id="image-upload"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
          disabled={disabled || isUploading}
        />
        
        {preview && (
          <Button 
            type="button"
            variant="outline" 
            size="sm"
            onClick={handleRemove}
            disabled={disabled || isUploading}
          >
            <X className="mr-2 h-4 w-4" />
            Xóa ảnh
          </Button>
        )}
      </div>
    </div>
  );
}; 
