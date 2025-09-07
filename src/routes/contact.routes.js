import express from 'express';
import { getContacts, getContactById, createContact, updateContact, deleteContact } from '../controllers/contact.controller.js';
import { protect } from '../middlewares/tokenMiddleware.js';

const router = express.Router();

// Public routes
router.post('/create', createContact);

// Protected routes
router.get('/getAll', protect, getContacts);
router.get('/getById/:id', protect, getContactById);
router.put('/update/:id', protect, updateContact);
router.delete('/delete/:id', protect, deleteContact);

export default router;