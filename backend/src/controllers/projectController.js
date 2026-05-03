import Project from '../models/Project.js';
import Task from '../models/Task.js';
import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

// Adds user details to project admin and member ids before sending projects out.
const populateProject = (query) => query
  .populate('admin', 'name email role')
  .populate('members', 'name email role');

// Shared permission check for actions only the project admin can perform.
const ensureProjectAdmin = (project, user) => {
  if (user.role !== 'Admin' || project.admin.toString() !== user._id.toString()) {
    throw new ApiError(403, 'Only the project admin can manage this project');
  }
};

// Lists projects where the logged-in user is either admin or member.
export const getProjects = asyncHandler(async (req, res) => {
  const projects = await populateProject(Project.find({
    $or: [
      { admin: req.user._id },
      { members: req.user._id }
    ]
  }).sort({ updatedAt: -1 }));

  res.json(projects);
});

// Creates a project and makes the creator both admin and initial member.
export const createProject = asyncHandler(async (req, res) => {
  const project = await Project.create({
    ...req.body,
    admin: req.user._id,
    members: [req.user._id]
  });

  const createdProject = await populateProject(Project.findById(project._id));
  res.status(201).json(createdProject);
});

// Returns one project after confirming the user has access to it.
export const getProject = asyncHandler(async (req, res) => {
  const project = await populateProject(Project.findById(req.params.id));

  if (!project) {
    throw new ApiError(404, 'Project not found');
  }

  // A project is visible to its admin and all users in the members list.
  const belongsToProject = project.admin._id.equals(req.user._id)
    || project.members.some((member) => member._id.equals(req.user._id));

  if (!belongsToProject) {
    throw new ApiError(403, 'You do not have access to this project');
  }

  res.json(project);
});

// Adds a user to a project member list.
export const addMember = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) throw new ApiError(404, 'Project not found');

  ensureProjectAdmin(project, req.user);

  // Confirm the target user exists before adding their id to the project.
  const user = await User.findById(req.body.userId);
  if (!user) throw new ApiError(404, 'User not found');

  // Avoid duplicate member ids if the user is already part of the project.
  if (!project.members.some((memberId) => memberId.equals(user._id))) {
    project.members.push(user._id);
    await project.save();
  }

  const updatedProject = await populateProject(Project.findById(project._id));
  res.json(updatedProject);
});

// Removes a member and reassigns their project tasks back to the admin.
export const removeMember = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) throw new ApiError(404, 'Project not found');

  ensureProjectAdmin(project, req.user);

  if (project.admin.equals(req.body.userId)) {
    throw new ApiError(400, 'Project admin cannot be removed');
  }

  // Remove the member id from the project, then keep old tasks assigned safely.
  project.members = project.members.filter((memberId) => memberId.toString() !== req.body.userId);
  await project.save();
  await Task.updateMany({ project: project._id, assignedTo: req.body.userId }, { assignedTo: req.user._id });

  const updatedProject = await populateProject(Project.findById(project._id));
  res.json(updatedProject);
});
