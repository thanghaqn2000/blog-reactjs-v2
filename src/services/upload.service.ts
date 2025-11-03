import { adminApi } from './axios';

export interface PresignedUrlResponse {
  presignedUrl: string;
  fileUrl: string;
  key: string;
}

export interface UploadFileParams {
  file: File;
  fileName?: string;
}

class UploadService {
  /**
   * Lấy presigned URL từ server
   */
  async getPresignedUrl(params: UploadFileParams): Promise<PresignedUrlResponse> {
    const { file, fileName } = params;
    const response = await adminApi.post('/posts/presign', {
      filename: fileName || file.name,
      content_type: file.type,
    }, {
      withCredentials: true,
    });
    return response.data;
  }

  /**
   * Upload file trực tiếp lên S3 sử dụng presigned URL
   */
  async uploadToS3(file: File, presignedUrl: string): Promise<void> {
    const response = await fetch(presignedUrl, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type,
      },
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }
  }

  /**
   * Upload file hoàn chỉnh: lấy presigned URL và upload lên S3
   */
  async uploadFile(params: UploadFileParams): Promise<string> {
    try {
      // Bước 1: Lấy presigned URL từ server
      const { presignedUrl, fileUrl } = await this.getPresignedUrl(params);
      
      // Bước 2: Upload file trực tiếp lên S3
      await this.uploadToS3(params.file, presignedUrl);
      
      // Bước 3: Trả về URL của file đã upload
      return fileUrl;
    } catch (error) {
      console.error('Upload error:', error);
      throw new Error('Upload failed');
    }
  }

  /**
   * Upload nhiều file cùng lúc
   */
  async uploadMultipleFiles(files: File[]): Promise<string[]> {
    const uploadPromises = files.map((file, index) => 
      this.uploadFile({ 
        file, 
        fileName: `${Date.now()}_${index}_${file.name}` 
      })
    );

    return Promise.all(uploadPromises);
  }
}

export const uploadService = new UploadService(); 
