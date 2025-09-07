import express from 'express';
import { getQAs, getQAById, createQA, updateQA, deleteQA } from '../controllers/qa.controller.js';
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
router.get('/get', protect, getQAs);
router.get('/get-by-id/:id', getQAById);

// Protected routes
router.post('/create', protect, upload.single('reportFile'), handleMulterError, createQA);
router.put('/update/:id', protect, upload.single('reportFile'), handleMulterError, updateQA);
router.delete('/delete/:id', protect, deleteQA);

export default router;