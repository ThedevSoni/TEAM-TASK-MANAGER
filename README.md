# Team Task Manager

A production-ready MERN team task management application inspired by Trello and Asana. It includes JWT authentication, Admin/Member roles, project membership, task assignment, dashboard analytics, and a Tailwind-powered React UI.

## Folder Structure

```text
team-task-manager/
  backend/
    src/
      config/db.js
      controllers/
        authController.js
        dashboardController.js
        projectController.js
        taskController.js
        userController.js
      middleware/
        authMiddleware.js
        errorMiddleware.js
        validate.js
      models/
        Project.js
        Task.js
        User.js
      routes/
        authRoutes.js
        dashboardRoutes.js
        projectRoutes.js
        taskRoutes.js
        userRoutes.js
      utils/
        ApiError.js
        asyncHandler.js
        token.js
      validators/schemas.js
      app.js
      server.js
    .env.example
    package.json
  frontend/
    src/
      components/
        Navbar.jsx
        TaskBoard.jsx
        TaskCard.jsx
      context/AuthContext.jsx
      pages/
        Dashboard.jsx
        Login.jsx
        Project.jsx
      services/api.js
      App.jsx
      index.css
      main.jsx
    .env.example
    index.html
    package.json
    vite.config.js
```

## Features

- Signup and login with bcrypt password hashing.
- JWT protected API routes.
- Admin and Member roles with authorization middleware.
- Admin project creation and member management.
- Project listing scoped to current user membership.
- Task create, update, delete, assign, priority, due date, and status workflow.
- Admin or assigned-user task mutation permissions.
- Dashboard totals, tasks by status, tasks per user, and overdue tasks.
- React Context auth state and Axios API integration.
- Tailwind CSS UI with a Kanban-style board and drag-and-drop status updates.

## Local Setup

1. Start MongoDB locally or create a MongoDB Atlas database.
2. Copy environment files:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

3. Update `backend/.env`:

```bash
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_long_random_secret
CLIENT_URL=http://localhost:5173
```

4. Install dependencies:

```bash
cd backend
npm install
cd ../frontend
npm install
```

5. Run the backend:

```bash
cd backend
npm run dev
```

6. Run the frontend:

```bash
cd frontend
npm run dev
```

7. Open `http://localhost:5173`.

## Production Builds

```bash
cd frontend
npm run build

cd ../backend
npm start
```

## Railway Deployment

1. Create a Railway project.
2. Add a MongoDB service in Railway or use MongoDB Atlas.
3. Add the backend as a service from this repository with root directory `backend`.
4. Set backend environment variables:

```bash
NODE_ENV=production
PORT=5000
MONGO_URI=your_production_mongodb_uri
JWT_SECRET=your_long_random_secret
JWT_EXPIRES_IN=7d
CLIENT_URL=https://your-frontend-domain
```

5. Backend start command:

```bash
npm start
```

6. Add the frontend as another Railway service with root directory `frontend`.
7. Set frontend environment variable:

```bash
VITE_API_URL=https://your-backend-domain/api
```

8. Frontend build command:

```bash
npm run build
```

9. Frontend output directory:

```bash
dist
```

10. After deployment, update backend `CLIENT_URL` to the final frontend URL and redeploy.

## API Documentation

Base URL: `/api`

All protected endpoints require:

```http
Authorization: Bearer <jwt>
```

### Auth

`POST /auth/signup`

```json
{
  "name": "Admin User",
  "email": "admin@example.com",
  "password": "password123",
  "role": "Admin"
}
```

`POST /auth/login`

```json
{
  "email": "admin@example.com",
  "password": "password123"
}
```

`GET /auth/me`

Returns the current authenticated user.

### Users

`GET /users`

Returns users for assignment/member selection.

### Projects

`GET /projects`

Returns projects where the current user is admin or member.

`POST /projects` Admin only

```json
{
  "name": "Website Redesign",
  "description": "Launch the new marketing site"
}
```

`GET /projects/:id`

Returns one accessible project.

`POST /projects/:id/members` Admin only

```json
{
  "userId": "mongo_user_id"
}
```

`DELETE /projects/:id/members` Admin only

```json
{
  "userId": "mongo_user_id"
}
```

### Tasks

`GET /tasks`

Returns tasks across accessible projects.

`GET /tasks?project=<projectId>`

Returns tasks for one accessible project.

`POST /tasks`

```json
{
  "title": "Create wireframes",
  "description": "Prepare desktop and mobile wireframes",
  "dueDate": "2026-06-01",
  "priority": "High",
  "status": "To Do",
  "project": "mongo_project_id",
  "assignedTo": "mongo_user_id"
}
```

`PATCH /tasks/:id`

```json
{
  "status": "In Progress",
  "priority": "Medium"
}
```

`DELETE /tasks/:id`

Admin or assigned user only.

### Dashboard

`GET /dashboard`

Returns:

```json
{
  "totalTasks": 10,
  "byStatus": {
    "To Do": 4,
    "In Progress": 3,
    "Done": 3
  },
  "perUser": {
    "Admin User": 5
  },
  "overdueTasks": []
}
```

## Notes

- Email notifications and activity logs are good next additions. The current app already includes the requested drag-and-drop task board bonus.
- Use a strong `JWT_SECRET` in production.
- Keep MongoDB network access restricted to Railway or your deployment hosts.
