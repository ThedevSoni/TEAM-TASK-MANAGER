import mongoose from 'mongoose';

// Stores login accounts and the role each user has inside the app.
const userSchema = new mongoose.Schema({
  // Display name shown in project members, tasks, and the navbar.
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 2
  },
  // Email is the unique login identifier and is normalized to lowercase.
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  // Password hashes are stored in MongoDB but hidden from normal queries.
  password: {
    type: String,
    required: true,
    minlength: 8,
    select: false
  },
  // Admin users can create projects and manage project members.
  role: {
    type: String,
    enum: ['Admin', 'Member'],
    default: 'Member'
  }
}, { timestamps: true });

// Remove sensitive/internal fields before sending user objects to the frontend.
userSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete ret.password;
    delete ret.__v;
    return ret;
  }
});

// Export the Mongoose model used by controllers.
export default mongoose.model('User', userSchema);
