import { z } from 'zod';

// Reusable MongoDB ObjectId validator for route params and payload ids.
const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid MongoDB ObjectId');

// Validates the request body for creating an account.
export const signupSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2),
    email: z.email().trim().toLowerCase(),
    password: z.string().min(8),
    role: z.enum(['Admin', 'Member']).default('Member')
  }),
  params: z.object({}).default({}),
  query: z.object({}).default({})
});

// Validates the request body for logging in.
export const loginSchema = z.object({
  body: z.object({
    email: z.email().trim().toLowerCase(),
    password: z.string().min(1)
  }),
  params: z.object({}).default({}),
  query: z.object({}).default({})
});

// Validates project creation input.
export const projectSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2),
    description: z.string().trim().optional().default('')
  }),
  params: z.object({}).default({}),
  query: z.object({}).default({})
});

// Validates routes that only need a project id.
export const projectIdSchema = z.object({
  body: z.object({}).default({}),
  params: z.object({ id: objectId }),
  query: z.object({}).default({})
});

// Validates adding or removing a project member.
export const projectMemberSchema = z.object({
  body: z.object({ userId: objectId }),
  params: z.object({ id: objectId }),
  query: z.object({}).default({})
});

// Validates all required fields for creating a task.
export const taskCreateSchema = z.object({
  body: z.object({
    title: z.string().trim().min(2),
    description: z.string().trim().optional().default(''),
    dueDate: z.coerce.date(),
    priority: z.enum(['Low', 'Medium', 'High']).default('Medium'),
    status: z.enum(['To Do', 'In Progress', 'Done']).default('To Do'),
    project: objectId,
    assignedTo: objectId
  }),
  params: z.object({}).default({}),
  query: z.object({}).default({})
});

// Validates optional query filters for listing tasks.
export const taskListSchema = z.object({
  body: z.object({}).default({}),
  params: z.object({}).default({}),
  query: z.object({
    project: objectId.optional()
  }).default({})
});

// Validates editable fields when updating a task.
export const taskUpdateSchema = z.object({
  body: z.object({
    title: z.string().trim().min(2).optional(),
    description: z.string().trim().optional(),
    dueDate: z.coerce.date().optional(),
    priority: z.enum(['Low', 'Medium', 'High']).optional(),
    status: z.enum(['To Do', 'In Progress', 'Done']).optional(),
    assignedTo: objectId.optional()
  }),
  params: z.object({ id: objectId }),
  query: z.object({}).default({})
});

// Validates routes that only need a task id.
export const taskIdSchema = z.object({
  body: z.object({}).default({}),
  params: z.object({ id: objectId }),
  query: z.object({}).default({})
});
