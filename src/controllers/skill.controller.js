import asyncHandler from '../utils/asyncHandler.js';
import generateApiResponse from '../utils/generateApiResponse.js';
import Skill from '../models/skill.model.js';

// @desc    Get all skills
// @route   GET /api/skills
// @access  Public
export const getSkills = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const skills = await Skill.find({ user: userId });
  res.json(generateApiResponse(true, 'Skills fetched', skills));
});

export const getPublicSkills = asyncHandler(async (req, res) => {
  const skills = await Skill.find().select('name category');

  if (!skills || skills.length === 0) {
    return res
      .status(404)
      .json(generateApiResponse(false, 'No skills found for this user', null, 404));
  }

  // Map skills to include icons and levels for frontend
  const skillMap = {
    frontend: { icon: 'Code2', level: 90 },
    backend: { icon: 'Database', level: 80 },
    qa: { icon: 'Smartphone', level: 75 },
    uiux: { icon: 'Palette', level: 85 },
  };

  const formattedSkills = skills.map(skill => ({
    name: skill.name,
    icon: skillMap[skill.category.toLowerCase()]?.icon || 'Code2',
    level: skillMap[skill.category.toLowerCase()]?.level || 70,
  }));

  res.json(
    generateApiResponse(true, 'Public skills fetched successfully', formattedSkills, 200)
  );
});

// @desc    Get single skill
// @route   GET /api/skills/:id
// @access  Public
export const getSkillById = asyncHandler(async (req, res) => {
  const skill = await Skill.findById(req.params.id);
  if (skill) {
    res.json(generateApiResponse(true, 'Skill fetched', skill));
  } else {
    res.status(404).json(generateApiResponse(false, 'Skill not found', null, 404));
  }
});

// @desc    Create a skill
// @route   POST /api/skills
// @access  Private
export const createSkill = asyncHandler(async (req, res) => {
  const { name, level, category } = req.body;
  const icon = req.file ? `/uploads/${req.file.filename}` : null;

  const skill = await Skill.create({
    user: req.user._id,
    name,
    level,
    category,
    icon,
  });

  res.status(201).json(generateApiResponse(true, 'Skill created', skill, 201));
});

// @desc    Update a skill
// @route   PUT /api/skills/:id
// @access  Private
export const updateSkill = asyncHandler(async (req, res) => {
  const skill = await Skill.findById(req.params.id);

  if (!skill) {
    return res.status(404).json(generateApiResponse(false, 'Skill not found', null, 404));
  }

  // if (skill.user !== req.user._id) {
  //   return res.status(403).json(generateApiResponse(false, 'Not authorized to update this skill', null, 403));
  // }

  const { name, level, category } = req.body;
  const icon = req.file ? `/uploads/${req.file.filename}` : skill.icon;

  skill.name = name || skill.name;
  skill.level = level || skill.level;
  skill.category = category || skill.category;
  skill.icon = icon;

  await skill.save();

  res.json(generateApiResponse(true, 'Skill updated', skill));
});

// @desc    Delete a skill
// @route   DELETE /api/skills/:id
// @access  Private
export const deleteSkill = asyncHandler(async (req, res) => {
  const skill = await Skill.findById(req.params.id);

  if (!skill) {
    return res.status(404).json(generateApiResponse(false, 'Skill not found', null, 404));
  }

  if (skill.user.toString() !== req.user._id.toString()) {
    return res.status(403).json(generateApiResponse(false, 'Not authorized to delete this skill', null, 403));
  }

  await skill.deleteOne();
  res.json(generateApiResponse(true, 'Skill deleted'));

});