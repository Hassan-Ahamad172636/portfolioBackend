import express from 'express';
import { getSkills, getSkillById, createSkill, updateSkill, deleteSkill, getPublicSkills } from '../controllers/skill.controller.js';
import { protect } from '../middlewares/tokenMiddleware.js';
import upload from '../middlewares/uploadMiddleware.js'; // Importing Cloudinary upload middleware
import generateApiResponse from '../utils/generateApiResponse.js';
import multer from 'multer'

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
router.get('/get', protect, getSkills);
router.get('/get-by-id/:id', getSkillById);
router.get('/public', getPublicSkills);

// Protected routes
router.post('/create', protect, upload.single('icon'), handleMulterError, createSkill);
router.put('/update/:id', protect, upload.single('icon'), handleMulterError, updateSkill);
router.delete('/delete/:id', protect, deleteSkill);

export default router;