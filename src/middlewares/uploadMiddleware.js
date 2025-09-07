import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../middlewares/cloudinaryMiddleware.js';

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'portfolio_uploads',
    allowed_formats: ['jpg', 'png', 'jpeg', 'txt', 'pdf', 'doc',],
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    // Allowed extensions
    const extFileTypes = /jpeg|jpg|png|pdf|doc|docx|txt/;
    // Allowed mime types
    const mimeTypes = /image\/jpeg|image\/jpg|image\/png|application\/pdf|application\/msword|application\/vnd.openxmlformats-officedocument.wordprocessingml.document|text\/plain/;

    const extname = extFileTypes.test(file.originalname.split('.').pop().toLowerCase());
    const mimetype = mimeTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only .jpg, .jpeg, .png, .pdf, .doc, .docx, and .txt files are allowed!'));
  },
});



export default upload;