// Priority labels use different colors so users can scan urgency quickly.
const priorityStyle = {
  Low: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Medium: 'bg-amber-50 text-amber-700 border-amber-200',
  High: 'bg-red-50 text-red-700 border-red-200'
};

export default function TaskCard({ task, canEdit, onEdit, onDelete, onDragStart }) {
  // Convert stored date text into a Date object for display and overdue checks.
  const dueDate = new Date(task.dueDate);
  const isOverdue = task.status !== 'Done' && dueDate < new Date();

  return (
    <article
      className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm"
      draggable={canEdit}
      onDragStart={(event) => onDragStart(event, task)}
    >
      {/* Main task details and priority badge. */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-950">{task.title}</h3>
          <p className="mt-1 text-xs leading-5 text-slate-600">{task.description || 'No description'}</p>
        </div>
        <span className={`shrink-0 rounded-full border px-2 py-1 text-[11px] font-medium ${priorityStyle[task.priority]}`}>
          {task.priority}
        </span>
      </div>

      {/* Assignee and due date metadata. */}
      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
        <span>{task.assignedTo?.name || 'Unassigned'}</span>
        <span className={isOverdue ? 'font-medium text-red-600' : ''}>
          Due {dueDate.toLocaleDateString()}
        </span>
      </div>

      {/* Edit/delete actions are shown only to users with permission. */}
      {canEdit && (
        <div className="mt-3 flex gap-2">
          <button type="button" className="btn btn-secondary !px-2 !py-1 text-xs" onClick={() => onEdit(task)}>
            Edit
          </button>
          <button type="button" className="btn btn-danger !px-2 !py-1 text-xs" onClick={() => onDelete(task._id)}>
            Delete
          </button>
        </div>
      )}
    </article>
  );
}
