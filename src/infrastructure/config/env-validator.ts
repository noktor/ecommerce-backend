/**
 * Environment variable validator
 * Ensures all required environment variables are set and valid
 */

interface RequiredEnvVars {
  MONGODB_URI: string;
  REDIS_URL?: string;
  RABBITMQ_URL?: string;
  PORT?: string;
  NODE_ENV?: string;
  JWT_SECRET?: string;
  JWT_EXPIRES_IN?: string;
  SENDGRID_API_KEY?: string;
  SENDGRID_FROM_EMAIL?: string;
  FRONTEND_URL?: string;
  CLOUDINARY_URL?: string;
  CLOUDINARY_CLOUD_NAME?: string;
  CLOUDINARY_API_KEY?: string;
  CLOUDINARY_API_SECRET?: string;
}

export function validateEnvironmentVariables(): void {
  const required: (keyof RequiredEnvVars)[] = ['MONGODB_URI'];
  const missing: string[] = [];

  // Check required variables
  for (const key of required) {
    if (!process.env[key]) {
      missing.push(key);
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
        'Please ensure all required variables are set in your .env file or environment.\n' +
        'See .env.example for reference.'
    );
  }

  // Validate MongoDB URI format
  const mongoUri = process.env.MONGODB_URI!;
  if (mongoUri.includes('YOUR_USERNAME') || mongoUri.includes('YOUR_PASSWORD')) {
    throw new Error(
      'MONGODB_URI contains placeholder values. Please update with your actual MongoDB credentials.'
    );
  }

  if (!mongoUri.startsWith('mongodb://') && !mongoUri.startsWith('mongodb+srv://')) {
    throw new Error(
      'MONGODB_URI must be a valid MongoDB connection string (starting with mongodb:// or mongodb+srv://)'
    );
  }

  // Validate SendGrid configuration (optional but recommended)
  const sendGridApiKey = process.env.SENDGRID_API_KEY;
  const sendGridFromEmail = process.env.SENDGRID_FROM_EMAIL;

  if (!sendGridApiKey || !sendGridFromEmail) {
    console.warn('⚠️  SendGrid email service not fully configured:');
    if (!sendGridApiKey) {
      console.warn('   - SENDGRID_API_KEY is missing');
    }
    if (!sendGridFromEmail) {
      console.warn('   - SENDGRID_FROM_EMAIL is missing');
    }
    console.warn('   Email verification and password reset will not work properly.');
    console.warn('   See README.md for SendGrid setup instructions.');
  } else {
    // Validate email format for SENDGRID_FROM_EMAIL
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(sendGridFromEmail)) {
      console.warn(`⚠️  SENDGRID_FROM_EMAIL has invalid email format: ${sendGridFromEmail}`);
    }

    // Validate API key format (SendGrid keys start with SG.)
    if (!sendGridApiKey.startsWith('SG.')) {
      console.warn('⚠️  SENDGRID_API_KEY format may be incorrect (should start with SG.)');
    }
  }

  // Cloudinary (optional): CLOUDINARY_URL or the three separate vars
  const cloudinaryUrl = process.env.CLOUDINARY_URL;
  const cloudinaryCloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const cloudinaryApiKey = process.env.CLOUDINARY_API_KEY;
  const cloudinaryApiSecret = process.env.CLOUDINARY_API_SECRET;
  const hasCloudinaryUrl = cloudinaryUrl?.trim().startsWith('cloudinary://');
  const hasCloudinaryVars =
    cloudinaryCloudName && cloudinaryApiKey && cloudinaryApiSecret;
  if (!hasCloudinaryUrl && !hasCloudinaryVars) {
    console.warn('⚠️  Cloudinary not configured:');
    console.warn('   Set CLOUDINARY_URL (e.g. cloudinary://API_KEY:API_SECRET@CLOUD_NAME)');
    console.warn('   or CLOUDINARY_CLOUD_NAME + CLOUDINARY_API_KEY + CLOUDINARY_API_SECRET');
    console.warn('   Image upload service will not be available. See .env.example.');
  }

  // Log environment info (without sensitive data)
  const env = process.env.NODE_ENV || 'development';
  console.log(`📋 Environment: ${env}`);
  console.log(`✅ All required environment variables are set`);
}
