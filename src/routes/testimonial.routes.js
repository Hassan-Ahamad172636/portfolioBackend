import express from 'express';
import { getTestimonials, getTestimonialById, createTestimonial, updateTestimonial, deleteTestimonial } from '../controllers/testimonial.controller.js';
import { protect } from '../middlewares/tokenMiddleware.js';
import multer from 'multer';

// Multer configuration for single image upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/');
  },
  filename: (req, file, cb) => {
    const ext = file.mimetype.split('/')[1];
    cb(null, `${req.user ? req.user._id : 'testimonial'}-${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`);
  }
});
const upload = multer({ storage });

const router = express.Router();

// Public routes
router.get('/get', protect, getTestimonials);
router.get('/get/:id', getTestimonialById);

// Protected routes
router.post('/create', protect, upload.single('image'), createTestimonial);
router.put('/update/:id', protect, upload.single('image'), updateTestimonial);
router.delete('/delete/:id', protect, deleteTestimonial);

export default router;