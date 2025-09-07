import express from 'express';
import { getExperiences, getExperienceById, createExperience, updateExperience, deleteExperience } from '../controllers/expirence.controller.js';
import { protect } from '../middlewares/tokenMiddleware.js';

const router = express.Router();

// Public routes
router.get('/get', protect, getExperiences);
router.get('/getById/:id', getExperienceById);

// Protected routes
router.post('/create', protect, createExperience);
router.put('/update/:id', protect, updateExperience);
router.delete('/delete/:id', protect, deleteExperience);

export default router;