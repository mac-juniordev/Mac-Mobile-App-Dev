import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const profilesDir = path.join(__dirname, '../../uploads/profiles');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

export const registerUser = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists',
      });
    }

    const user = await User.create({ fullName, email, password });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error during registration',
    });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const isPasswordMatch = await user.matchPassword(password);
    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        dentalHistory: user.dentalHistory,
        insurance: user.insurance,
        preferences: user.preferences,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error during login',
    });
  }
};

export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('savedDentists', 'fullName specialty rating')
      .populate('preferences.preferredDentist', 'fullName specialty');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching user data',
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const updates = req.body;
    delete updates.password;
    delete updates.email;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updates,
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating profile',
    });
  }
};

export const saveDentist = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user.savedDentists.includes(req.params.dentistId)) {
      user.savedDentists.push(req.params.dentistId);
      await user.save();
    }

    res.json({
      success: true,
      savedDentists: user.savedDentists,
    });
  } catch (error) {
    console.error('Save dentist error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error saving dentist',
    });
  }
};

export const unsaveDentist = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    user.savedDentists = user.savedDentists.filter(
      id => id.toString() !== req.params.dentistId
    );
    await user.save();

    res.json({
      success: true,
      savedDentists: user.savedDentists,
    });
  } catch (error) {
    console.error('Unsave dentist error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error removing saved dentist',
    });
  }
};

// @desc    Upload profile picture
// @route   POST /api/auth/profile-picture
// @access  Private
export const uploadProfilePictureController = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded',
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // ============================================
    // LOCAL VERSION
    // ============================================
    const profilePictureUrl = `${req.protocol}://${req.get('host')}/uploads/profiles/${req.file.filename}`;

    // Delete old picture if exists
    if (user.profilePicture && user.profilePicture.includes('/uploads/profiles/')) {
      const oldPath = user.profilePicture.split('/uploads/profiles/')[1];
      const oldFilePath = path.join(profilesDir, oldPath);
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
      }
    }

    user.profilePicture = profilePictureUrl;
    await user.save();

    // ============================================
    // CLOUDINARY VERSION (uncomment when ready)
    // ============================================
    //
    // if (user.profilePicturePublicId) {
    //   await cloudinary.v2.uploader.destroy(user.profilePicturePublicId);
    // }
    // user.profilePicture = req.file.path;
    // user.profilePicturePublicId = req.file.filename;
    // await user.save();

    res.json({
      success: true,
      message: 'Profile picture uploaded successfully',
      profilePicture: user.profilePicture,
    });
  } catch (error) {
    console.error('Upload profile picture error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error uploading picture',
    });
  }
};

// @desc    Update user preferences
// @route   PUT /api/auth/preferences
// @access  Private
export const updatePreferences = async (req, res) => {
  try {
    const { preferences } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    user.preferences = {
      ...user.preferences,
      ...preferences,
    };

    await user.save();

    res.json({
      success: true,
      message: 'Preferences updated successfully',
      preferences: user.preferences,
    });
  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating preferences',
    });
  }
};

// @desc    Logout (client-side token removal, but we can log it)
// @route   POST /api/auth/logout
// @access  Private
export const logoutUser = async (req, res) => {
  try {
    // Since we're using JWT (stateless), the client just removes the token.
    // This endpoint exists so we can add server-side blacklisting later if needed.
    res.json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error logging out',
    });
  }
};