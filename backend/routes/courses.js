import express from 'express';
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Get all courses
router.get('/', async (req, res) => {
  try {
    const { category, level, search } = req.query;
    let query = { isActive: true };
    
    if (category) query.category = category;
    if (level) query.level = level;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    const courses = await Course.find(query).sort({ createdAt: -1 });
    res.json({ success: true, data: courses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get course by ID
router.get('/:id', async (req, res) => {
  try {
    console.log('Looking for course with ID:', req.params.id);
    const course = await Course.findById(req.params.id);
    if (!course) {
      console.log('Course not found');
      return res.status(404).json({ success: false, message: 'Course not found' });
    }
    console.log('Course found:', course.title);
    res.json({ success: true, data: course });
  } catch (error) {
    console.error('Error finding course:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Enroll in course
router.post('/:id/enroll', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const courseId = req.params.id;
    
    const existingEnrollment = await Enrollment.findOne({ userId, courseId });
    if (existingEnrollment) {
      return res.status(400).json({ success: false, message: 'Already enrolled in this course' });
    }
    
    const enrollment = new Enrollment({ userId, courseId });
    await enrollment.save();
    
    await Course.findByIdAndUpdate(courseId, { $inc: { enrolledStudents: 1 } });
    
    res.json({ success: true, data: enrollment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get user enrollments
router.get('/user/enrollments', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const enrollments = await Enrollment.find({ userId }).populate('courseId');
    res.json({ success: true, data: enrollments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update lesson progress
router.post('/:courseId/lessons/:lessonId/complete', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { courseId, lessonId } = req.params;
    
    const enrollment = await Enrollment.findOne({ userId, courseId });
    if (!enrollment) {
      return res.status(404).json({ success: false, message: 'Enrollment not found' });
    }
    
    const lessonExists = enrollment.completedLessons.find(l => l.lessonId === lessonId);
    if (!lessonExists) {
      enrollment.completedLessons.push({ lessonId });
      
      const course = await Course.findById(courseId);
      const progress = (enrollment.completedLessons.length / course.lessons.length) * 100;
      enrollment.progress = progress;
      
      await enrollment.save();
    }
    
    res.json({ success: true, data: enrollment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Complete course after assessment
router.post('/:courseId/complete', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { courseId } = req.params;
    
    const enrollment = await Enrollment.findOne({ userId, courseId });
    if (!enrollment) {
      return res.status(404).json({ success: false, message: 'Enrollment not found' });
    }
    
    enrollment.isCompleted = true;
    enrollment.completedAt = new Date();
    enrollment.progress = 100;
    
    await enrollment.save();
    
    res.json({ success: true, data: enrollment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;