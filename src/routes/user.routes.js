import express from 'express';
import { changePassword, createUser, deleteUser, forgotPassword, getAllUsers, getMe, loginUser, registerUser, resetPassword, updateProfile, updateUser } from '../controllers/user.controller.js';
import { protect } from '../middlewares/tokenMiddleware.js';
import generateApiResponse from '../utils/generateApiResponse.js';
import upload from '../middlewares/uploadMiddleware.js';
import multer from 'multer';

const router = express.Router();

// Middleware to handle Multer errors
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json(generateApiResponse(false, `Multer error: ${err.message}`, null, 400));
  } else if (err) {
    return res.status(400).json(generateApiResponse(false, `File upload error: ${err.message}`, null, 400));
  }
  next();
};

// Public routes
router.post('/register', upload.single('profilePicture'), handleMulterError, registerUser);
router.post('/login', loginUser);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

// Protected routes
router.get('/getProfile', protect, getMe);
router.put('/me', protect, upload.single('profilePicture'), handleMulterError, updateProfile);
router.post('/create', protect, upload.single('profilePicture'), handleMulterError, createUser);
router.patch('/update/:id', protect, upload.single('profilePicture'), handleMulterError, updateUser);
router.delete('/delete/:id', protect, deleteUser);
router.get('/get-all', protect, getAllUsers);
router.put('/password', protect, changePassword);

export default router;