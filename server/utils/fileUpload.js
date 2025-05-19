import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Upload image and return URL
export const uploadImage = async (file) => {
  // For simplicity, we're just returning the path to the uploaded file
  // In a production app, you'd upload to a cloud storage service like AWS S3
  
  // Make sure uploads directory exists
  const uploadsDir = path.join(__dirname, '../uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  
  // Construct URL for the uploaded file
  // In production, this would be your CDN or cloud storage URL
  const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
  return `${baseUrl}/uploads/${file.filename}`;
};