import express from 'express';
import { getSkills, getSkillById, createSkill, updateSkill, deleteSkill, getPublicSkills } from '../controllers/skill.controller.js';
import { protect } from '../middlewares/tokenMiddleware.js';
import multer from 'multer';

// Multer configuration for single icon file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/');
  },
  filename: (req, file, cb) => {
    const ext = file.mimetype.split('/')[1];
    cb(null, `${req.user ? req.user._id : 'skill'}-${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`);
  }
});
const upload = multer({ storage });

const router = express.Router();

// Public routes
router.get('/get',protect, getSkills);
router.get('/get-by-id/:id', getSkillById);
router.get('/public', getPublicSkills);

// Protected routes
router.post('/create', protect, upload.single('icon'), createSkill);
router.put('/update/:id', protect, upload.single('icon'), updateSkill);
router.delete('/delete/:id', protect, deleteSkill);

export default router;