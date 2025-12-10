'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { coursesAPI } from '../../../../lib/courses';

export default function Assessment() {
  const { courseId } = useParams();
  const router = useRouter();
  const [course, setCourse] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showSolution, setShowSolution] = useState({});
  const [feedback, setFeedback] = useState({});
  const [timeLeft, setTimeLeft] = useState(1800); // 30 minutes
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPalette, setShowPalette] = useState(true);

  useEffect(() => {
    loadAssessment();
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          submitAssessment();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const loadAssessment = async () => {
    try {
      const courseRes = await coursesAPI.getCourse(courseId);
      if (courseRes.success) {
        setCourse(courseRes.data);
        generateQuestions(courseRes.data);
      }
    } catch (error) {
      console.error('Error loading assessment:', error);
    } finally {
      setLoading(false);
    }
  };

  const shuffle = (arr) => arr.map(v => ({ v, r: Math.random() }))
    .sort((a, b) => a.r - b.r)
    .map(({ v }) => v);

  const generateQuestions = (courseData) => {
    const base = [
      {
        question: `Which statement about ${courseData.title} is MOST accurate?`,
        options: [
          'It prioritizes developer experience over performance in all cases',
          'It enforces strict patterns that cannot be customized',
          'It offers trade-offs between flexibility, speed, and scalability',
          'It is only suitable for small pet projects'
        ],
        correct: 2,
        difficulty: 'Medium'
      },
      {
        question: `In ${courseData.category}, what is the primary goal of architecture decisions?`,
        options: [
          'Maximize lines of code',
          'Minimize cyclomatic complexity and improve maintainability',
          'Avoid using design patterns',
          'Disable type checking to move faster'
        ],
        correct: 1,
        difficulty: 'Hard'
      },
      {
        question: `Which practice reduces bugs in ${courseData.title}?`,
        options: [
          'Global mutable state everywhere',
          'Clear module boundaries and unit tests',
          'Relying solely on manual QA',
          'Skipping code reviews'
        ],
        correct: 1,
        difficulty: 'Medium'
      }
    ];

    const frontendSet = [
      {
        question: 'What improves React rendering performance the MOST?',
        options: [
          'Re-render everything on every state change',
          'Memoize expensive components and stabilize props',
          'Use inline functions everywhere',
          'Disable strict mode'
        ],
        correct: 1,
        difficulty: 'Hard'
      },
      {
        question: 'Which is TRUE about state management?',
        options: [
          'Lift state to the highest ancestor always',
          'Prefer local state; lift only when needed',
          'Never use context',
          'Use global stores for every component'
        ],
        correct: 1,
        difficulty: 'Medium'
      }
    ];

    const backendSet = [
      {
        question: 'What secures an Express API BEST?',
        options: [
          'Trust user input',
          'Validate, sanitize, and enforce authz for every route',
          'Use GET for mutations',
          'Log secrets in production'
        ],
        correct: 1,
        difficulty: 'Hard'
      },
      {
        question: 'Which statement is TRUE about database indexes?',
        options: [
          'Indexes always speed up writes without trade-offs',
          'Indexes speed reads but can slow writes and increase storage',
          'Indexes are unnecessary for large datasets',
          'Use an index on every column'
        ],
        correct: 1,
        difficulty: 'Medium'
      }
    ];

    const dsSet = [
      {
        question: 'Which metric detects class imbalance?',
        options: ['Accuracy', 'Precision', 'Recall', 'F1-score'],
        correct: 3,
        difficulty: 'Hard'
      },
      {
        question: 'Which technique prevents overfitting?',
        options: ['Training longer', 'Dropout/regularization', 'Adding bias', 'Removing validation set'],
        correct: 1,
        difficulty: 'Medium'
      }
    ];

    const domainSet = courseData.category === 'Frontend' ? frontendSet : courseData.category === 'Backend' ? backendSet : dsSet;
    const skillsSet = (courseData.skills || []).slice(0, 3).map((s, idx) => ({
      question: `Which best describes ${s}?`,
      options: [
        `A pattern used incorrectly in ${courseData.category}`,
        `A technique applicable to real projects`,
        'A deprecated approach',
        'Only a theoretical concept'
      ],
      correct: 1,
      difficulty: idx === 0 ? 'Medium' : 'Hard'
    }));

    const all = shuffle([...base, ...domainSet, ...skillsSet]);
    const expanded = all.concat([
      {
        question: `After finishing ${courseData.title}, what maximizes learning retention?`,
        options: ['Read more docs', 'Build and ship a small project', 'Skip practice', 'Focus on unrelated topics'],
        correct: 1,
        difficulty: 'Medium'
      },
      {
        question: `Which option is MOST secure when handling tokens?`,
        options: ['Store in localStorage', 'Store in cookies with httpOnly + SameSite', 'Embed in HTML', 'Log to console'],
        correct: 1,
        difficulty: 'Hard'
      }
    ]);

    setQuestions(expanded.slice(0, 12));
  };

  const handleAnswerSelect = (questionIndex, answerIndex) => {
    setAnswers(prev => ({
      ...prev,
      [questionIndex]: answerIndex
    }));
    const correctIndex = questions[questionIndex]?.correct;
    const isCorrect = correctIndex === answerIndex;
    setShowSolution(prev => ({ ...prev, [questionIndex]: true }));
    setFeedback(prev => ({ ...prev, [questionIndex]: isCorrect ? 'correct' : 'wrong' }));
  };

  const submitAssessment = async () => {
    const score = calculateScore();
    const passed = score >= 70;
    
    setResult({
      score,
      passed,
      correctAnswers: Object.values(answers).filter((answer, index) => answer === questions[index]?.correct).length,
      totalQuestions: questions.length
    });
    
    if (passed) {
      // Mark course as completed
      try {
        await coursesAPI.completeCourse(courseId);
      } catch (error) {
        console.error('Error completing course:', error);
      }
    }
    
    setSubmitted(true);
  };

  const calculateScore = () => {
    let correct = 0;
    questions.forEach((question, index) => {
      if (answers[index] === question.correct) {
        correct++;
      }
    });
    return Math.round((correct / questions.length) * 100);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return <div className="text-center py-8">Loading assessment...</div>;
  }

  if (submitted) {
    return (
      <div className="mx-auto px-4 text-center py-8">
        <div className={`p-8 rounded-lg ${result.passed ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'} border`}>
          <h2 className={`text-3xl font-bold mb-4 ${result.passed ? 'text-green-800' : 'text-red-800'}`}>
            {result.passed ? '🎉 Congratulations!' : '📚 Keep Learning!'}
          </h2>
          <p className="text-xl mb-4">Your Score: {result.score}%</p>
          <p className="mb-6">
            You answered {result.correctAnswers} out of {result.totalQuestions} questions correctly.
          </p>
          
          {result.passed ? (
            <div className="space-y-4">
              <p className="text-green-700">
                You have successfully completed the {course.title} course!
              </p>
              <button
                onClick={() => router.push('/dashboard/courses')}
                className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition"
              >
                View Certificate & Browse More Courses
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-red-700">
                You need 70% or higher to pass. Review the course material and try again.
              </p>
              <div className="flex space-x-4 justify-center">
                <button
                  onClick={() => router.push(`/dashboard/study/${courseId}`)}
                  className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition"
                >
                  Review Course
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition"
                >
                  Retake Assessment
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto px-4">
      <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Final Assessment: {course.title}</h1>
          <div className="text-lg font-semibold text-red-600">
            Time Left: {formatTime(timeLeft)}
          </div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all" 
            style={{width: `${((currentQuestion + 1) / questions.length) * 100}%`}}
          ></div>
        </div>
        <p className="text-sm text-gray-600 mt-2">
          Question {currentQuestion + 1} of {questions.length}
        </p>
      </div>

      {questions.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 bg-white p-8 rounded-lg shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">
                {questions[currentQuestion]?.question}
              </h2>
              {questions[currentQuestion]?.difficulty && (
                <span className={`text-xs px-2 py-1 rounded ${
                  questions[currentQuestion].difficulty === 'Hard' ? 'bg-red-100 text-red-700' :
                  questions[currentQuestion].difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-green-100 text-green-700'
                }`}>
                  {questions[currentQuestion].difficulty}
                </span>
              )}
            </div>
          
          <div className="space-y-3 mb-4">
            {questions[currentQuestion]?.options.map((option, index) => {
              const correctIndex = questions[currentQuestion]?.correct;
              const selectedIndex = answers[currentQuestion];
              const show = !!showSolution[currentQuestion];
              const isCorrectChoice = show && index === correctIndex;
              const isWrongSelected = show && selectedIndex !== correctIndex && index === selectedIndex;
              const base = 'border-gray-200 hover:border-gray-300';
              const cls = isCorrectChoice
                ? 'border-green-500 bg-green-50'
                : isWrongSelected
                  ? 'border-red-500 bg-red-50'
                  : selectedIndex === index
                    ? 'border-blue-500 bg-blue-50'
                    : base;
              return (
                <label
                  key={index}
                  className={`flex items-center p-4 border rounded-lg cursor-pointer transition ${cls}`}
                >
                  <input
                    type="radio"
                    name={`question-${currentQuestion}`}
                    value={index}
                    checked={selectedIndex === index}
                    onChange={() => handleAnswerSelect(currentQuestion, index)}
                    className="mr-3"
                  />
                  <span>{option}</span>
                </label>
              );
            })}
          </div>
          {feedback[currentQuestion] && (
            <div className={`text-sm mb-8 ${feedback[currentQuestion] === 'correct' ? 'text-green-700' : 'text-red-700'}`}>
              {feedback[currentQuestion] === 'correct' ? 'Correct' : 'Incorrect. Correct answer highlighted.'}
            </div>
          )}

            <div className="flex justify-between">
              <button
                onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                disabled={currentQuestion === 0}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              {currentQuestion === questions.length - 1 ? (
                <button
                  onClick={submitAssessment}
                  className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
                >
                  Submit Assessment
                </button>
              ) : (
                <button
                  onClick={() => setCurrentQuestion(currentQuestion + 1)}
                  disabled={answers[currentQuestion] === undefined}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600 transition"
                >
                  Next
                </button>
              )}
            </div>
          </div>
          <div className="lg:col-span-1">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold">Question Navigator</h3>
                <button
                  onClick={() => setShowPalette(!showPalette)}
                  className="text-xs px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                >{showPalette ? 'Hide' : 'Show'}</button>
              </div>
              {showPalette && (
                <div className="grid grid-cols-5 gap-2">
                  {questions.map((_, idx) => {
                    const answered = answers[idx] !== undefined;
                    return (
                      <button
                        key={idx}
                        onClick={() => setCurrentQuestion(idx)}
                        className={`text-xs h-8 rounded ${
                          idx === currentQuestion ? 'bg-blue-500 text-white' :
                          answered ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >{idx + 1}</button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
