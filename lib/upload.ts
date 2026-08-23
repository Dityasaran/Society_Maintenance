import { v2 as cloudinary } from 'cloudinary';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

const USE_CLOUDINARY = Boolean(process.env.CLOUDINARY_URL);

if (USE_CLOUDINARY) {
  // CLOUDINARY_URL format: cloudinary://api_key:api_secret@cloud_name
  // The cloudinary SDK auto-configures from CLOUDINARY_URL env var
  cloudinary.config({ secure: true });
}

export interface UploadResult {
  url: string;
  publicId?: string;
}

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export function validateFile(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return 'Only JPG, PNG, and WebP images are allowed.';
  }
  if (file.size > MAX_SIZE_BYTES) {
    return 'File size must not exceed 5 MB.';
  }
  return null;
}

export async function uploadFile(file: File): Promise<UploadResult> {
  const buffer = Buffer.from(await file.arrayBuffer());

  if (USE_CLOUDINARY) {
    return uploadToCloudinary(buffer, file.type);
  } else {
    return uploadToLocal(buffer, file.name);
  }
}

async function uploadToCloudinary(
  buffer: Buffer,
  mimeType: string
): Promise<UploadResult> {
  const dataUri = `data:${mimeType};base64,${buffer.toString('base64')}`;
  const result = await cloudinary.uploader.upload(dataUri, {
    folder: 'society-maintenance',
    resource_type: 'image',
  });
  return { url: result.secure_url, publicId: result.public_id };
}

async function uploadToLocal(
  buffer: Buffer,
  originalName: string
): Promise<UploadResult> {
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
  await mkdir(uploadsDir, { recursive: true });

  const ext = path.extname(originalName) || '.jpg';
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
  const filePath = path.join(uploadsDir, filename);
  await writeFile(filePath, buffer);

  return { url: `/uploads/${filename}` };
}
