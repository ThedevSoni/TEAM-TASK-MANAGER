import express from 'express';
import {
  createTask,
  deleteTask,
  getTasks,
  updateTask
} from '../controllers/taskController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validate.js';
import {
  taskCreateSchema,
  taskIdSchema,
  taskListSchema,
  taskUpdateSchema
} from '../validators/schemas.js';

const router = express.Router();

// Every task route requires a valid login token.
router.use(protect);

// List tasks for a selected project or create a task in the current project.
router.route('/')
  .get(validate(taskListSchema), getTasks)
  .post(validate(taskCreateSchema), createTask);

// Update or delete one task by id.
router.route('/:id')
  .patch(validate(taskUpdateSchema), updateTask)
  .delete(validate(taskIdSchema), deleteTask);

export default router;
