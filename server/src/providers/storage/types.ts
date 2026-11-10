export interface UploadResult {
  url: string;
  publicId: string;
}

export interface StorageProvider {
  upload(file: Express.Multer.File, folder: string): Promise<UploadResult>;
  delete(publicId: string): Promise<void>;
  getSignedUrl(publicId: string): Promise<string>;
}
