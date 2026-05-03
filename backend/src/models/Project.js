import mongoose from 'mongoose';

// Represents a project workspace that owns tasks and has members.
const projectSchema = new mongoose.Schema({
  // Project title shown in dropdowns and project cards.
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 2
  },
  // Optional short description for the project.
  description: {
    type: String,
    trim: true,
    default: ''
  },
  // The admin is the user who created and manages the project.
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Members are the users allowed to see the project and receive tasks.
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, { timestamps: true });

// Export the Mongoose model used by project and task controllers.
export default mongoose.model('Project', projectSchema);
