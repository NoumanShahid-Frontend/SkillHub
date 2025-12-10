import mongoose from 'mongoose';

const learningStreakSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  currentStreak: {
    type: Number,
    default: 0
  },
  longestStreak: {
    type: Number,
    default: 0
  },
  lastActivityDate: {
    type: Date,
    default: null
  },
  streakDates: [{
    type: Date
  }]
}, {
  timestamps: true
});

export default mongoose.model('LearningStreak', learningStreakSchema);