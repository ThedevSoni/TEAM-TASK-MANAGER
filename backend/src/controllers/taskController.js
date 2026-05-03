import Project from '../models/Project.js';
import Task from '../models/Task.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

// Adds related project/user details to task query results.
const populateTask = (query) => query
  .populate('project', 'name')
  .populate('assignedTo', 'name email role')
  .populate('createdBy', 'name email role');

// Loads a project and confirms the current user can access it.
const findAccessibleProject = async (projectId, user) => {
  const project = await Project.findById(projectId);
  if (!project) throw new ApiError(404, 'Project not found');

  // Access is allowed for project members and the project admin.
  const isMember = project.members.some((memberId) => memberId.equals(user._id));
  const isAdmin = project.admin.equals(user._id);

  if (!isMember && !isAdmin) {
    throw new ApiError(403, 'You do not have access to this project');
  }

  return project;
};

// Confirms a user can edit/delete a task.
const ensureTaskPermission = async (task, user) => {
  const project = await Project.findById(task.project);
  if (!project) throw new ApiError(404, 'Project not found');

  // Project admins can manage all project tasks; assigned users can manage their own.
  const isProjectAdmin = user.role === 'Admin' && project.admin.equals(user._id);
  const isAssignedUser = task.assignedTo.equals(user._id);

  if (!isProjectAdmin && !isAssignedUser) {
    throw new ApiError(403, 'Only the project admin or assigned user can modify this task');
  }

  return project;
};

// Lists tasks from all accessible projects or from one selected project.
export const getTasks = asyncHandler(async (req, res) => {
  const { project } = req.validatedQuery;
  // Find project ids the current user is allowed to see.
  const projects = await Project.find({
    $or: [{ admin: req.user._id }, { members: req.user._id }]
  }).select('_id');

  // Default filter includes tasks from all accessible projects.
  const projectIds = projects.map((project) => project._id);
  const filter = { project: { $in: projectIds } };

  // If a project id was provided, verify access and narrow the filter.
  if (project) {
    filter.project = project;
    await findAccessibleProject(project, req.user);
  }

  const tasks = await populateTask(Task.find(filter).sort({ dueDate: 1, createdAt: -1 }));
  res.json(tasks);
});

// Creates a new task inside a project the user can access.
export const createTask = asyncHandler(async (req, res) => {
  const project = await findAccessibleProject(req.body.project, req.user);
  // Tasks can only be assigned to users who belong to the project.
  const assigneeIsMember = project.members.some((memberId) => memberId.toString() === req.body.assignedTo);

  if (!assigneeIsMember) {
    throw new ApiError(400, 'Assigned user must be a project member');
  }

  // Save the task and remember who created it.
  const task = await Task.create({
    ...req.body,
    createdBy: req.user._id
  });

  const createdTask = await populateTask(Task.findById(task._id));
  res.status(201).json(createdTask);
});

// Updates an existing task after checking edit permissions.
export const updateTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) throw new ApiError(404, 'Task not found');

  const project = await ensureTaskPermission(task, req.user);

  // If the assignee changes, the new assignee must still be a project member.
  if (req.body.assignedTo) {
    const assigneeIsMember = project.members.some((memberId) => memberId.toString() === req.body.assignedTo);
    if (!assigneeIsMember) throw new ApiError(400, 'Assigned user must be a project member');
  }

  // Apply only validated fields from req.body.
  Object.assign(task, req.body);
  await task.save();

  const updatedTask = await populateTask(Task.findById(task._id));
  res.json(updatedTask);
});

// Deletes a task after checking edit permissions.
export const deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) throw new ApiError(404, 'Task not found');

  await ensureTaskPermission(task, req.user);
  await task.deleteOne();

  res.status(204).send();
});
