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

  // Log environment info (without sensitive data)
  const env = process.env.NODE_ENV || 'development';
  console.log(`📋 Environment: ${env}`);
  console.log(`✅ All required environment variables are set`);
}

