import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================
// LOCAL STORAGE (Development)
// ============================================

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../../uploads');
const profilesDir = path.join(uploadsDir, 'profiles');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
if (!fs.existsSync(profilesDir)) {
  fs.mkdirSync(profilesDir, { recursive: true });
}

// Storage config for local
const localStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, profilesDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `profile-${req.user.id}-${uniqueSuffix}${ext}`);
  },
});

// File filter — only images
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (jpeg, jpg, png, webp) are allowed'));
  }
};

// Local upload middleware
export const uploadProfilePicture = multer({
  storage: localStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter,
}).single('profilePicture');

// ============================================
// CLOUDINARY STORAGE (Production)
// ============================================
//
// STEPS TO ENABLE:
// 1. Create a Cloudinary account: https://cloudinary.com
// 2. Get your Cloud Name, API Key, and API Secret from the dashboard
// 3. Add these to your backend/.env file:
//      CLOUDINARY_CLOUD_NAME=your_cloud_name
//      CLOUDINARY_API_KEY=your_api_key
//      CLOUDINARY_API_SECRET=your_api_secret
// 4. Run: npm install cloudinary multer-storage-cloudinary
// 5. Uncomment the code below
// 6. Replace `uploadProfilePicture` export with the Cloudinary version below
// 7. Comment out the local version above
//
// ============================================

/*
import cloudinary from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const cloudinaryStorage = new CloudinaryStorage({
  cloudinary: cloudinary.v2,
  params: {
    folder: 'dentcare/profiles',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 500, height: 500, crop: 'limit' }],
  },
});

export const uploadProfilePicture = multer({
  storage: cloudinaryStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter,
}).single('profilePicture');

export { cloudinary };
*/