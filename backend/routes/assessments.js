import express from 'express';
import Assessment from '../models/Assessment.js';
import AssessmentResult from '../models/AssessmentResult.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Get assessments for a course
router.get('/course/:courseId', auth, async (req, res) => {
  try {
    const assessments = await Assessment.find({ courseId: req.params.courseId });
    res.json({ success: true, data: assessments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get assessment by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const assessment = await Assessment.findById(req.params.id);
    if (!assessment) {
      return res.status(404).json({ success: false, message: 'Assessment not found' });
    }
    
    // Remove correct answers from response
    const assessmentData = assessment.toObject();
    assessmentData.questions = assessmentData.questions.map(q => ({
      question: q.question,
      options: q.options
    }));
    
    res.json({ success: true, data: assessmentData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Submit assessment
router.post('/:id/submit', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { answers, timeSpent } = req.body;
    
    const assessment = await Assessment.findById(req.params.id);
    if (!assessment) {
      return res.status(404).json({ success: false, message: 'Assessment not found' });
    }
    
    // Calculate score
    let correctAnswers = 0;
    answers.forEach((answer, index) => {
      if (assessment.questions[index] && answer.selectedAnswer === assessment.questions[index].correctAnswer) {
        correctAnswers++;
      }
    });
    
    const score = Math.round((correctAnswers / assessment.questions.length) * 100);
    const passed = score >= assessment.passingScore;
    
    const result = new AssessmentResult({
      userId,
      assessmentId: req.params.id,
      answers,
      score,
      passed,
      timeSpent
    });
    
    await result.save();
    
    res.json({ 
      success: true, 
      data: { 
        score, 
        passed, 
        correctAnswers, 
        totalQuestions: assessment.questions.length,
        passingScore: assessment.passingScore
      } 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get user's assessment results
router.get('/results/user', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const results = await AssessmentResult.find({ userId }).populate('assessmentId');
    res.json({ success: true, data: results });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;