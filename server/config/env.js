import 'dotenv/config';

const envOrigins = (process.env.CORS_ORIGINS || process.env.CLIENT_URL || 'http://localhost:3000')
  .split(',')
  .map((value) => value.trim())
  .filter(Boolean);

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 5000),
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/mindvisiontech',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',
  corsOrigins: envOrigins,
  awsRegion: process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION || 'us-east-1',
  awsBucketName: process.env.AWS_S3_BUCKET_NAME || '',
  awsBucketDomain: process.env.AWS_S3_BUCKET_DOMAIN || ''
};