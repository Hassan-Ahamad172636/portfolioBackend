import Experience from '../models/expirence.model.js';
import Project from '../models/project.model.js';
import Skill from '../models/skill.model.js';
import User from '../models/user.model.js';
import asyncHandler from '../utils/asyncHandler.js';
import generateApiResponse from '../utils/generateApiResponse.js';

// @desc    Get user-specific dashboard analytics data
// @route   GET /api/dashboard/analytics
// @access  Private
export const getDashboardAnalytics = asyncHandler(async (req, res) => {
  const userId = req.user._id; // Get authenticated user's ID
  const now = new Date('2025-09-07T14:50:00Z'); // Current date: Sep 7, 2025, 2:50 PM PKT
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1); // Start of 6 months ago
  const startOfYear = new Date(now.getFullYear(), 0, 1); // Jan 1, 2025
  const lastYearStart = new Date(now.getFullYear() - 1, 0, 1); // Jan 1, 2024
  const sixYearsAgo = new Date(now.getFullYear() - 5, 0, 1); // Jan 1, 2020

  // User Growth Data (last 6 months, user-specific activity)
  const months = Array.from({ length: 6 }, (_, i) => {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    return {
      month: date.toLocaleString('en-US', { month: 'short' }),
      start: new Date(date.getFullYear(), date.getMonth(), 1),
      end: new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999),
    };
  }).reverse();

  const userGrowthData = await Promise.all(
    months.map(async ({ month, start, end }) => {
      const [projectCount, skillCount] = await Promise.all([
        Project.countDocuments({ user: userId, createdAt: { $gte: start, $lte: end } }),
        Skill.countDocuments({ user: userId, createdAt: { $gte: start, $lte: end } }),
      ]);
      return { month, projects: projectCount, skills: skillCount };
    })
  );

  // Skills Distribution (user-specific)
  const skillsDistribution = await Skill.aggregate([
    { $match: { user: userId } }, // Filter by user
    {
      $group: {
        _id: { $toLower: '$category' }, // Case-insensitive grouping
        value: { $sum: 1 },
      },
    },
    {
      $match: {
        _id: { $in: ['frontend', 'backend', 'qa'] },
      },
    },
    {
      $project: {
        name: {
          $switch: {
            branches: [
              { case: { $eq: ['$_id', 'frontend'] }, then: 'Frontend' },
              { case: { $eq: ['$_id', 'backend'] }, then: 'Backend' },
              { case: { $eq: ['$_id', 'qa'] }, then: 'QA' },
            ],
            default: 'Other',
          },
        },
        value: 1,
        color: {
          $switch: {
            branches: [
              { case: { $eq: ['$_id', 'frontend'] }, then: '#38BDF8' },
              { case: { $eq: ['$_id', 'backend'] }, then: '#A78BFA' },
              { case: { $eq: ['$_id', 'qa'] }, then: '#22C55E' },
            ],
            default: '#94A3B8',
          },
        },
      },
    },
    { $sort: { name: 1 } },
  ]);

  // Project Status (user-specific)
  const projectStatusData = await Project.aggregate([
    { $match: { user: userId } }, // Filter by user
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        status: {
          $cond: {
            if: { $eq: ['$_id', 'active'] },
            then: 'Active',
            else: 'Archived',
          },
        },
        count: 1,
        color: {
          $cond: {
            if: { $eq: ['$_id', 'active'] },
            then: '#22C55E',
            else: '#94A3B8',
          },
        },
      },
    },
    { $sort: { status: 1 } },
  ]);

  // Experience Growth (last 6 years, user-specific)
  const years = Array.from({ length: 6 }, (_, i) => {
    const year = now.getFullYear() - i;
    return {
      year: year.toString(),
      start: new Date(year, 0, 1),
      end: new Date(year, 11, 31, 23, 59, 59, 999),
    };
  }).reverse();

  const experienceData = await Promise.all(
    years.map(async ({ year, start, end }) => {
      const experiences = await Experience.find({
        user: userId,
        createdAt: { $gte: start, $lte: end },
      });
      const companies = [...new Set(experiences.map((exp) => exp.companyName))].length;
      const roles = experiences.length;
      return { year, companies, roles };
    })
  );

  // Stats Calculations (user-specific)
  const [activeProjects, totalSkills, totalExperiences, lastYearProjects, lastYearSkills] = await Promise.all([
    Project.countDocuments({ user: userId, status: 'active' }),
    Skill.countDocuments({ user: userId }),
    Experience.countDocuments({ user: userId }),
    Project.countDocuments({ user: userId, status: 'active', createdAt: { $gte: lastYearStart, $lt: startOfYear } }),
    Skill.countDocuments({ user: userId, createdAt: { $gte: lastYearStart, $lt: startOfYear } }),
  ]);

  // Calculate experience years
  const experiences = await Experience.find({ user: userId });
  const totalExperienceYears = experiences.reduce((acc, exp) => {
    const match = exp.duration?.match(/(\d+)\s*year/);
    return acc + (match ? parseInt(match[1], 10) : 1); // Default to 1 year per experience if duration is unclear
  }, 0);

  // Calculate percentage changes (2025 vs. 2024)
  const calcChange = (current, last) => {
    if (last === 0) return current > 0 ? '+100%' : '0%';
    const change = ((current - last) / last) * 100;
    return change > 0 ? `+${change.toFixed(1)}%` : `${change.toFixed(1)}%`;
  };

  const stats = [
    {
      title: 'Active Projects',
      value: activeProjects.toLocaleString(),
      change: calcChange(activeProjects, lastYearProjects),
      icon: 'Briefcase',
      color: 'text-secondary-accent',
      bgColor: 'bg-secondary-accent/10',
    },
    {
      title: 'Skills Tracked',
      value: totalSkills.toLocaleString(),
      change: calcChange(totalSkills, lastYearSkills),
      icon: 'Code',
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
    {
      title: 'Experience Years',
      value: `${totalExperienceYears}+`,
      change: totalExperienceYears > 0 ? '+5.7%' : '0%', // Static or zero if no experience
      icon: 'Award',
      color: 'text-warning',
      bgColor: 'bg-warning/10',
    },
  ];

  // Response
  res.json(
    generateApiResponse(true, 'User dashboard analytics fetched', {
      userGrowthData,
      skillsDistribution,
      projectStatusData,
      experienceData,
      stats,
    })
  );
});