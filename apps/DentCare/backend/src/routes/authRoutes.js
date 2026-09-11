import express from 'express';
import {
  registerUser,
  loginUser,
  getCurrentUser,
  updateProfile,
  saveDentist,
  unsaveDentist,
  uploadProfilePictureController,
  updatePreferences,
  logoutUser,
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { uploadProfilePicture } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getCurrentUser);
router.put('/profile', protect, updateProfile);
router.put('/preferences', protect, updatePreferences);
router.post('/logout', protect, logoutUser);
router.post('/profile-picture', protect, uploadProfilePicture, uploadProfilePictureController);
router.post('/saved-dentists/:dentistId', protect, saveDentist);
router.delete('/saved-dentists/:dentistId', protect, unsaveDentist);

export default router;