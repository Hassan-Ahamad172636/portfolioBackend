import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../middlewares/cloudinaryMiddleware.js';

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'portfolio_uploads',
    allowed_formats: ['jpg', 'png', 'jpeg'],
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(file.originalname.split('.').pop().toLowerCase());
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only .jpg, .jpeg, and .png files are allowed!'));
  },
});

export default upload;