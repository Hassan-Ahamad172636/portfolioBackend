import asyncHandler from '../utils/asyncHandler.js';
import generateApiResponse from '../utils/generateApiResponse.js';
import Contact from '../models/contact.model.js';

// @desc    Get all contact messages
// @route   GET /api/contacts
// @access  Private
export const getContacts = asyncHandler(async (req, res) => {
  const contacts = await Contact.find({});
  res.json(generateApiResponse(true, 'Contact messages fetched', contacts));
});

// @desc    Get single contact message
// @route   GET /api/contacts/:id
// @access  Private
export const getContactById = asyncHandler(async (req, res) => {
  const contact = await Contact.findById(req.params.id);
  if (contact) {
    res.json(generateApiResponse(true, 'Contact message fetched', contact));
  } else {
    res.status(404).json(generateApiResponse(false, 'Contact message not found', null, 404));
  }
});

// @desc    Create a contact message
// @route   POST /api/contacts
// @access  Public
export const createContact = asyncHandler(async (req, res) => {
  const { name, email, message } = req.body;

  const contact = await Contact.create({
    name,
    email,
    message,
    status: 'unread',
  });

  res.status(201).json(generateApiResponse(true, 'Contact message created', contact, 201));
});

// @desc    Update a contact message
// @route   PUT /api/contacts/:id
// @access  Private
export const updateContact = asyncHandler(async (req, res) => {
  const contact = await Contact.findById(req.params.id);

  if (!contact) {
    return res.status(404).json(generateApiResponse(false, 'Contact message not found', null, 404));
  }

  // Assuming only admin can update contact status
  if (req.user.role !== 'admin') {
    return res.status(403).json(generateApiResponse(false, 'Not authorized to update this contact message', null, 403));
  }

  const { status } = req.body;

  contact.status = status || contact.status;

  await contact.save();

  res.json(generateApiResponse(true, 'Contact message updated', contact));
});

// @desc    Delete a contact message
// @route   DELETE /api/contacts/:id
// @access  Private
export const deleteContact = asyncHandler(async (req, res) => {
  const contact = await Contact.findById(req.params.id);

  if (!contact) {
    return res.status(404).json(generateApiResponse(false, 'Contact message not found', null, 404));
  }

  // Assuming only admin can delete contact messages
  if (req.user.role !== 'admin') {
    return res.status(403).json(generateApiResponse(false, 'Not authorized to delete this contact message', null, 403));
  }

  await contact.remove();
  res.json(generateApiResponse(true, 'Contact message deleted'));
});