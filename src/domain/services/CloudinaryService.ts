/**
 * Options for uploading an image to Cloudinary.
 */
export interface CloudinaryUploadOptions {
  folder?: string;
  public_id?: string;
}

/**
 * Result returned after a successful upload to Cloudinary.
 */
export interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
}

/**
 * Port for Cloudinary integration. Implementations call the Cloudinary API.
 */
export interface CloudinaryService {
  upload(source: string | Buffer, options?: CloudinaryUploadOptions): Promise<CloudinaryUploadResult>;
  delete(publicId: string): Promise<void>;
}
