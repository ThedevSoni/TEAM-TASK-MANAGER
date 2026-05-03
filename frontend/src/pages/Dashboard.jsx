import { useEffect, useState } from 'react';
import { dashboardApi } from '../services/api';

export default function Dashboard() {
  // Dashboard data starts empty and is filled after the API request succeeds.
  const [dashboard, setDashboard] = useState(null);
  const [error, setError] = useState('');

  // Load dashboard summary once when the page opens.
  useEffect(() => {
    dashboardApi.get()
      .then(({ data }) => setDashboard(data))
      .catch((err) => setError(err.response?.data?.message || 'Unable to load dashboard'));
  }, []);

  if (error) {
    return <p className="rounded-md bg-red-50 p-4 text-sm text-red-700">{error}</p>;
  }

  if (!dashboard) {
    return <p className="text-sm text-slate-500">Loading dashboard...</p>;
  }

  // Convert summary objects into arrays for easy rendering with map().
  const statusEntries = Object.entries(dashboard.byStatus || {});
  const userEntries = Object.entries(dashboard.perUser || {});

  return (
    <div className="space-y-6">
      {/* Page title and description. */}
      <div>
        <h1 className="text-2xl font-semibold text-slate-950">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-600">A live summary across projects you can access.</p>
      </div>

      {/* Summary cards for total tasks and task count by status. */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="panel p-4">
          <p className="text-sm text-slate-500">Total tasks</p>
          <p className="mt-2 text-3xl font-semibold text-slate-950">{dashboard.totalTasks}</p>
        </div>
        {statusEntries.map(([status, count]) => (
          <div key={status} className="panel p-4">
            <p className="text-sm text-slate-500">{status}</p>
            <p className="mt-2 text-3xl font-semibold text-slate-950">{count}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Assignment summary grouped by user name. */}
        <section className="panel p-4">
          <h2 className="text-sm font-semibold text-slate-900">Tasks per user</h2>
          <div className="mt-4 space-y-3">
            {userEntries.length === 0 && <p className="text-sm text-slate-500">No assignments yet.</p>}
            {userEntries.map(([name, count]) => (
              <div key={name} className="flex items-center justify-between rounded-md bg-slate-50 px-3 py-2">
                <span className="text-sm text-slate-700">{name}</span>
                <span className="text-sm font-semibold text-slate-950">{count}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Tasks whose due date has passed and are not completed. */}
        <section className="panel p-4">
          <h2 className="text-sm font-semibold text-slate-900">Overdue tasks</h2>
          <div className="mt-4 space-y-3">
            {dashboard.overdueTasks.length === 0 && <p className="text-sm text-slate-500">Nothing overdue.</p>}
            {dashboard.overdueTasks.map((task) => (
              <div key={task._id} className="rounded-md border border-red-100 bg-red-50 px-3 py-2">
                <p className="text-sm font-medium text-red-900">{task.title}</p>
                <p className="text-xs text-red-700">
                  {task.project?.name} - due {new Date(task.dueDate).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
