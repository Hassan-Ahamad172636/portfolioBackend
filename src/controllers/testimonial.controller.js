import asyncHandler from '../utils/asyncHandler.js';
import generateApiResponse from '../utils/generateApiResponse.js';
import Testimonial from '../models/testimonial.model.js';
import cloudinary from '../middlewares/cloudinaryMiddleware.js'; // Import Cloudinary for image deletion

// Common function to format testimonial response
const formatTestimonialResponse = (testimonial) => ({
  _id: testimonial._id,
  user: testimonial.user,
  name: testimonial.name,
  designation: testimonial.designation,
  company: testimonial.company,
  feedback: testimonial.feedback,
  rating: testimonial.rating,
  image: testimonial.image,
});

// @desc    Get all testimonials for authenticated user
// @route   GET /api/testimonials/get
// @access  Private
export const getTestimonials = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  if (!userId) {
    return res.status(401).json(generateApiResponse(false, 'User not authenticated', null, 401));
  }

  const testimonials = await Testimonial.find({ user: userId });
  if (!testimonials || testimonials.length === 0) {
    return res.status(404).json(generateApiResponse(false, 'No testimonials found', null, 404));
  }

  res.json(generateApiResponse(true, 'Testimonials fetched', testimonials.map(formatTestimonialResponse)));
});

// @desc    Get single testimonial
// @route   GET /api/testimonials/get/:id
// @access  Public
export const getTestimonialById = asyncHandler(async (req, res) => {
  const testimonial = await Testimonial.findById(req.params.id);
  if (!testimonial) {
    return res.status(404).json(generateApiResponse(false, 'Testimonial not found', null, 404));
  }
  res.json(generateApiResponse(true, 'Testimonial fetched', formatTestimonialResponse(testimonial)));
});

// @desc    Create a testimonial
// @route   POST /api/testimonials/create
// @access  Private
export const createTestimonial = asyncHandler(async (req, res) => {
  const { name, designation, company, feedback, rating } = req.body;
  const image = req.file?.path || null; // Cloudinary URL

  // Input validation
  if (!name || !feedback || !rating) {
    return res.status(400).json(generateApiResponse(false, 'Name, feedback, and rating are required', null, 400));
  }

  // Validate rating
  const parsedRating = parseFloat(rating);
  if (isNaN(parsedRating) || parsedRating < 0 || parsedRating > 5) {
    return res.status(400).json(generateApiResponse(false, 'Rating must be between 0 and 5', null, 400));
  }

  const testimonial = await Testimonial.create({
    user: req.user._id,
    name,
    designation,
    company,
    feedback,
    rating: parsedRating,
    image,
  });

  res.status(201).json(generateApiResponse(true, 'Testimonial created', formatTestimonialResponse(testimonial), 201));
});

// @desc    Update a testimonial
// @route   PUT /api/testimonials/update/:id
// @access  Private
export const updateTestimonial = asyncHandler(async (req, res) => {
  const testimonial = await Testimonial.findById(req.params.id);

  if (!testimonial) {
    return res.status(404).json(generateApiResponse(false, 'Testimonial not found', null, 404));
  }

  // Authorization check
  if (testimonial.user.toString() !== req.user._id.toString()) {
    return res.status(403).json(generateApiResponse(false, 'Not authorized to update this testimonial', null, 403));
  }

  const { name, designation, company, feedback, rating } = req.body;
  const newImage = req.file?.path || null; // Cloudinary URL

  // Delete old image from Cloudinary if new image is uploaded
  if (newImage && testimonial.image) {
    const publicId = testimonial.image.split('/').pop().split('.')[0]; // Extract Cloudinary public ID
    await cloudinary.uploader.destroy(`portfolio_uploads/${publicId}`);
  }

  // Update fields
  testimonial.name = name || testimonial.name;
  testimonial.designation = designation || testimonial.designation;
  testimonial.company = company || testimonial.company;
  testimonial.feedback = feedback || testimonial.feedback;
  testimonial.rating = rating ? parseFloat(rating) : testimonial.rating;
  testimonial.image = newImage || testimonial.image;

  // Validate rating
  if (rating && (isNaN(testimonial.rating) || testimonial.rating < 0 || testimonial.rating > 5)) {
    return res.status(400).json(generateApiResponse(false, 'Rating must be between 0 and 5', null, 400));
  }

  await testimonial.save();

  res.json(generateApiResponse(true, 'Testimonial updated', formatTestimonialResponse(testimonial)));
});

// @desc    Delete a testimonial
// @route   DELETE /api/testimonials/delete/:id
// @access  Private
export const deleteTestimonial = asyncHandler(async (req, res) => {
  const testimonial = await Testimonial.findById(req.params.id);

  if (!testimonial) {
    return res.status(404).json(generateApiResponse(false, 'Testimonial not found', null, 404));
  }

  // Authorization check
  if (testimonial.user.toString() !== req.user._id.toString()) {
    return res.status(403).json(generateApiResponse(false, 'Not authorized to delete this testimonial', null, 403));
  }

  // Delete image from Cloudinary
  if (testimonial.image) {
    const publicId = testimonial.image.split('/').pop().split('.')[0]; // Extract Cloudinary public ID
    await cloudinary.uploader.destroy(`portfolio_uploads/${publicId}`);
  }

  await testimonial.deleteOne();
  res.json(generateApiResponse(true, 'Testimonial deleted'));
});