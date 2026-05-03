import TaskCard from './TaskCard';

// Board columns match the allowed task status values from the backend schema.
const statuses = ['To Do', 'In Progress', 'Done'];

export default function TaskBoard({ tasks, currentUser, projectAdminId, onStatusChange, onEdit, onDelete }) {
  // A task can be edited by an Admin or by the user assigned to it.
  const canEditTask = (task) => {
    return currentUser?.role === 'Admin' || task.assignedTo?._id === currentUser?._id;
  };

  // When a card is dropped into a column, update the task status if it changed.
  const handleDrop = (event, status) => {
    event.preventDefault();
    const taskId = event.dataTransfer.getData('taskId');
    const task = tasks.find((item) => item._id === taskId);

    if (task && task.status !== status) {
      onStatusChange(task, status);
    }
  };

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {statuses.map((status) => {
        // Only show tasks whose status belongs to the current column.
        const statusTasks = tasks.filter((task) => task.status === status);

        return (
          <section
            key={status}
            className="min-h-80 rounded-lg border border-slate-200 bg-slate-50 p-3"
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => handleDrop(event, status)}
          >
            {/* Column header with task count. */}
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-800">{status}</h2>
              <span className="rounded-full bg-white px-2 py-1 text-xs font-medium text-slate-600">
                {statusTasks.length}
              </span>
            </div>

            {/* Render each task card in this status column. */}
            <div className="space-y-3">
              {statusTasks.map((task) => (
                <TaskCard
                  key={task._id}
                  task={task}
                  canEdit={canEditTask(task) || projectAdminId === currentUser?._id}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onDragStart={(event) => event.dataTransfer.setData('taskId', task._id)}
                />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
