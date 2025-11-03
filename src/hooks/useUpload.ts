import { showToast } from '@/config/toast.config';
import { UploadFileParams, uploadService } from '@/services/upload.service';
import { useState } from 'react';

interface UseUploadOptions {
  onSuccess?: (fileUrl: string) => void;
  onError?: (error: string) => void;
}

export const useUpload = (options: UseUploadOptions = {}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const uploadFile = async (file: File, fileName?: string): Promise<string | null> => {
    setIsUploading(true);
    setUploadProgress(0);

    try {
      const params: UploadFileParams = {
        file,
        fileName: fileName || `${Date.now()}_${file.name}`,
      };

      const fileUrl = await uploadService.uploadFile(params);
      
      setUploadProgress(100);
      options.onSuccess?.(fileUrl);
      showToast.success('Upload thành công!');
      
      return fileUrl;
    } catch (error) {
      console.error('Upload error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Upload thất bại';
      options.onError?.(errorMessage);
      showToast.error(errorMessage);
      return null;
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const uploadMultipleFiles = async (files: File[]): Promise<string[]> => {
    setIsUploading(true);
    setUploadProgress(0);

    try {
      const fileUrls = await uploadService.uploadMultipleFiles(files);
      
      setUploadProgress(100);
      showToast.success(`Upload thành công ${files.length} file!`);
      
      return fileUrls;
    } catch (error) {
      console.error('Upload error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Upload thất bại';
      options.onError?.(errorMessage);
      showToast.error(errorMessage);
      return [];
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const validateFile = (file: File, maxSize: number = 5 * 1024 * 1024): boolean => {
    // Kiểm tra kích thước file
    if (file.size > maxSize) {
      showToast.error(`File quá lớn. Kích thước tối đa: ${Math.round(maxSize / 1024 / 1024)}MB`);
      return false;
    }

    // Kiểm tra loại file (chỉ cho phép ảnh)
    if (!file.type.startsWith('image/')) {
      showToast.error('Chỉ cho phép upload file ảnh');
      return false;
    }

    return true;
  };

  return {
    uploadFile,
    uploadMultipleFiles,
    validateFile,
    isUploading,
    uploadProgress,
  };
}; 
