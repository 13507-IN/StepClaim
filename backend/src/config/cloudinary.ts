import { v2 as cloudinary } from 'cloudinary';
import { env } from './env.js';

/**
 * Cloudinary SDK configuration.
 * Configured using environment variables for cloud name, API key, and API secret.
 * Used for avatar uploads and other image management.
 */
cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
  secure: true,
});

export { cloudinary };
