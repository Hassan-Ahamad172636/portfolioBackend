import express from 'express';
import multer from 'multer';
import { changePassword, createUser, deleteUser, forgotPassword, getAllUsers, getMe, loginUser, registerUser, resetPassword, updateProfile, updateUser } from '../controllers/user.controller.js';
import { protect } from '../middlewares/tokenMiddleware.js';

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/');
  },
  filename: (req, file, cb) => {
    const ext = file.mimetype.split('/')[1];
    cb(null, `${req.user ? req.user._id : 'new-user'}-${Date.now()}.${ext}`);
  }
});
const upload = multer({ storage });

const router = express.Router();

// Public routes
router.post('/register', upload.single('profilePicture'), registerUser);
router.post('/login', loginUser);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

// Protected routes
router.get('/getProfile', protect, getMe);
router.put('/me', protect, upload.single('profilePicture'), updateProfile);
router.post('/create', protect, upload.single('profilePicture'), createUser);
router.patch('/update/:id', protect, upload.single('profilePicture'), updateUser);
router.delete('/delete/:id', protect, deleteUser);
router.get('/get-all', protect, getAllUsers);
router.put('/password', protect, changePassword);

export default router;