import { useEffect, useMemo, useState } from 'react';
import TaskBoard from '../components/TaskBoard';
import { useAuth } from '../context/AuthContext';
import { projectApi, taskApi, userApi } from '../services/api';

// Blank project form values used after creating a project.
const emptyProject = { name: '', description: '' };

// Blank task form values used for creating a fresh task.
const emptyTask = {
  title: '',
  description: '',
  dueDate: '',
  priority: 'Medium',
  status: 'To Do',
  assignedTo: ''
};

export default function Project() {
  // Logged-in user decides which admin/member controls are visible.
  const { user } = useAuth();

  // Main page data loaded from the backend.
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [tasks, setTasks] = useState([]);

  // Form state for creating projects and creating/editing tasks.
  const [projectForm, setProjectForm] = useState(emptyProject);
  const [taskForm, setTaskForm] = useState(emptyTask);
  const [editingTaskId, setEditingTaskId] = useState('');

  // Selected member id for the "Add user" dropdown.
  const [memberId, setMemberId] = useState('');

  // User-facing status messages.
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // Find the full project object for the selected project id.
  const selectedProject = useMemo(
    () => projects.find((project) => project._id === selectedProjectId),
    [projects, selectedProjectId]
  );

  // Only the Admin who owns the project can manage members.
  const canAdminProject = user?.role === 'Admin' && selectedProject?.admin?._id === user?._id;

  // Load projects and auto-select the first project when none is selected.
  const loadProjects = async () => {
    const { data } = await projectApi.list();
    setProjects(data);
    if (!selectedProjectId && data.length > 0) {
      setSelectedProjectId(data[0]._id);
    }
  };

  // Load tasks for the selected project; clear tasks when no project is selected.
  const loadTasks = async (projectId) => {
    if (!projectId) {
      setTasks([]);
      return;
    }

    const { data } = await taskApi.list(projectId);
    setTasks(data);
  };

  // Initial page load fetches projects and users in parallel.
  useEffect(() => {
    Promise.all([loadProjects(), userApi.list().then(({ data }) => setUsers(data))])
      .catch((err) => setError(err.response?.data?.message || 'Unable to load project data'));
  }, []);

  // Reload tasks whenever the selected project changes.
  useEffect(() => {
    loadTasks(selectedProjectId).catch((err) => setError(err.response?.data?.message || 'Unable to load tasks'));
  }, [selectedProjectId]);

  // Pick the first project member as the default task assignee.
  useEffect(() => {
    if (selectedProject?.members?.length && !taskForm.assignedTo) {
      setTaskForm((current) => ({ ...current, assignedTo: selectedProject.members[0]._id }));
    }
  }, [selectedProject]);

  // Create a new project from the project form.
  const handleProjectSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');

    try {
      const { data } = await projectApi.create(projectForm);
      setProjects((current) => [data, ...current]);
      setSelectedProjectId(data._id);
      setProjectForm(emptyProject);
      setMessage('Project created');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to create project');
    }
  };

  // Create a new task or update the task currently being edited.
  const handleTaskSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');

    const payload = {
      ...taskForm,
      project: selectedProjectId
    };

    try {
      if (editingTaskId) {
        const { data } = await taskApi.update(editingTaskId, payload);
        setTasks((current) => current.map((task) => (task._id === data._id ? data : task)));
        setEditingTaskId('');
        setMessage('Task updated');
      } else {
        const { data } = await taskApi.create(payload);
        setTasks((current) => [...current, data]);
        setMessage('Task created');
      }

      // Reset the form after a successful create/update.
      setTaskForm({
        ...emptyTask,
        assignedTo: selectedProject?.members?.[0]?._id || ''
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to save task');
    }
  };

  // Put an existing task into the form for editing.
  const editTask = (task) => {
    setEditingTaskId(task._id);
    setTaskForm({
      title: task.title,
      description: task.description,
      dueDate: task.dueDate.slice(0, 10),
      priority: task.priority,
      status: task.status,
      assignedTo: task.assignedTo?._id || ''
    });
  };

  // Delete a task and remove it from local state after the backend succeeds.
  const deleteTask = async (id) => {
    setError('');
    setMessage('');

    try {
      await taskApi.remove(id);
      setTasks((current) => current.filter((task) => task._id !== id));
      setMessage('Task deleted');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to delete task');
    }
  };

  // Drag-and-drop status change handler.
  const changeStatus = async (task, status) => {
    try {
      const { data } = await taskApi.update(task._id, { status });
      setTasks((current) => current.map((item) => (item._id === data._id ? data : item)));
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to update task status');
    }
  };

  // Add the selected user to the current project's members.
  const addMember = async () => {
    if (!memberId || !selectedProjectId) return;
    setError('');

    try {
      const { data } = await projectApi.addMember(selectedProjectId, memberId);
      setProjects((current) => current.map((project) => (project._id === data._id ? data : project)));
      setMemberId('');
      setMessage('Member added');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to add member');
    }
  };

  // Remove a user from the current project's members.
  const removeMember = async (id) => {
    setError('');

    try {
      const { data } = await projectApi.removeMember(selectedProjectId, id);
      setProjects((current) => current.map((project) => (project._id === data._id ? data : project)));
      setMessage('Member removed');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to remove member');
    }
  };

  return (
    <div className="space-y-6">
      {/* Project page heading and project selector. */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="text-2xl font-semibold text-slate-950">Projects</h1>
          <p className="mt-1 text-sm text-slate-600">Create projects, manage members, and move work through the board.</p>
        </div>
        <select
          className="field max-w-sm"
          value={selectedProjectId}
          onChange={(event) => setSelectedProjectId(event.target.value)}
        >
          <option value="">Select a project</option>
          {projects.map((project) => (
            <option key={project._id} value={project._id}>{project.name}</option>
          ))}
        </select>
      </div>

      {/* Feedback messages from create/update/delete actions. */}
      {error && <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {message && <p className="rounded-md bg-emerald-50 p-3 text-sm text-emerald-700">{message}</p>}

      {/* Admin-only form for creating new projects. */}
      {user?.role === 'Admin' && (
        <form className="panel grid gap-3 p-4 md:grid-cols-[1fr_2fr_auto]" onSubmit={handleProjectSubmit}>
          <input
            className="field"
            placeholder="Project name"
            value={projectForm.name}
            onChange={(event) => setProjectForm((current) => ({ ...current, name: event.target.value }))}
            required
          />
          <input
            className="field"
            placeholder="Description"
            value={projectForm.description}
            onChange={(event) => setProjectForm((current) => ({ ...current, description: event.target.value }))}
          />
          <button type="submit" className="btn btn-primary">Create project</button>
        </form>
      )}

      {selectedProject ? (
        <div className="grid gap-6 xl:grid-cols-[320px_1fr]">
          <aside className="space-y-4">
            {/* Selected project summary. */}
            <section className="panel p-4">
              <h2 className="text-sm font-semibold text-slate-900">{selectedProject.name}</h2>
              <p className="mt-2 text-sm text-slate-600">{selectedProject.description || 'No description'}</p>
              <p className="mt-3 text-xs text-slate-500">Admin: {selectedProject.admin?.name}</p>
            </section>

            {/* Project members list and admin-only member controls. */}
            <section className="panel p-4">
              <h2 className="text-sm font-semibold text-slate-900">Members</h2>
              <div className="mt-3 space-y-2">
                {selectedProject.members?.map((member) => (
                  <div key={member._id} className="flex items-center justify-between gap-2 rounded-md bg-slate-50 px-3 py-2">
                    <div>
                      <p className="text-sm font-medium text-slate-800">{member.name}</p>
                      <p className="text-xs text-slate-500">{member.email}</p>
                    </div>
                    {canAdminProject && member._id !== selectedProject.admin?._id && (
                      <button type="button" className="text-xs font-medium text-slate-950 hover:text-slate-700" onClick={() => removeMember(member._id)}>
                        Remove
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {canAdminProject && (
                <div className="mt-4 flex gap-2">
                  <select className="field" value={memberId} onChange={(event) => setMemberId(event.target.value)}>
                    <option value="">Add user</option>
                    {users.map((item) => (
                      <option key={item._id} value={item._id}>{item.name} ({item.role})</option>
                    ))}
                  </select>
                  <button type="button" className="btn btn-secondary" onClick={addMember}>Add</button>
                </div>
              )}
            </section>

            {/* Task form switches between create mode and edit mode. */}
            <section className="panel p-4">
              <h2 className="text-sm font-semibold text-slate-900">{editingTaskId ? 'Edit task' : 'Create task'}</h2>
              <form className="mt-4 space-y-3" onSubmit={handleTaskSubmit}>
                <input
                  className="field"
                  placeholder="Title"
                  value={taskForm.title}
                  onChange={(event) => setTaskForm((current) => ({ ...current, title: event.target.value }))}
                  required
                />
                <textarea
                  className="field min-h-24"
                  placeholder="Description"
                  value={taskForm.description}
                  onChange={(event) => setTaskForm((current) => ({ ...current, description: event.target.value }))}
                />
                <input
                  className="field"
                  type="date"
                  value={taskForm.dueDate}
                  onChange={(event) => setTaskForm((current) => ({ ...current, dueDate: event.target.value }))}
                  required
                />
                <select className="field" value={taskForm.priority} onChange={(event) => setTaskForm((current) => ({ ...current, priority: event.target.value }))}>
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                </select>
                <select className="field" value={taskForm.status} onChange={(event) => setTaskForm((current) => ({ ...current, status: event.target.value }))}>
                  <option>To Do</option>
                  <option>In Progress</option>
                  <option>Done</option>
                </select>
                <select className="field" value={taskForm.assignedTo} onChange={(event) => setTaskForm((current) => ({ ...current, assignedTo: event.target.value }))} required>
                  {selectedProject.members?.map((member) => (
                    <option key={member._id} value={member._id}>{member.name}</option>
                  ))}
                </select>
                <div className="flex gap-2">
                  <button type="submit" className="btn btn-primary">{editingTaskId ? 'Update task' : 'Create task'}</button>
                  {editingTaskId && (
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => {
                        setEditingTaskId('');
                        setTaskForm({ ...emptyTask, assignedTo: selectedProject.members?.[0]?._id || '' });
                      }}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </section>
          </aside>

          {/* Kanban-style board for tasks in the selected project. */}
          <TaskBoard
            tasks={tasks}
            currentUser={user}
            projectAdminId={selectedProject.admin?._id}
            onStatusChange={changeStatus}
            onEdit={editTask}
            onDelete={deleteTask}
          />
        </div>
      ) : (
        // Empty state shown before a project exists or is selected.
        <section className="panel p-8 text-center text-sm text-slate-600">
          Create or select a project to start managing tasks.
        </section>
      )}
    </div>
  );
}
