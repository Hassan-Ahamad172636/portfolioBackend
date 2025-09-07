import asyncHandler from '../utils/asyncHandler.js';
import generateApiResponse from '../utils/generateApiResponse.js';
import QA from '../models/qa.model.js';

// @desc    Get all QA records
// @route   GET /api/qa
// @access  Public
export const getQAs = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const qas = await QA.find({ user: userId });
  res.json(generateApiResponse(true, 'QA records fetched', qas));
});

// @desc    Get single QA record
// @route   GET /api/qa/:id
// @access  Public
export const getQAById = asyncHandler(async (req, res) => {
  const qa = await QA.findById(req.params.id);
  if (qa) {
    res.json(generateApiResponse(true, 'QA record fetched', qa));
  } else {
    res.status(404).json(generateApiResponse(false, 'QA record not found', null, 404));
  }
});

// @desc    Create a QA record
// @route   POST /api/qa
// @access  Private
export const createQA = asyncHandler(async (req, res) => {
  const { title, type, toolsUsed, description, reportLink } = req.body;
  const reportFile = req.file ? `/uploads/${req.file.filename}` : null;

  const qa = await QA.create({
    user: req.user._id,
    title,
    type,
    toolsUsed: toolsUsed ? toolsUsed.split(',').map(tool => tool.trim()) : [],
    description,
    reportLink: reportFile || reportLink, // Use uploaded file if provided, else use link
  });

  res.status(201).json(generateApiResponse(true, 'QA record created', qa, 201));
});

// @desc    Update a QA record
// @route   PUT /api/qa/:id
// @access  Private
export const updateQA = asyncHandler(async (req, res) => {
  const qa = await QA.findById(req.params.id);

  if (!qa) {
    return res.status(404).json(generateApiResponse(false, 'QA record not found', null, 404));
  }

  // if (qa.user.toString() !== req.user._id.toString()) {
  //   return res.status(403).json(generateApiResponse(false, 'Not authorized to update this QA record', null, 403));
  // }

  const { title, type, toolsUsed, description, reportLink } = req.body;
  const reportFile = req.file ? `/uploads/${req.file.filename}` : null;

  qa.title = title || qa.title;
  qa.type = type || qa.type;
  qa.toolsUsed = toolsUsed ? toolsUsed?.split(',').map(tool => tool?.trim()) : qa.toolsUsed;
  qa.description = description || qa.description;
  qa.reportLink = reportFile || reportLink || qa.reportLink;

  await qa.save();

  res.json(generateApiResponse(true, 'QA record updated', qa));
});

// @desc    Delete a QA record
// @route   DELETE /api/qa/:id
// @access  Private
export const deleteQA = asyncHandler(async (req, res) => {
  const qa = await QA.findById(req.params.id);

  if (!qa) {
    return res.status(404).json(generateApiResponse(false, 'QA record not found', null, 404));
  }

  if (qa.user.toString() !== req.user._id.toString()) {
    return res.status(403).json(generateApiResponse(false, 'Not authorized to delete this QA record', null, 403));
  }

  await qa.deleteOne();
  res.json(generateApiResponse(true, 'QA record deleted'));
});