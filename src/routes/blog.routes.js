import express from 'express';
import { getBlogs, getBlogBySlug, createBlog, updateBlog, deleteBlog } from '../controllers/blog.controller.js';
import { protect } from '../middlewares/tokenMiddleware.js';

const router = express.Router();

// Public routes
router.get('/get', protect, getBlogs);
router.get('/get/:slug', getBlogBySlug);

// Protected routes
router.post('/create', protect, createBlog);
router.put('/update/:id', protect, updateBlog);
router.delete('/delete/:id', protect, deleteBlog);

export default router;