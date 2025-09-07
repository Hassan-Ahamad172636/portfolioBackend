import asyncHandler from '../utils/asyncHandler.js';
import generateApiResponse from '../utils/generateApiResponse.js';
import Experience from '../models/expirence.model.js';

// @desc    Get all experiences
// @route   GET /api/experiences
// @access  Public
export const getExperiences = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const experiences = await Experience.find({user: userId});
  res.json(generateApiResponse(true, 'Experiences fetched', experiences));
});

// @desc    Get single experience
// @route   GET /api/experiences/:id
// @access  Public
export const getExperienceById = asyncHandler(async (req, res) => {
  const experience = await Experience.findById(req.params.id);
  if (experience) {
    res.json(generateApiResponse(true, 'Experience fetched', experience));
  } else {
    res.status(404).json(generateApiResponse(false, 'Experience not found', null, 404));
  }
});

// @desc    Create an experience
// @route   POST /api/experiences
// @access  Private
export const createExperience = asyncHandler(async (req, res) => {
  const { companyName, role, duration, description, technologies } = req.body;

  let techArray = [];
  if (typeof technologies === "string") {
    techArray = technologies.split(",").map((tech) => tech.trim());
  } else if (Array.isArray(technologies)) {
    techArray = technologies.map((tech) => tech.trim());
  }

  const experience = await Experience.create({
    user: req.user._id,
    companyName,
    role,
    duration,
    description,
    technologies: techArray,
  });

  res
    .status(201)
    .json(generateApiResponse(true, "Experience created", experience, 201));
});


// @desc    Update an experience
// @route   PUT /api/experiences/:id
// @access  Private
export const updateExperience = asyncHandler(async (req, res) => {
  const experience = await Experience.findById(req.params.id);

  if (!experience) {
    return res.status(404).json(generateApiResponse(false, 'Experience not found', null, 404));
  }

  // if (experience.user.toString() !== req.user._id.toString()) {
  //   return res.status(403).json(generateApiResponse(false, 'Not authorized to update this experience', null, 403));
  // }

  const { companyName, role, duration, description, technologies } = req.body;

  experience.companyName = companyName || experience.companyName;
  experience.role = role || experience.role;
  experience.duration = duration || experience.duration;
  experience.description = description || experience.description;

  experience.technologies = Array.isArray(technologies)
    ? technologies
    : typeof technologies === "string"
      ? technologies.split(",").map(tech => tech.trim())
      : experience.technologies;

  await experience.save();

  res.json(generateApiResponse(true, "Experience updated", experience));

});

// @desc    Delete an experience
// @route   DELETE /api/experiences/:id
// @access  Private
export const deleteExperience = asyncHandler(async (req, res) => {
  const experience = await Experience.findById(req.params.id);

  if (!experience) {
    return res.status(404).json(generateApiResponse(false, 'Experience not found', null, 404));
  }

  if (experience.user.toString() !== req.user._id.toString()) {
    return res.status(403).json(generateApiResponse(false, 'Not authorized to delete this experience', null, 403));
  }

  await experience.deleteOne();
  res.json(generateApiResponse(true, 'Experience deleted'));
});