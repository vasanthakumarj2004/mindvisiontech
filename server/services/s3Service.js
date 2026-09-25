import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { env } from '../config/env.js';
import crypto from 'crypto';

const s3 = new S3Client({ region: env.awsRegion });

/**
 * Upload a file buffer to S3 under pdfs/{trackSlug}/{uuid}-{originalFilename}
 * Returns { url, s3Key }
 */
export async function uploadPdfToS3({ buffer, originalName, mimeType, trackSlug }) {
  if (!env.awsBucketName) {
    throw new Error('AWS_S3_BUCKET_NAME is not configured');
  }

  const uid = crypto.randomUUID();
  // Sanitise the original filename to prevent path traversal
  const safeName = originalName.replace(/[^a-zA-Z0-9._-]/g, '_');
  const s3Key = `pdfs/${trackSlug}/${uid}-${safeName}`;

  await s3.send(
    new PutObjectCommand({
      Bucket: env.awsBucketName,
      Key: s3Key,
      Body: buffer,
      ContentType: mimeType,
      // Private by default — access via pre-signed URLs or CloudFront
      ServerSideEncryption: 'AES256'
    })
  );

  // Build the public URL
  const baseUrl = env.awsBucketDomain
    ? `https://${env.awsBucketDomain}`
    : `https://${env.awsBucketName}.s3.${env.awsRegion}.amazonaws.com`;

  const url = `${baseUrl}/${s3Key}`;
  return { url, s3Key };
}

/**
 * Delete an object from S3 by key. Silently succeeds if the key doesn't exist.
 */
export async function deletePdfFromS3(s3Key) {
  if (!env.awsBucketName || !s3Key) return;

  await s3.send(
    new DeleteObjectCommand({
      Bucket: env.awsBucketName,
      Key: s3Key
    })
  );
}
