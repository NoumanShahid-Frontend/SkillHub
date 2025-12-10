import express from 'express';
import UserActivity from '../models/UserActivity.js';
import LearningStreak from '../models/LearningStreak.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Get dashboard stats
router.get('/stats', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    // Get current month activities
    const monthlyActivities = await UserActivity.find({
      userId,
      date: { $gte: startOfMonth }
    });

    // Calculate stats from real data
    const totalStudyTime = monthlyActivities.reduce((sum, activity) => sum + activity.studyTime, 0);
    const totalCoursesCompleted = monthlyActivities.reduce((sum, activity) => sum + activity.coursesCompleted, 0);
    const totalLessonsCompleted = monthlyActivities.reduce((sum, activity) => sum + activity.lessonsCompleted, 0);

    // Get actual course count
    const Course = (await import('../models/Course.js')).default;
    const totalCourses = await Course.countDocuments({ isActive: true });
    
    // Get user enrollments
    const Enrollment = (await import('../models/Enrollment.js')).default;
    const enrollments = await Enrollment.find({ userId });
    const completedEnrollments = enrollments.filter(e => e.isCompleted).length;

    res.json({
      success: true,
      data: {
        totalCourses,
        completedCourses: completedEnrollments,
        studyHours: Math.floor(totalStudyTime / 60),
        certificates: completedEnrollments
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get weekly activity
router.get('/weekly-activity', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    
    const weeklyData = [];
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + i);
      
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      
      const activity = await UserActivity.findOne({
        userId,
        date: {
          $gte: startOfDay,
          $lt: endOfDay
        }
      });
      
      weeklyData.push({
        day: days[i],
        studyTime: activity ? activity.studyTime : 0
      });
    }

    res.json({ success: true, data: weeklyData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get learning progress
router.get('/progress', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Get actual progress from enrollments
    const Enrollment = (await import('../models/Enrollment.js')).default;
    const enrollments = await Enrollment.find({ userId }).populate('courseId');
    
    const skillProgress = {};
    
    enrollments.forEach(enrollment => {
      if (enrollment.courseId && enrollment.courseId.skills) {
        enrollment.courseId.skills.forEach(skill => {
          if (!skillProgress[skill]) {
            skillProgress[skill] = { total: 0, weighted: 0 };
          }
          skillProgress[skill].total += 1;
          skillProgress[skill].weighted += enrollment.progress;
        });
      }
    });
    
    const progress = Object.keys(skillProgress).map(skill => ({
      skill,
      progress: Math.round(skillProgress[skill].weighted / skillProgress[skill].total) || 0
    }));

    res.json({ success: true, data: progress });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Log daily activity
router.post('/log-activity', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { studyTime, coursesCompleted, lessonsCompleted } = req.body;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Update or create today's activity
    const activity = await UserActivity.findOneAndUpdate(
      { userId, date: today },
      {
        $inc: {
          studyTime: studyTime || 0,
          coursesCompleted: coursesCompleted || 0,
          lessonsCompleted: lessonsCompleted || 0
        }
      },
      { upsert: true, new: true }
    );

    // Update learning streak with better logic
    const streak = await updateLearningStreakImproved(userId);

    res.json({ success: true, data: { activity, streak } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get monthly progress
router.get('/monthly-progress', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const now = new Date();
    const monthlyData = [];
    
    // Get last 6 months of data, but only include months with activity
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      
      const activities = await UserActivity.find({
        userId,
        date: { $gte: monthStart, $lte: monthEnd }
      });
      
      // Only include months with actual activity
      if (activities.length > 0) {
        const totalStudyTime = activities.reduce((sum, activity) => sum + activity.studyTime, 0);
        const totalLessons = activities.reduce((sum, activity) => sum + activity.lessonsCompleted, 0);
        
        // Calculate progress percentage based on activity (0-100%)
        const targetHours = 20; // Target 20 hours per month
        const actualHours = totalStudyTime / 60;
        const progress = Math.min(Math.round((actualHours / targetHours) * 100), 100);
        
        monthlyData.push({
          month: monthStart.toLocaleDateString('en-US', { month: 'short' }),
          progress,
          studyTime: totalStudyTime,
          lessons: totalLessons
        });
      }
    }

    res.json({ success: true, data: monthlyData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get learning streak
router.get('/streak', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const streak = await LearningStreak.findOne({ userId });
    
    if (!streak) {
      return res.json({ success: true, data: { currentStreak: 0, streakDates: [] } });
    }

    res.json({ success: true, data: streak });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Improved learning streak function
async function updateLearningStreakImproved(userId) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  let streak = await LearningStreak.findOne({ userId });
  
  if (!streak) {
    // First time logging activity
    streak = new LearningStreak({ 
      userId: userId, 
      currentStreak: 1, 
      longestStreak: 1, 
      lastActivityDate: today, 
      streakDates: [today] 
    });
  } else {
    const lastActivity = streak.lastActivityDate ? new Date(streak.lastActivityDate) : null;
    
    if (!lastActivity) {
      // No previous activity recorded
      streak.currentStreak = 1;
      streak.lastActivityDate = today;
      streak.streakDates = [today];
    } else {
      const daysDiff = Math.floor((today - lastActivity) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === 0) {
        // Same day, don't update streak count but update date
        streak.lastActivityDate = today;
      } else if (daysDiff === 1) {
        // Consecutive day - increment streak
        streak.currentStreak += 1;
        streak.streakDates.push(today);
        streak.lastActivityDate = today;
      } else if (daysDiff > 1) {
        // Streak broken - reset
        streak.currentStreak = 1;
        streak.streakDates = [today];
        streak.lastActivityDate = today;
      }
    }
    
    // Update longest streak if current is higher
    if (streak.currentStreak > streak.longestStreak) {
      streak.longestStreak = streak.currentStreak;
    }
    
    // Keep only last 30 days of streak dates
    if (streak.streakDates.length > 30) {
      streak.streakDates = streak.streakDates.slice(-30);
    }
  }
  
  await streak.save();
  return streak;
}

export default router;