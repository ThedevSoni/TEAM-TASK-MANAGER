import express from 'express';
import {
  addMember,
  createProject,
  getProject,
  getProjects,
  removeMember
} from '../controllers/projectController.js';
import { authorize, protect } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validate.js';
import {
  projectIdSchema,
  projectMemberSchema,
  projectSchema
} from '../validators/schemas.js';

const router = express.Router();

// Every project route requires a valid login token.
router.use(protect);

// List accessible projects or create a new project as an Admin.
router.route('/')
  .get(getProjects)
  .post(authorize('Admin'), validate(projectSchema), createProject);

// Project details and member management routes validate MongoDB ids first.
router.get('/:id', validate(projectIdSchema), getProject);
router.post('/:id/members', authorize('Admin'), validate(projectMemberSchema), addMember);
router.delete('/:id/members', authorize('Admin'), validate(projectMemberSchema), removeMember);

export default router;
