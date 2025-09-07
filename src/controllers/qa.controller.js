import asyncHandler from '../utils/asyncHandler.js';
import generateApiResponse from '../utils/generateApiResponse.js';
import QA from '../models/qa.model.js';
import cloudinary from '../middlewares/cloudinaryMiddleware.js'; // Import Cloudinary for file deletion

// Common function to format QA response
const formatQAResponse = (qa) => ({
  id: qa._id,
  user: qa.user,
  title: qa.title,
  type: qa.type,
  toolsUsed: qa.toolsUsed,
  description: qa.description,
  reportLink: qa.reportLink,
});

// @desc    Get all QA records for authenticated user
// @route   GET /api/qa/get
// @access  Private
export const getQAs = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  if (!userId) {
    return res.status(401).json(generateApiResponse(false, 'User not authenticated', null, 401));
  }

  const qas = await QA.find({ user: userId });
  if (!qas || qas.length === 0) {
    return res.status(404).json(generateApiResponse(false, 'No QA records found', null, 404));
  }

  res.json(generateApiResponse(true, 'QA records fetched', qas.map(formatQAResponse)));
});

// @desc    Get single QA record
// @route   GET /api/qa/get-by-id/:id
// @access  Public
export const getQAById = asyncHandler(async (req, res) => {
  const qa = await QA.findById(req.params.id);
  if (!qa) {
    return res.status(404).json(generateApiResponse(false, 'QA record not found', null, 404));
  }
  res.json(generateApiResponse(true, 'QA record fetched', formatQAResponse(qa)));
});

// @desc    Create a QA record
// @route   POST /api/qa/create
// @access  Private
export const createQA = asyncHandler(async (req, res) => {
  const { title, type, toolsUsed, description, reportLink } = req.body;
  const reportFile = req.file?.path || null; // Cloudinary URL

  // Input validation
  if (!title || !description || !type) {
    return res.status(400).json(generateApiResponse(false, 'Title, type, and description are required', null, 400));
  }

  const qa = await QA.create({
    user: req.user._id,
    title,
    type,
    toolsUsed: toolsUsed ? toolsUsed.split(',').map(tool => tool.trim()) : [],
    description,
    reportLink: reportFile || reportLink || null, // Prioritize uploaded file over link
  });

  res.status(201).json(generateApiResponse(true, 'QA record created', formatQAResponse(qa), 201));
});

// @desc    Update a QA record
// @route   PUT /api/qa/update/:id
// @access  Private
export const updateQA = asyncHandler(async (req, res) => {
  const qa = await QA.findById(req.params.id);

  if (!qa) {
    return res.status(404).json(generateApiResponse(false, 'QA record not found', null, 404));
  }

  // Authorization check
  if (qa.user.toString() !== req.user._id.toString()) {
    return res.status(403).json(generateApiResponse(false, 'Not authorized to update this QA record', null, 403));
  }

  const { title, type, toolsUsed, description, reportLink } = req.body;
  const newReportFile = req.file?.path || null; // Cloudinary URL

  // Delete old file from Cloudinary if new file is uploaded
  if (newReportFile && qa.reportLink && qa.reportLink.includes('cloudinary')) {
    const publicId = qa.reportLink.split('/').pop().split('.')[0]; // Extract Cloudinary public ID
    await cloudinary.uploader.destroy(`portfolio_uploads/${publicId}`);
  }

  // Update fields
  qa.title = title || qa.title;
  qa.type = type || qa.type;
  qa.toolsUsed = toolsUsed ? toolsUsed.split(',').map(tool => tool.trim()) : qa.toolsUsed;
  qa.description = description || qa.description;
  qa.reportLink = newReportFile || reportLink || qa.reportLink;

  await qa.save();

  res.json(generateApiResponse(true, 'QA record updated', formatQAResponse(qa)));
});

// @desc    Delete a QA record
// @route   DELETE /api/qa/delete/:id
// @access  Private
export const deleteQA = asyncHandler(async (req, res) => {
  const qa = await QA.findById(req.params.id);

  if (!qa) {
    return res.status(404).json(generateApiResponse(false, 'QA record not found', null, 404));
  }

  // Authorization check
  if (qa.user.toString() !== req.user._id.toString()) {
    return res.status(403).json(generateApiResponse(false, 'Not authorized to delete this QA record', null, 403));
  }

  // Delete file from Cloudinary
  if (qa.reportLink && qa.reportLink.includes('cloudinary')) {
    const publicId = qa.reportLink.split('/').pop().split('.')[0]; // Extract Cloudinary public ID
    await cloudinary.uploader.destroy(`portfolio_uploads/${publicId}`);
  }

  await qa.deleteOne();
  res.json(generateApiResponse(true, 'QA record deleted'));
});