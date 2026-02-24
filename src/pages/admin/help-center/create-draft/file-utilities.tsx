// FileUtils.tsx
export interface FileValidationResult {
  valid: boolean;
  message: string;
}

// Enhanced MIME type mapping to include video and PDF formats
export function getMimeType(fileExtension: string | undefined): string {
  const mimeTypes: { [key: string]: string } = {
    // Image formats
    png: 'image/png',
    jpeg: 'image/jpeg',
    jpg: 'image/jpeg',
    gif: 'image/gif',
    svg: 'image/svg+xml',
    webp: 'image/webp',
    bmp: 'image/bmp',
    tiff: 'image/tiff',
    tif: 'image/tiff',
    // PDF format
    pdf: 'application/pdf',
    // Video formats
    mp4: 'video/mp4',
    webm: 'video/webm',
    ogg: 'video/ogg',
    mov: 'video/quicktime',
    avi: 'video/x-msvideo',
    wmv: 'video/x-ms-wmv',
    flv: 'video/x-flv',
    mkv: 'video/x-matroska',
  };
  return fileExtension
    ? mimeTypes[fileExtension.toLowerCase()] || 'application/octet-stream'
    : 'application/octet-stream';
}

// Get file type category based on MIME type
export function getFileCategory(mimeType: string): 'image' | 'video' | 'pdf' | 'other' {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType === 'application/pdf') return 'pdf';
  return 'other';
}

// Validate file size based on file type
export function validateFileSize(file: File): FileValidationResult {
  const fileSizeInMB = file.size / (1024 * 1024);
  const fileExt = file.name.split('.').pop()?.toLowerCase() || '';
  const mimeType = getMimeType(fileExt);
  const fileCategory = getFileCategory(mimeType);

  // Define size limits in MB for different file types
  const sizeLimit = {
    image: 5,
    video: 50,
    pdf: 10,
    other: 5,
  };

  const limit = sizeLimit[fileCategory];

  if (fileSizeInMB > limit) {
    return {
      valid: false,
      message: `${fileCategory.charAt(0).toUpperCase() + fileCategory.slice(1)} size should not exceed ${limit} MB`,
    };
  }

  return { valid: true, message: '' };
}

// Check if file extension is allowed
export function isFileTypeAllowed(fileExtension: string | undefined): boolean {
  if (!fileExtension) return false;

  const allowedExtensions = [
    'png',
    'jpeg',
    'jpg',
    'gif',
    'svg',
    'webp',
    'bmp',
    'tiff',
    'tif',
    'pdf',
    'mp4',
    'webm',
    'ogg',
    'mov',
    'avi',
    'wmv',
    'flv',
    'mkv',
  ];

  return allowedExtensions.includes(fileExtension.toLowerCase());
}

// Upload to S3
export async function uploadToS3(file: File, presignedURL: string, mimeType: string): Promise<boolean> {
  try {
    const fileData = await file.arrayBuffer();
    const response = await fetch(presignedURL, {
      method: 'PUT',
      headers: { 'Content-Type': mimeType },
      body: fileData,
    });
    return response.ok;
  } catch (error) {
    console.error('Error during S3 upload:', error);
    return false;
  }
}

// Get an appropriate icon and color for the uploading file type
export function getUploadingFileInfo(fileType: string, fileName: string) {
  const displayType = fileType.charAt(0).toUpperCase() + fileType.slice(1);
  return { displayType, fileName };
}
