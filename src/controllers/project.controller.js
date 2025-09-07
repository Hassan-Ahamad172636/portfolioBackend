import asyncHandler from '../utils/asyncHandler.js';
import generateApiResponse from '../utils/generateApiResponse.js';
import Project from '../models/project.model.js';

// @desc    Get all projects
// @route   GET /api/projects
// @access  Public
export const getProjects = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  const projects = await Project.find({ user: userId });
  res.json(generateApiResponse(true, 'Projects fetched', projects));
});

export const getPublicProjects = asyncHandler(async (req, res) => {
  const projects = await Project.find();

  if (!projects || projects.length === 0) {
    return res
      .status(404)
      .json(generateApiResponse(false, 'No active projects found for this user', null, 404));
  }

  res.json(
    generateApiResponse(true, 'Public projects fetched successfully', projects, 200)
  );
});

// @desc    Get single project
// @route   GET /api/projects/:id
// @access  Public
export const getProjectById = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (project) {
    res.json(generateApiResponse(true, 'Project fetched', project));
  } else {
    res.status(404).json(generateApiResponse(false, 'Project not found', null, 404));
  }
});

// @desc    Create a project
// @route   POST /api/projects
// @access  Private
export const createProject = asyncHandler(async (req, res) => {
  const { title, description, techStack, githubLink, liveLink, status } = req.body;
  const images = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];

  const project = await Project.create({
    user: req.user._id,
    title,
    description,
    techStack: techStack ? techStack.split(',').map(tech => tech.trim()) : [],
    githubLink,
    liveLink,
    images,
    status,
  });

  res.status(201).json(generateApiResponse(true, 'Project created', project, 201));
});

// @desc    Update a project
// @route   PUT /api/projects/:id
// @access  Private
export const updateProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);

  if (!project) {
    return res.status(404).json(generateApiResponse(false, 'Project not found', null, 404));
  }

  // if (project.user?.toString() !== req.user._id?.toString()) {
  //   return res.status(403).json(generateApiResponse(false, 'Not authorized to update this project', null, 403));
  // }

  const { title, description, techStack, githubLink, liveLink, status } = req.body;
  const images = req.files ? req.files.map(file => `/uploads/${file.filename}`) : project.images;

  project.title = title || project.title;
  project.description = description || project.description;
  project.techStack = techStack ? techStack.split(',').map(tech => tech.trim()) : project.techStack;
  project.githubLink = githubLink || project.githubLink;
  project.liveLink = liveLink || project.liveLink;
  project.images = images;
  project.status = status || project.status;

  await project.save();

  res.json(generateApiResponse(true, 'Project updated', project));
});

// @desc    Delete a project
// @route   DELETE /api/projects/:id
// @access  Private
export const deleteProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);

  if (!project) {
    return res.status(404).json(generateApiResponse(false, 'Project not found', null, 404));
  }

  // if (project.user.toString() !== req.user._id.toString()) {
  //   return res.status(403).json(generateApiResponse(false, 'Not authorized to delete this project', null, 403));
  // }

  await project.deleteOne();
  res.json(generateApiResponse(true, 'Project deleted'));

});