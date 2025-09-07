import express from 'express';
import { getTestimonials, getTestimonialById, createTestimonial, updateTestimonial, deleteTestimonial } from '../controllers/testimonial.controller.js';
import { protect } from '../middlewares/tokenMiddleware.js';
import upload from '../middlewares/uploadMiddleware.js'; // Importing Cloudinary upload middleware
import generateApiResponse from '../utils/generateApiResponse.js';

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
router.get('/get', protect, getTestimonials);
router.get('/get/:id', getTestimonialById);

// Protected routes
router.post('/create', protect, upload.single('image'), handleMulterError, createTestimonial);
router.put('/update/:id', protect, upload.single('image'), handleMulterError, updateTestimonial);
router.delete('/delete/:id', protect, deleteTestimonial);

export default router;