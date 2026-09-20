import 'dotenv/config';

const nodeEnv = process.env.NODE_ENV || 'development';
const isProduction = nodeEnv === 'production';

const envOrigins = (process.env.CORS_ORIGINS || process.env.CLIENT_URL || 'http://localhost:3000')
  .split(',')
  .map((value) => value.trim().replace(/\/+$/, '')) // strip trailing slashes
  .filter(Boolean);

// Validate critical production configurations
if (isProduction && !process.env.MONGODB_URI) {
  console.warn('⚠️ [Config] MONGODB_URI is not set. Defaulting to local MongoDB.');
}

if (isProduction && !process.env.ADMIN_API_KEY && !process.env.JWT_SECRET) {
  console.warn('⚠️ [Config] Neither ADMIN_API_KEY nor JWT_SECRET is set. Secure administrative endpoints will fail.');
}

export const env = {
  nodeEnv,
  isProduction,
  port: Number(process.env.PORT || 5000),
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/mindvisiontech',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',
  corsOrigins: envOrigins,
  adminApiKey: process.env.ADMIN_API_KEY || '',
  jwtSecret: process.env.JWT_SECRET || '',
  awsRegion: process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION || 'us-east-1',
  awsBucketName: process.env.AWS_S3_BUCKET_NAME || '',
  awsBucketDomain: process.env.AWS_S3_BUCKET_DOMAIN || ''
};