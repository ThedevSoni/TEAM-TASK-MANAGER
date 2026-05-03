import Project from '../models/Project.js';
import Task from '../models/Task.js';
import asyncHandler from '../utils/asyncHandler.js';

// Builds summary numbers for the logged-in user's accessible projects.
export const getDashboard = asyncHandler(async (req, res) => {
  // First find all projects where the user is admin or member.
  const projects = await Project.find({
    $or: [{ admin: req.user._id }, { members: req.user._id }]
  }).select('_id');

  // Then load every task inside those projects.
  const projectIds = projects.map((project) => project._id);
  const tasks = await Task.find({ project: { $in: projectIds } })
    .populate('assignedTo', 'name email')
    .populate('project', 'name');

  // Prepare counters for charts and summary cards.
  const byStatus = {
    'To Do': 0,
    'In Progress': 0,
    Done: 0
  };
  const perUser = {};
  const now = new Date();
  const overdueTasks = [];

  // Walk through each task once and update all dashboard summaries.
  tasks.forEach((task) => {
    byStatus[task.status] += 1;

    const assigneeName = task.assignedTo?.name || 'Unassigned';
    perUser[assigneeName] = (perUser[assigneeName] || 0) + 1;

    if (task.status !== 'Done' && task.dueDate < now) {
      overdueTasks.push(task);
    }
  });

  // Send all dashboard data in one response so the frontend can render quickly.
  res.json({
    totalTasks: tasks.length,
    byStatus,
    perUser,
    overdueTasks
  });
});
