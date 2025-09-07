import asyncHandler from '../utils/asyncHandler.js';
import generateApiResponse from '../utils/generateApiResponse.js';
import Skill from '../models/skill.model.js';
import cloudinary from '../middlewares/cloudinaryMiddleware.js'; // Import Cloudinary for icon deletion

// Common function to format skill response
const formatSkillResponse = (skill, includeUser = true) => {
  const response = {
    id: skill._id,
    name: skill.name,
    level: skill.level,
    category: skill.category,
    icon: skill.icon,
  };
  if (includeUser) response.user = skill.user;
  return response;
};

// @desc    Get all skills for authenticated user
// @route   GET /api/skills/get
// @access  Private
export const getSkills = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  if (!userId) {
    return res.status(401).json(generateApiResponse(false, 'User not authenticated', null, 401));
  }

  const skills = await Skill.find({ user: userId });
  if (!skills || skills.length === 0) {
    return res.status(404).json(generateApiResponse(false, 'No skills found', null, 404));
  }

  res.json(generateApiResponse(true, 'Skills fetched', skills.map(skill => formatSkillResponse(skill))));
});

// @desc    Get public skills
// @route   GET /api/skills/public
// @access  Public
export const getPublicSkills = asyncHandler(async (req, res) => {
  const skills = await Skill.find({}).select('name category level icon');

  if (!skills || skills.length === 0) {
    return res.status(404).json(generateApiResponse(false, 'No public skills found', null, 404));
  }

  res.json(generateApiResponse(true, 'Public skills fetched successfully', skills.map(skill => formatSkillResponse(skill, false))));
});

// @desc    Get single skill
// @route   GET /api/skills/get-by-id/:id
// @access  Public
export const getSkillById = asyncHandler(async (req, res) => {
  const skill = await Skill.findById(req.params.id);
  if (!skill) {
    return res.status(404).json(generateApiResponse(false, 'Skill not found', null, 404));
  }
  res.json(generateApiResponse(true, 'Skill fetched', formatSkillResponse(skill)));
});

// @desc    Create a skill
// @route   POST /api/skills/create
// @access  Private
export const createSkill = asyncHandler(async (req, res) => {
  const { name, level, category, status } = req.body;
  const icon = req.file?.path || null; // Cloudinary URL

  // Input validation
  if (!name || !level || !category) {
    return res.status(400).json(generateApiResponse(false, 'Name, level, and category are required', null, 400));
  }

  // Validate level
  const parsedLevel = parseFloat(level);
  if (isNaN(parsedLevel) || parsedLevel < 0 || parsedLevel > 100) {
    return res.status(400).json(generateApiResponse(false, 'Level must be between 0 and 100', null, 400));
  }

  // Validate category
  const validCategories = ['frontend', 'backend', 'qa', 'uiux', 'other'];
  if (!validCategories.includes(category.toLowerCase())) {
    return res.status(400).json(generateApiResponse(false, 'Invalid category', null, 400));
  }

  const skill = await Skill.create({
    user: req.user._id,
    name,
    level: parsedLevel,
    category: category.toLowerCase(),
    icon,
    status: status || 'private', // Default to private
  });

  res.status(201).json(generateApiResponse(true, 'Skill created', formatSkillResponse(skill), 201));
});

// @desc    Update a skill
// @route   PUT /api/skills/update/:id
// @access  Private
export const updateSkill = asyncHandler(async (req, res) => {
  const skill = await Skill.findById(req.params.id);

  if (!skill) {
    return res.status(404).json(generateApiResponse(false, 'Skill not found', null, 404));
  }

  // Authorization check
  if (skill.user.toString() !== req.user._id.toString()) {
    return res.status(403).json(generateApiResponse(false, 'Not authorized to update this skill', null, 403));
  }

  const { name, level, category, status } = req.body;
  const newIcon = req.file?.path || null; // Cloudinary URL

  // Delete old icon from Cloudinary if new icon is uploaded
  if (newIcon && skill.icon) {
    const publicId = skill.icon.split('/').pop().split('.')[0]; // Extract Cloudinary public ID
    await cloudinary.uploader.destroy(`portfolio_uploads/${publicId}`);
  }

  // Update fields
  skill.name = name || skill.name;
  skill.level = level ? parseFloat(level) : skill.level;
  skill.category = category ? category.toLowerCase() : skill.category;
  skill.icon = newIcon || skill.icon;
  skill.status = status || skill.status;

  // Validate level
  if (level && (isNaN(skill.level) || skill.level < 0 || skill.level > 100)) {
    return res.status(400).json(generateApiResponse(false, 'Level must be between 0 and 100', null, 400));
  }

  // Validate category
  const validCategories = ['frontend', 'backend', 'qa', 'uiux', 'other'];
  if (category && !validCategories.includes(skill.category)) {
    return res.status(400).json(generateApiResponse(false, 'Invalid category', null, 400));
  }

  await skill.save();

  res.json(generateApiResponse(true, 'Skill updated', formatSkillResponse(skill)));
});

// @desc    Delete a skill
// @route   DELETE /api/skills/delete/:id
// @access  Private
export const deleteSkill = asyncHandler(async (req, res) => {
  const skill = await Skill.findById(req.params.id);

  if (!skill) {
    return res.status(404).json(generateApiResponse(false, 'Skill not found', null, 404));
  }

  // Authorization check
  if (skill.user.toString() !== req.user._id.toString()) {
    return res.status(403).json(generateApiResponse(false, 'Not authorized to delete this skill', null, 403));
  }

  // Delete icon from Cloudinary
  if (skill.icon) {
    const publicId = skill.icon.split('/').pop().split('.')[0]; // Extract Cloudinary public ID
    await cloudinary.uploader.destroy(`portfolio_uploads/${publicId}`);
  }

  await skill.deleteOne();
  res.json(generateApiResponse(true, 'Skill deleted'));
});