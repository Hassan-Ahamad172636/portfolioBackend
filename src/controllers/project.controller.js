import asyncHandler from '../utils/asyncHandler.js';
import generateApiResponse from '../utils/generateApiResponse.js';
import Project from '../models/project.model.js';
import cloudinary from '../middlewares/cloudinaryMiddleware.js';

// Common function to format project response
const formatProjectResponse = (project) => ({
  _id: project._id,
  user: project.user,
  title: project.title,
  description: project.description,
  techStack: project.techStack,
  githubLink: project.githubLink,
  liveLink: project.liveLink,
  images: project.images,
  status: project.status,
});

// @desc    Get all projects for authenticated user
// @route   GET /api/projects/get-all
// @access  Private
export const getProjects = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  if (!userId) {
    return res.status(401).json(generateApiResponse(false, 'User not authenticated', null, 401));
  }

  const projects = await Project.find({ user: userId });
  if (!projects || projects.length === 0) {
    return res.status(404).json(generateApiResponse(false, 'No projects found', null, 404));
  }

  res.json(generateApiResponse(true, 'Projects fetched', projects.map(formatProjectResponse)));
});

// @desc    Get all public projects
// @route   GET /api/projects/public
// @access  Public
export const getPublicProjects = asyncHandler(async (req, res) => {
  const projects = await Project.find({}); // Only fetch public projects

  if (!projects || projects.length === 0) {
    return res.status(404).json(generateApiResponse(false, 'No public projects found', null, 404));
  }

  res.json(generateApiResponse(true, 'Public projects fetched successfully', projects.map(formatProjectResponse)));
});

// @desc    Get single project
// @route   GET /api/projects/get-by-id/:id
// @access  Public
export const getProjectById = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) {
    return res.status(404).json(generateApiResponse(false, 'Project not found', null, 404));
  }
  res.json(generateApiResponse(true, 'Project fetched', formatProjectResponse(project)));
});

// @desc    Create a project
// @route   POST /api/projects/create
// @access  Private
export const createProject = asyncHandler(async (req, res) => {
  const { title, description, techStack, githubLink, liveLink, status } = req.body;
  const images = req.files ? req.files.map(file => file.path) : []; // Cloudinary URLs

  // Input validation
  if (!title || !description) {
    return res.status(400).json(generateApiResponse(false, 'Title and description are required', null, 400));
  }

  const project = await Project.create({
    user: req.user._id,
    title,
    description,
    techStack: techStack ? techStack.split(',').map(tech => tech.trim()) : [],
    githubLink,
    liveLink,
    images,
    status: status || 'private', // Default to private if not specified
  });

  res.status(201).json(generateApiResponse(true, 'Project created', formatProjectResponse(project), 201));
});

// @desc    Update a project
// @route   PATCH /api/projects/update/:id
// @access  Private
export const updateProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);

  if (!project) {
    return res.status(404).json(generateApiResponse(false, 'Project not found', null, 404));
  }

  // Authorization check
  if (project.user.toString() !== req.user._id.toString()) {
    return res.status(403).json(generateApiResponse(false, 'Not authorized to update this project', null, 403));
  }

  const { title, description, techStack, githubLink, liveLink, status } = req.body;
  const newImages = req.files ? req.files.map(file => file.path) : null; // Cloudinary URLs

  // Delete old images from Cloudinary if new images are uploaded
  if (newImages && project.images.length > 0) {
    for (const imageUrl of project.images) {
      const publicId = imageUrl.split('/').pop().split('.')[0]; // Extract Cloudinary public ID
      await cloudinary.uploader.destroy(`portfolio_uploads/${publicId}`);
    }
  }

  // Update fields
  project.title = title || project.title;
  project.description = description || project.description;
  project.techStack = techStack ? techStack.split(',').map(tech => tech.trim()) : project.techStack;
  project.githubLink = githubLink || project.githubLink;
  project.liveLink = liveLink || project.liveLink;
  project.images = newImages || project.images;
  project.status = status || project.status;

  await project.save();

  res.json(generateApiResponse(true, 'Project updated', formatProjectResponse(project)));
});

// @desc    Delete a project
// @route   DELETE /api/projects/delete/:id
// @access  Private
export const deleteProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);

  if (!project) {
    return res.status(404).json(generateApiResponse(false, 'Project not found', null, 404));
  }

  // Authorization check
  if (project.user.toString() !== req.user._id.toString()) {
    return res.status(403).json(generateApiResponse(false, 'Not authorized to delete this project', null, 403));
  }

  // Delete images from Cloudinary
  if (project.images.length > 0) {
    for (const imageUrl of project.images) {
      const publicId = imageUrl.split('/').pop().split('.')[0]; // Extract Cloudinary public ID
      await cloudinary.uploader.destroy(`portfolio_uploads/${publicId}`);
    }
  }

  await project.deleteOne();
  res.json(generateApiResponse(true, 'Project deleted'));
});