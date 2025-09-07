import asyncHandler from '../utils/asyncHandler.js';
import generateApiResponse from '../utils/generateApiResponse.js';
import Blog from '../models/blog.model.js';
import slugify from 'slugify'; // Assuming slugify is installed for generating slugs

// @desc    Get all blogs
// @route   GET /api/blogs
// @access  Public
export const getBlogs = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const blogs = await Blog.find({ user: userId }).populate('authorId', 'name email');
  res.json(generateApiResponse(true, 'Blogs fetched', blogs));
});

// @desc    Get single blog
// @route   GET /api/blogs/:slug
// @access  Public
export const getBlogBySlug = asyncHandler(async (req, res) => {
  const blog = await Blog.findOne({ slug: req.params.slug }).populate('authorId', 'name email');
  if (blog) {
    res.json(generateApiResponse(true, 'Blog fetched', blog));
  } else {
    res.status(404).json(generateApiResponse(false, 'Blog not found', null, 404));
  }
});

// @desc    Create a blog
// @route   POST /api/blogs
// @access  Private
export const createBlog = asyncHandler(async (req, res) => {
  const { title, content, tags } = req.body;

  // Generate slug from title
  const slug = slugify(title, { lower: true, strict: true });

  // Check if slug already exists
  const slugExists = await Blog.findOne({ slug });
  if (slugExists) {
    return res.status(400).json(generateApiResponse(false, 'Blog with this title already exists', null, 400));
  }

  let normalizedTags = [];

  if (typeof tags === "string") {
    normalizedTags = tags.split(",").map(tag => tag.trim());
  } else if (Array.isArray(tags)) {
    normalizedTags = tags.map(tag => tag.trim());
  }

  const blog = await Blog.create({
    title,
    slug,
    content,
    tags: normalizedTags,
    authorId: req.user._id,
    publishedAt: Date.now(),
  });

  res.status(201).json(generateApiResponse(true, 'Blog created', blog, 201));
});

// @desc    Update a blog
// @route   PUT /api/blogs/:id
// @access  Private
export const updateBlog = asyncHandler(async (req, res) => {
  const blog = await Blog.findById(req.params.id);


  if (!blog) {
    return res.status(404).json(generateApiResponse(false, 'Blog not found', null, 404));
  }

  if (blog.authorId.toString() !== req.user._id.toString()) {
    return res.status(403).json(generateApiResponse(false, 'Not authorized to update this blog', null, 403));
  }

  const { title, content, tags } = req.body;

  // Update slug if title changes
  if (title && title !== blog.title) {
    const newSlug = slugify(title, { lower: true, strict: true });
    const slugExists = await Blog.findOne({ slug: newSlug, _id: { $ne: blog._id } });
    if (slugExists) {
      return res.status(400).json(generateApiResponse(false, 'Blog with this title already exists', null, 400));
    }
    blog.slug = newSlug;
  }

  let normalizedTags = [];

  if (typeof tags === "string") {
    normalizedTags = tags.split(",").map(tag => tag.trim());
  } else if (Array.isArray(tags)) {
    normalizedTags = tags.map(tag => tag.trim());
  }

  blog.title = title || blog.title;
  blog.content = content || blog.content;
  blog.tags = normalizedTags.length > 0 ? normalizedTags : blog.tags;
  blog.publishedAt = Date.now();

  await blog.save();

  res.json(generateApiResponse(true, 'Blog updated', blog));
});

// @desc    Delete a blog
// @route   DELETE /api/blogs/:id
// @access  Private
export const deleteBlog = asyncHandler(async (req, res) => {
  const blog = await Blog.findById(req.params.id);

  if (!blog) {
    return res.status(404).json(generateApiResponse(false, 'Blog not found', null, 404));
  }

  if (blog.authorId.toString() !== req.user._id.toString()) {
    return res.status(403).json(generateApiResponse(false, 'Not authorized to delete this blog', null, 403));
  }

  await blog.deleteOne();
  res.json(generateApiResponse(true, 'Blog deleted'));
});