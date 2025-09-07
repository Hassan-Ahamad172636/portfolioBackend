import express from 'express';
import { getProjects, getProjectById, createProject, updateProject, deleteProject, getPublicProjects } from '../controllers/project.controller.js';
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
router.get('/get-all', protect, getProjects);
router.get('/get-by-id/:id', getProjectById);
router.get('/public', getPublicProjects);

// Protected routes
router.post('/create', protect, upload.array('images', 5), handleMulterError, createProject); // Max 5 images
router.patch('/update/:id', protect, upload.array('images', 5), handleMulterError, updateProject);
router.delete('/delete/:id', protect, deleteProject);

export default router;