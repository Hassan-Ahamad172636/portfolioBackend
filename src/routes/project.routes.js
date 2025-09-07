import express from 'express';
import { getProjects, getProjectById, createProject, updateProject, deleteProject, getPublicProjects } from '../controllers/project.controller.js';
import { protect } from '../middlewares/tokenMiddleware.js';
import multer from 'multer';

// Multer configuration for multiple image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/');
  },
  filename: (req, file, cb) => {
    const ext = file.mimetype.split('/')[1];
    cb(null, `${req.user ? req.user._id : 'project'}-${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`);
  }
});
const upload = multer({ storage });

const router = express.Router();

// Public routes
router.get('/get-all', protect, getProjects);
router.get('/get-by-id/:id', getProjectById);
router.get('/public', getPublicProjects);

// Protected routes
router.post('/create', protect, upload.array('images', 5), createProject); // Max 5 images
router.patch('/update/:id', protect, upload.array('images', 5), updateProject);
router.delete('/delete/:id', protect, deleteProject);

export default router;