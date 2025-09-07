import asyncHandler from '../utils/asyncHandler.js';
import generateApiResponse from '../utils/generateApiResponse.js';
import Testimonial from '../models/testimonial.model.js';

// @desc    Get all testimonials
// @route   GET /api/testimonials
// @access  Public
export const getTestimonials = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const testimonials = await Testimonial.find({ user: userId });
  res.json(generateApiResponse(true, 'Testimonials fetched', testimonials));
});

// @desc    Get single testimonial
// @route   GET /api/testimonials/:id
// @access  Public
export const getTestimonialById = asyncHandler(async (req, res) => {
  const testimonial = await Testimonial.findById(req.params.id);
  if (testimonial) {
    res.json(generateApiResponse(true, 'Testimonial fetched', testimonial));
  } else {
    res.status(404).json(generateApiResponse(false, 'Testimonial not found', null, 404));
  }
});

// @desc    Create a testimonial
// @route   POST /api/testimonials
// @access  Private
export const createTestimonial = asyncHandler(async (req, res) => {
  const { name, designation, company, feedback, rating } = req.body;
  const image = req.file ? `/uploads/${req.file.filename}` : null;

  const testimonial = await Testimonial.create({
    user: req.user._id,
    name,
    designation,
    company,
    feedback,
    rating,
    image,
  });

  res.status(201).json(generateApiResponse(true, 'Testimonial created', testimonial, 201));
});

// @desc    Update a testimonial
// @route   PUT /api/testimonials/:id
// @access  Private
export const updateTestimonial = asyncHandler(async (req, res) => {
  const testimonial = await Testimonial.findById(req.params.id);

  if (!testimonial) {
    return res.status(404).json(generateApiResponse(false, 'Testimonial not found', null, 404));
  }

  // if (testimonial.user?.toString() !== req.user._id.toString()) {
  //   return res.status(403).json(generateApiResponse(false, 'Not authorized to update this testimonial', null, 403));
  // }

  const { name, designation, company, feedback, rating } = req.body;
  const image = req.file ? `/uploads/${req.file.filename}` : testimonial.image;

  testimonial.name = name || testimonial.name;
  testimonial.designation = designation || testimonial.designation;
  testimonial.company = company || testimonial.company;
  testimonial.feedback = feedback || testimonial.feedback;
  testimonial.rating = rating || testimonial.rating;
  testimonial.image = image;

  await testimonial.save();

  res.json(generateApiResponse(true, 'Testimonial updated', testimonial));
});

// @desc    Delete a testimonial
// @route   DELETE /api/testimonials/:id
// @access  Private
export const deleteTestimonial = asyncHandler(async (req, res) => {
  const testimonial = await Testimonial.findById(req.params.id);

  if (!testimonial) {
    return res.status(404).json(generateApiResponse(false, 'Testimonial not found', null, 404));
  }

  if (testimonial.user.toString() !== req.user._id.toString()) {
    return res.status(403).json(generateApiResponse(false, 'Not authorized to delete this testimonial', null, 403));
  }

  await testimonial.deleteOne();
  res.json(generateApiResponse(true, 'Testimonial deleted'));
});