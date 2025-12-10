import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  level: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    required: true
  },
  duration: {
    type: Number, // in hours
    required: true
  },
  lessons: [{
    title: String,
    duration: Number, // in minutes
    completed: { type: Boolean, default: false }
  }],
  skills: [String],
  instructor: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    default: 4.5
  },
  enrolledStudents: {
    type: Number,
    default: 0
  },
  price: {
    type: Number,
    default: 0
  },
  thumbnail: String,
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

export default mongoose.model('Course', courseSchema);