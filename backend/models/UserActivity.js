import mongoose from 'mongoose';

const userActivitySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  studyTime: {
    type: Number,
    default: 0 // in minutes
  },
  coursesCompleted: {
    type: Number,
    default: 0
  },
  lessonsCompleted: {
    type: Number,
    default: 0
  },
  skillsProgress: [{
    skill: String,
    progress: Number
  }]
}, {
  timestamps: true
});

userActivitySchema.index({ userId: 1, date: 1 }, { unique: true });

export default mongoose.model('UserActivity', userActivitySchema);