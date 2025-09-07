import express from 'express';
import { getQAs, getQAById, createQA, updateQA, deleteQA } from '../controllers/qa.controller.js';
import { protect } from '../middlewares/tokenMiddleware.js';
import multer from 'multer';

// Multer configuration for single file upload (report file)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/');
  },
  filename: (req, file, cb) => {
    const ext = file.mimetype.split('/')[1];
    cb(null, `${req.user ? req.user._id : 'qa'}-${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`);
  }
});
const upload = multer({ storage });

const router = express.Router();

// Public routes
router.get('/get',protect, getQAs);
router.get('/get-by-id/:id', getQAById);

// Protected routes
router.post('/create', protect, upload.single('reportFile'), createQA);
router.put('/update/:id', protect, upload.single('reportFile'), updateQA);
router.delete('/delete/:id', protect, deleteQA);

export default router;