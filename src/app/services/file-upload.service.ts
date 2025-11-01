import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { CrudService } from './crud.service';
import { NotificationService } from './notification.service';

export interface UploadConfig {
  maxFileSize: number; // in bytes
  allowedTypes: string[];
  maxFiles: number;
  chunkSize?: number; // for large file uploads
  enableCompression: boolean;
}

export interface UploadProgress {
  fileName: string;
  progress: number; // 0-100
  loaded: number;
  total: number;
  speed?: number; // bytes per second
  remainingTime?: number; // in seconds
}

export interface UploadResult {
  success: boolean;
  fileId?: string;
  fileName: string;
  fileUrl?: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: Date;
  error?: string;
}

export interface FileMetadata {
  id: string;
  name: string;
  originalName: string;
  size: number;
  mimeType: string;
  url: string;
  thumbnailUrl?: string;
  uploadedBy: string;
  uploadedAt: Date;
  category: 'menu_image' | 'receipt' | 'profile' | 'document' | 'report';
  entityId?: string; // ID of related entity (menu item, order, etc.)
  tags?: string[];
}

@Injectable({
  providedIn: 'root'
})
export class FileUploadService {

  private defaultConfig: UploadConfig = {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    maxFiles: 5,
    enableCompression: true
  };

  private uploadConfigs: { [key: string]: UploadConfig } = {
    menu_image: {
      maxFileSize: 5 * 1024 * 1024, // 5MB
      allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
      maxFiles: 1,
      enableCompression: true
    },
    receipt: {
      maxFileSize: 2 * 1024 * 1024, // 2MB
      allowedTypes: ['image/jpeg', 'image/png', 'application/pdf'],
      maxFiles: 1,
      enableCompression: false
    },
    profile: {
      maxFileSize: 2 * 1024 * 1024, // 2MB
      allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
      maxFiles: 1,
      enableCompression: true
    },
    document: {
      maxFileSize: 10 * 1024 * 1024, // 10MB
      allowedTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/csv'],
      maxFiles: 3,
      enableCompression: false
    },
    report: {
      maxFileSize: 50 * 1024 * 1024, // 50MB
      allowedTypes: ['application/pdf', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
      maxFiles: 1,
      enableCompression: false
    }
  };

  constructor(
    private crudService: CrudService,
    private notificationService: NotificationService
  ) { }

  // ===============================
  // FILE UPLOAD METHODS
  // ===============================

  /**
   * Upload single file with progress tracking
   */
  uploadFile(
    file: File,
    category: FileMetadata['category'],
    entityId?: string,
    onProgress?: (progress: UploadProgress) => void
  ): Observable<UploadResult> {
    // Validate file
    const validation = this.validateFile(file, category);
    if (!validation.isValid) {
      return throwError(() => new Error(validation.message));
    }

    // Prepare form data
    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', category);
    if (entityId) {
      formData.append('entityId', entityId);
    }

    // Add metadata
    const metadata = {
      originalName: file.name,
      size: file.size,
      mimeType: file.type,
      uploadedAt: new Date().toISOString()
    };
    formData.append('metadata', JSON.stringify(metadata));

    // Compress if enabled
    const config = this.getConfigForCategory(category);
    if (config.enableCompression && this.isImageFile(file)) {
      return new Observable<UploadResult>(observer => {
        this.compressImage(file).subscribe({
          next: (compressedFile) => {
            formData.set('file', compressedFile);
            this.performUpload(formData, file.name, onProgress).subscribe({
              next: (result) => {
                observer.next(result);
                observer.complete();
              },
              error: (error) => {
                // If compression fails, try uploading original file
                console.warn('Image compression failed, uploading original file:', error);
                formData.set('file', file);
                this.performUpload(formData, file.name, onProgress).subscribe({
                  next: (result) => {
                    observer.next(result);
                    observer.complete();
                  },
                  error: (uploadError) => observer.error(uploadError)
                });
              }
            });
          },
          error: (compressionError) => {
            // If compression fails, upload original file
            console.warn('Image compression failed, uploading original file:', compressionError);
            this.performUpload(formData, file.name, onProgress).subscribe({
              next: (result) => {
                observer.next(result);
                observer.complete();
              },
              error: (uploadError) => observer.error(uploadError)
            });
          }
        });
      });
    }

    return this.performUpload(formData, file.name, onProgress);
  }

  /**
   * Upload multiple files
   */
  uploadMultipleFiles(
    files: File[],
    category: FileMetadata['category'],
    entityId?: string,
    onProgress?: (fileName: string, progress: UploadProgress) => void
  ): Observable<UploadResult[]> {
    const config = this.getConfigForCategory(category);

    if (files.length > config.maxFiles) {
      return throwError(() => new Error(`Maximum ${config.maxFiles} files allowed`));
    }

    // Create an observable that emits an array of results
    return new Observable(observer => {
      const results: UploadResult[] = [];
      let completed = 0;
      const total = files.length;

      if (total === 0) {
        observer.next([]);
        observer.complete();
        return;
      }

      files.forEach((file, index) => {
        this.uploadFile(file, category, entityId, (progress) => {
          if (onProgress) {
            onProgress(file.name, progress);
          }
        }).subscribe({
          next: (result) => {
            results[index] = result;
            completed++;

            if (completed === total) {
              observer.next(results);
              observer.complete();
            }
          },
          error: (error) => {
            observer.error(error);
          }
        });
      });
    });
  }

  /**
   * Upload file with resume capability
   */
  uploadFileWithResume(
    file: File,
    category: FileMetadata['category'],
    entityId?: string
  ): Observable<UploadResult> {
    const config = this.getConfigForCategory(category);

    if (!config.chunkSize || file.size <= config.chunkSize) {
      // Small file, upload normally
      return this.uploadFile(file, category, entityId);
    }

    // Large file, implement chunked upload
    return this.uploadFileInChunks(file, category, config.chunkSize, entityId);
  }

  // ===============================
  // FILE MANAGEMENT METHODS
  // ===============================

  /**
   * Get file metadata
   */
  getFileMetadata(fileId: string): Observable<FileMetadata> {
    return this.crudService.getData(`files/${fileId}`).pipe(
      map((response: any) => {
        if (response.success && response.data) {
          return this.mapFileMetadata(response.data);
        }
        throw new Error(response.message || 'File not found');
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Get files by category and entity
   */
  getFilesByEntity(category: FileMetadata['category'], entityId: string): Observable<FileMetadata[]> {
    return this.crudService.getData('files', { category, entityId }).pipe(
      map((response: any) => {
        if (response.success && response.data) {
          return response.data.map((file: any) => this.mapFileMetadata(file));
        }
        return [];
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Delete file
   */
  deleteFile(fileId: string): Observable<boolean> {
    return this.crudService.deleteData('files', {}, fileId).pipe(
      map((response: any) => {
        if (response.success) {
          this.notificationService.success('Success', 'File deleted successfully');
          return true;
        }
        throw new Error(response.message || 'Failed to delete file');
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Update file metadata
   */
  updateFileMetadata(fileId: string, updates: Partial<FileMetadata>): Observable<FileMetadata> {
    return this.crudService.putData('files', updates, {}, fileId).pipe(
      map((response: any) => {
        if (response.success && response.data) {
          return this.mapFileMetadata(response.data);
        }
        throw new Error(response.message || 'Failed to update file metadata');
      }),
      catchError(this.handleError)
    );
  }

  // ===============================
  // IMAGE PROCESSING METHODS
  // ===============================

  /**
   * Compress image before upload
   */
  private compressImage(file: File, maxWidth: number = 1920, quality: number = 0.8): Observable<File> {
    return new Observable(observer => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img;
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now()
              });
              observer.next(compressedFile);
              observer.complete();
            } else {
              observer.error(new Error('Image compression failed'));
            }
          },
          file.type,
          quality
        );
      };

      img.onerror = () => observer.error(new Error('Image loading failed'));
      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * Generate thumbnail for image
   */
  generateThumbnail(file: File, size: number = 200): Observable<string> {
    return new Observable(observer => {
      if (!this.isImageFile(file)) {
        observer.error(new Error('File is not an image'));
        return;
      }

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        canvas.width = size;
        canvas.height = size;

        // Calculate aspect ratio
        const aspectRatio = img.width / img.height;
        let drawWidth, drawHeight, offsetX = 0, offsetY = 0;

        if (aspectRatio > 1) {
          drawWidth = size;
          drawHeight = size / aspectRatio;
          offsetY = (size - drawHeight) / 2;
        } else {
          drawHeight = size;
          drawWidth = size * aspectRatio;
          offsetX = (size - drawWidth) / 2;
        }

        ctx?.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);

        const thumbnailUrl = canvas.toDataURL('image/jpeg', 0.7);
        observer.next(thumbnailUrl);
        observer.complete();
      };

      img.onerror = () => observer.error(new Error('Thumbnail generation failed'));
      img.src = URL.createObjectURL(file);
    });
  }

  // ===============================
  // CHUNKED UPLOAD METHODS
  // ===============================

  private uploadFileInChunks(
    file: File,
    category: string,
    chunkSize: number,
    entityId?: string
  ): Observable<UploadResult> {
    return new Observable(observer => {
      const totalChunks = Math.ceil(file.size / chunkSize);
      let uploadedChunks = 0;
      const uploadId = this.generateUploadId();

      const uploadChunk = (chunkIndex: number): void => {
        const start = chunkIndex * chunkSize;
        const end = Math.min(start + chunkSize, file.size);
        const chunk = file.slice(start, end);

        const formData = new FormData();
        formData.append('chunk', chunk);
        formData.append('chunkIndex', chunkIndex.toString());
        formData.append('totalChunks', totalChunks.toString());
        formData.append('uploadId', uploadId);
        formData.append('fileName', file.name);
        formData.append('fileSize', file.size.toString());
        formData.append('mimeType', file.type);
        formData.append('category', category);
        if (entityId) {
          formData.append('entityId', entityId);
        }

        this.crudService.postData('files/chunked', formData).subscribe({
          next: (response: any) => {
            uploadedChunks++;
            const progress = (uploadedChunks / totalChunks) * 100;

            if (uploadedChunks === totalChunks) {
              // All chunks uploaded, finalize
              this.finalizeChunkedUpload(uploadId).subscribe({
                next: (finalResponse: any) => {
                  if (finalResponse.success) {
                    observer.next(this.mapUploadResult(finalResponse.data, file));
                    observer.complete();
                  } else {
                    observer.error(new Error(finalResponse.message));
                  }
                },
                error: (error) => observer.error(error)
              });
            } else {
              // Upload next chunk
              uploadChunk(chunkIndex + 1);
            }
          },
          error: (error) => observer.error(error)
        });
      };

      // Start uploading first chunk
      uploadChunk(0);
    });
  }

  private finalizeChunkedUpload(uploadId: string): Observable<any> {
    return this.crudService.postData('files/finalize', { uploadId });
  }

  // ===============================
  // VALIDATION METHODS
  // ===============================

  private validateFile(file: File, category: string): { isValid: boolean; message?: string } {
    const config = this.getConfigForCategory(category);

    // Check file size
    if (file.size > config.maxFileSize) {
      return {
        isValid: false,
        message: `File size exceeds maximum allowed size of ${this.formatFileSize(config.maxFileSize)}`
      };
    }

    // Check file type
    if (!config.allowedTypes.includes(file.type)) {
      return {
        isValid: false,
        message: `File type ${file.type} is not allowed. Allowed types: ${config.allowedTypes.join(', ')}`
      };
    }

    return { isValid: true };
  }

  private isImageFile(file: File): boolean {
    return file.type.startsWith('image/');
  }

  private getConfigForCategory(category: string): UploadConfig {
    return this.uploadConfigs[category] || this.defaultConfig;
  }

  // ===============================
  // UTILITY METHODS
  // ===============================

  private performUpload(
    formData: FormData,
    fileName: string,
    onProgress?: (progress: UploadProgress) => void
  ): Observable<UploadResult> {
    return this.crudService.uploadFile('files/upload', formData.get('file') as File, {
      category: formData.get('category') as string,
      entityId: formData.get('entityId') as string
    }).pipe(
      map((response: any) => {
        if (response.success && response.data) {
          const file = formData.get('file') as File;
          return this.mapUploadResult(response.data, file);
        }
        throw new Error(response.message || 'Upload failed');
      }),
      catchError(this.handleError)
    );
  }

  private mapUploadResult(data: any, originalFile: File): UploadResult {
    return {
      success: true,
      fileId: data.id,
      fileName: data.name || originalFile.name,
      fileUrl: data.url,
      fileSize: data.size || originalFile.size,
      mimeType: data.mimeType || originalFile.type,
      uploadedAt: new Date(data.uploadedAt || Date.now())
    };
  }

  private mapFileMetadata(data: any): FileMetadata {
    return {
      id: data.id,
      name: data.name,
      originalName: data.originalName,
      size: data.size,
      mimeType: data.mimeType,
      url: data.url,
      thumbnailUrl: data.thumbnailUrl,
      uploadedBy: data.uploadedBy,
      uploadedAt: new Date(data.uploadedAt),
      category: data.category,
      entityId: data.entityId,
      tags: data.tags
    };
  }

  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  private generateUploadId(): string {
    return `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private handleError = (error: any): Observable<never> => {
    console.error('File upload error:', error);
    this.notificationService.error('Upload Failed', error.message || 'File upload failed');
    return throwError(() => error);
  };
}