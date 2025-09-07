import asyncHandler from '../utils/asyncHandler.js';
import generateApiResponse from '../utils/generateApiResponse.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/user.model.js';

export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  const profilePicture = req.file ? `/uploads/${req.file.filename}` : null;

  // Check if user exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    return res
      .status(400)
      .json(generateApiResponse(false, "User already exist!", null, 400));
  }

  // Create user
  const user = await User.create({
    name,
    email,
    password,
    profilePicture,
  });

  if (user) {
    const token = generateToken(user._id);
    return res.status(201).json(
      generateApiResponse(
        true,
        "User registered successfully",
        {
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            profilePicture: user.profilePicture,
          },
          token,
        },
        201
      )
    );
  } else {
    return res
      .status(400)
      .json(generateApiResponse(false, "Invalid user data", null, 400));
  }
});

export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await user.comparePassword(password))) {
    const token = generateToken(user._id);
    return res.json(generateApiResponse(true, 'Login successful', {
      user: { id: user._id, name: user.name, email: user.email, profilePicture: user.profilePicture },
      token
    }));
  } else {
    return res.status(401).json(generateApiResponse(false, 'Invalid email or password', null, 401));
  }
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json(generateApiResponse(false, 'User not found', null, 404));
  }

  // Generate reset token
  const resetToken = crypto.randomBytes(20)?.toString('hex');
  user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  user.resetPasswordExpires = Date.now() + 3600000; // 1 hour expiry
  await user.save();

  // In a real app, send resetToken via email. Here, return it for simplicity.
  res.json(generateApiResponse(true, 'Reset token generated', { resetToken }));
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { password } = req.body;
  const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) {
    return res.status(400).json(generateApiResponse(false, 'Invalid or expired token', null, 400));
  }

  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  res.json(generateApiResponse(true, 'Password reset successful'));
});

export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('-password -resetPasswordToken -resetPasswordExpires');
  res.json(generateApiResponse(true, 'User profile fetched', user));
});

export const updateProfile = asyncHandler(async (req, res) => {
  const { name, email } = req.body;
  const profilePicture = req.file ? `/uploads/${req.file.filename}` : null;

  const user = await User.findById(req.user._id);

  if (!user) {
    return res.status(404).json(generateApiResponse(false, 'User not found', null, 404));
  }

  user.name = name || user.name;
  user.email = email || user.email;
  if (profilePicture) user.profilePicture = profilePicture;

  await user.save();

  res.json(generateApiResponse(true, 'Profile updated', {
    user: { id: user._id, name: user.name, email: user.email, profilePicture: user.profilePicture }
  }));
});

export const createUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  const profilePicture = req.file ? `/uploads/${req.file.filename}` : null;

  const userExists = await User.findOne({ email });
  if (userExists) {
    return res
      .status(400)
      .json(generateApiResponse(false, "User already exists", null, 400));
  }

  const user = await User.create({ name, email, password, profilePicture });

  if (user) {
    res.status(201).json(
      generateApiResponse(true, "User created successfully", {
        id: user._id,
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture,
      })
    );
  } else {
    res
      .status(400)
      .json(generateApiResponse(false, "Invalid user data", null, 400));
  }
});

export const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find({}).select("-password -resetPasswordToken -resetPasswordExpires");

  if (!users || users.length === 0) {
    return res
      .status(404)
      .json(generateApiResponse(false, "No users found", null, 404));
  }

  res.json(
    generateApiResponse(true, "Users fetched successfully", users, 200)
  );
});

export const updateUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  const profilePicture = req.file ? `/uploads/${req.file.filename}` : null;

  const user = await User.findById(req.params.id);

  if (!user) {
    return res
      .status(404)
      .json(generateApiResponse(false, "User not found", null, 404));
  }

  user.name = name || user.name;
  user.email = email || user.email;
  if (password) user.password = password;
  if (profilePicture) user.profilePicture = profilePicture;

  await user.save();

  res.json(
    generateApiResponse(true, "User updated successfully", {
      id: user._id,
      name: user.name,
      email: user.email,
      profilePicture: user.profilePicture,
    })
  );
});

export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return res
      .status(404)
      .json(generateApiResponse(false, "User not found", null, 404));
  }

  await user.deleteOne();

  res.json(generateApiResponse(true, "User deleted successfully", null, 200));
});


export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;

  // Validate input
  if (!currentPassword || !newPassword || !confirmPassword) {
    return res
      .status(400)
      .json(generateApiResponse(false, "All password fields are required", null, 400));
  }

  // Check if newPassword matches confirmPassword
  if (newPassword !== confirmPassword) {
    return res
      .status(400)
      .json(generateApiResponse(false, "New passwords do not match", null, 400));
  }

  // Validate password requirements
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  if (!passwordRegex.test(newPassword)) {
    return res
      .status(400)
      .json(generateApiResponse(
        false,
        "Password must be at least 8 characters long, contain uppercase and lowercase letters, a number, and a special character",
        null,
        400
      ));
  }

  // Find user by ID from JWT (req.user is set by auth middleware)
  const user = await User.findById(req.user._id);
  if (!user) {
    return res
      .status(404)
      .json(generateApiResponse(false, "User not found", null, 404));
  }

  // Verify current password
  const isPasswordValid = await user.comparePassword(currentPassword);
  if (!isPasswordValid) {
    return res
      .status(401)
      .json(generateApiResponse(false, "Current password is incorrect", null, 401));
  }

  // Update password
  user.password = newPassword;
  await user.save();

  res.json(generateApiResponse(true, "Password updated successfully", null, 200));
});


const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

