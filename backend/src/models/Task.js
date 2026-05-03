import mongoose from 'mongoose';

// Stores individual work items inside a project board.
const taskSchema = new mongoose.Schema({
  // Main task title displayed on the card.
  title: {
    type: String,
    required: true,
    trim: true
  },
  // Optional extra details for the task.
  description: {
    type: String,
    trim: true,
    default: ''
  },
  // Date used for sorting and overdue calculations.
  dueDate: {
    type: Date,
    required: true
  },
  // Priority controls the label shown on each task card.
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium'
  },
  // Status determines which board column the task appears in.
  status: {
    type: String,
    enum: ['To Do', 'In Progress', 'Done'],
    default: 'To Do'
  },
  // Parent project that owns this task.
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  // User responsible for completing the task.
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // User who originally created the task.
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

// Export the Mongoose model used by task and dashboard controllers.
export default mongoose.model('Task', taskSchema);
