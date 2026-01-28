import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import jwt from 'jsonwebtoken';

// Environment variables (should be set in your Vite config)
const R2_ACCOUNT_ID = import.meta.env.VITE_R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = import.meta.env.VITE_R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = import.meta.env.VITE_R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = import.meta.env.VITE_R2_BUCKET_NAME;
const R2_PUBLIC_DOMAIN = import.meta.env.VITE_R2_PUBLIC_DOMAIN || `${R2_ACCOUNT_ID}.r2.dev`;
const JWT_SECRET = import.meta.env.VITE_JWT_SECRET || 'your-jwt-secret';

// Configure S3 client for Cloudflare R2
const s3Client = new S3Client({
  region: 'auto',
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

// Types for the request and response
interface GenerateSignedUrlRequest {
  fileKey: string;
  contentType: string;
  userId: string;
}

export interface SignedUrlResponse {
  signedUrl: string;
  publicUrl: string;
  fileKey: string;
}

// Verify JWT token
export const verifyToken = (token: string): { userId: string } | null => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { sub: string };
    return { userId: decoded.sub };
  } catch (error) {
    console.error('Invalid token:', error);
    return null;
  }
};

// Main function to generate signed URL
export async function generateSignedUrl(request: GenerateSignedUrlRequest): Promise<SignedUrlResponse> {
  const { fileKey, contentType, userId } = request;
  
  if (!fileKey || !contentType || !userId) {
    throw new Error('Missing required parameters');
  }

  // Create a path with user ID to organize files by user
  const sanitizedFileName = fileKey.replace(/^\/|\/$/g, '');
  const userFilePath = `users/${userId}/${Date.now()}-${sanitizedFileName}`;
  const publicUrl = `https://${R2_PUBLIC_DOMAIN}/${userFilePath}`;

  const command = new PutObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: userFilePath,
    ContentType: contentType,
    // Optional: Add metadata
    Metadata: {
      'uploaded-by': userId,
      'original-filename': fileKey,
      'upload-timestamp': new Date().toISOString()
    }
  });

  try {
    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 }); // 5 minutes
    
    return {
      signedUrl,
      publicUrl,
      fileKey: userFilePath,
    };
  } catch (error) {
    console.error('Error generating signed URL:', error);
    throw new Error('Failed to generate signed URL');
  }
}

// Client-side upload function
export async function uploadFileToR2(file: File, authToken: string): Promise<{ fileUrl: string; fileKey: string }> {
  try {
    // 1. Get signed URL from your backend
    const response = await fetch('/api/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        fileKey: file.name,
        contentType: file.type
      })
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Failed to get signed URL');
    }

    const { signedUrl, publicUrl, fileKey } = await response.json();

    // 2. Upload the file directly to R2 using the signed URL
    const uploadResponse = await fetch(signedUrl, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type,
      },
    });

    if (!uploadResponse.ok) {
      throw new Error('Upload failed');
    }

    // 3. Return the public URL and file key for future reference
    return { fileUrl: publicUrl, fileKey };
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
}
