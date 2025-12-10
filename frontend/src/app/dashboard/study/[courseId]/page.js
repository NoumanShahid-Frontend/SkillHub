'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useToast } from '../../../../components/Toast';
import { coursesAPI } from '../../../../lib/courses';

// Utility function for logging
const logger = {
  info: (message, data = null) => {
    console.log(`[StudyCourse] ${message}`, data ? data : '');
  },
  error: (message, error = null) => {
    console.error(`[StudyCourse ERROR] ${message}`, error);
  },
  warn: (message, data = null) => {
    console.warn(`[StudyCourse WARNING] ${message}`, data ? data : '');
  }
};

export default function StudyCourse() {
  const { courseId } = useParams();
  const router = useRouter();
  const toast = useToast();
  const [course, setCourse] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [currentLesson, setCurrentLesson] = useState(0);
  const [loading, setLoading] = useState(true);
  const [notesOpen, setNotesOpen] = useState(false);
  const [lessonNotes, setLessonNotes] = useState('');
  const [notesSavedAt, setNotesSavedAt] = useState(null);

  useEffect(() => {
    logger.info('Component mounted, loading course data', { courseId });
    loadCourseData();
    const savedLesson = window.localStorage.getItem(`study:${courseId}:currentLesson`);
    if (savedLesson !== null) {
      const idx = Number(savedLesson);
      if (!Number.isNaN(idx)) {
        setCurrentLesson(idx);
      }
    }
  }, [courseId]);

  const loadCourseData = async () => {
    logger.info('Starting to load course data', { courseId });
    setLoading(true);
    
    try {
      const [courseRes, enrollmentsRes] = await Promise.all([
        coursesAPI.getCourse(courseId),
        coursesAPI.getEnrollments()
      ]);
      
      logger.info('API responses received', { 
        courseSuccess: courseRes.success, 
        enrollmentsSuccess: enrollmentsRes.success 
      });
      
      if (courseRes.success) {
        setCourse(courseRes.data);
        logger.info('Course data loaded successfully', { 
          title: courseRes.data.title,
          lessonsCount: courseRes.data.lessons?.length || 0
        });
      } else {
        logger.error('Failed to load course data', courseRes.error);
      }
      
      if (enrollmentsRes.success) {
        const userEnrollment = enrollmentsRes.data.find(e => e.courseId && e.courseId._id === courseId);
        setEnrollment(userEnrollment);
        
        if (userEnrollment) {
          logger.info('User enrollment found', { 
            progress: userEnrollment.progress,
            completedLessons: userEnrollment.completedLessons?.length || 0
          });
        } else {
          logger.warn('No enrollment found for user', { courseId });
        }
      } else {
        logger.error('Failed to load enrollments', enrollmentsRes.error);
      }
    } catch (error) {
      logger.error('Error loading course data', error);
    } finally {
      setLoading(false);
      logger.info('Course data loading completed');
    }
  };

  const completeLesson = async (lessonIndex) => {
    const lessonId = `lesson_${lessonIndex}`;
    logger.info('Attempting to complete lesson', { lessonIndex, lessonId, courseId });
    
    try {
      const result = await coursesAPI.completeLesson(courseId, lessonId);
      
      if (result.success) {
        logger.info('Lesson completed successfully', { lessonIndex, lessonId });
        await loadCourseData(); // Reload to get updated progress
        toast?.success('Lesson marked as complete');
      } else {
        logger.error('Failed to complete lesson', result.error);
        toast?.error('Failed to mark lesson complete');
      }
    } catch (error) {
      logger.error('Error completing lesson', { error, lessonIndex, lessonId });
      toast?.error('Error completing lesson');
    }
  };

  useEffect(() => {
    try {
      window.localStorage.setItem(`study:${courseId}:currentLesson`, String(currentLesson));
    } catch (e) {
      logger.warn('Failed to persist current lesson', e);
    }
    try {
      const raw = window.localStorage.getItem(`notes:${courseId}:${currentLesson}`);
      if (raw) {
        const parsed = JSON.parse(raw);
        setLessonNotes(parsed.content || '');
        setNotesSavedAt(parsed.savedAt || null);
      } else {
        setLessonNotes('');
        setNotesSavedAt(null);
      }
    } catch (e) {
      logger.warn('Failed to load notes', e);
      setLessonNotes('');
      setNotesSavedAt(null);
    }
  }, [courseId, currentLesson]);

  const saveNotes = (content) => {
    try {
      const payload = { content, savedAt: new Date().toISOString() };
      window.localStorage.setItem(`notes:${courseId}:${currentLesson}`, JSON.stringify(payload));
      setNotesSavedAt(payload.savedAt);
    } catch (e) {
      logger.warn('Failed to save notes', e);
    }
  };

  const clearNotes = () => {
    try {
      window.localStorage.removeItem(`notes:${courseId}:${currentLesson}`);
      setLessonNotes('');
      setNotesSavedAt(null);
    } catch (e) {
      logger.warn('Failed to clear notes', e);
    }
  };

  const isLessonCompleted = (lessonIndex) => {
    if (!enrollment) return false;
    return enrollment.completedLessons.some(l => l.lessonId === `lesson_${lessonIndex}`);
  };

  const getCodeExamples = (lessonTitle, category) => {
    logger.info('Getting code examples', { lessonTitle, category });
    
    const examples = {
      'Frontend': {
        'Introduction to React': [
          {
            title: 'Basic Component',
            code: `// Creating your first React component
import React from 'react';

function Welcome({ name, age }) {
  return (
    <div className="welcome-container">
      <h1>Hello, {name}!</h1>
      <p>You are {age} years old</p>
      <p>Welcome to React development</p>
      <button onClick={() => alert('Welcome!')}>Click me</button>
    </div>
  );
}

export default Welcome;`
          },
          {
            title: 'Component with Props Validation',
            code: `// Component with PropTypes
import React from 'react';
import PropTypes from 'prop-types';

function UserProfile({ user, onEdit }) {
  const { name, email, avatar, isActive } = user;
  
  return (
    <div className={\`profile \${isActive ? 'active' : 'inactive'}\`}>
      <img src={avatar} alt={name} className="avatar" />
      <div className="info">
        <h2>{name}</h2>
        <p>{email}</p>
        <span className="status">
          {isActive ? '🟢 Online' : '🔴 Offline'}
        </span>
      </div>
      <button onClick={() => onEdit(user.id)}>Edit Profile</button>
    </div>
  );
}

UserProfile.propTypes = {
  user: PropTypes.shape({
    name: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
    avatar: PropTypes.string,
    isActive: PropTypes.bool
  }).isRequired,
  onEdit: PropTypes.func.isRequired
};

export default UserProfile;`
          }
        ],
        'JSX and Components': [
          {
            title: 'Functional Component with Conditional Rendering',
            code: `// Advanced JSX with conditional rendering
import React, { useState } from 'react';

const ProductCard = ({ product, onAddToCart }) => {
  const [isHovered, setIsHovered] = useState(false);
  const { id, name, price, image, inStock, discount } = product;
  
  const finalPrice = discount ? price - (price * discount / 100) : price;
  
  return (
    <div 
      className={\`product-card \${!inStock ? 'out-of-stock' : ''}\`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="image-container">
        <img src={image} alt={name} />
        {discount && (
          <span className="discount-badge">-{discount}%</span>
        )}
      </div>
      
      <div className="product-info">
        <h3>{name}</h3>
        <div className="price">
          {discount ? (
            <>
              <span className="original-price">\${price}</span>
              <span className="final-price">\${finalPrice.toFixed(2)}</span>
            </>
          ) : (
            <span className="price">\${price}</span>
          )}
        </div>
        
        {inStock ? (
          <button 
            onClick={() => onAddToCart(id)}
            className={\`add-to-cart \${isHovered ? 'hovered' : ''}\`}
          >
            Add to Cart
          </button>
        ) : (
          <button disabled className="out-of-stock-btn">
            Out of Stock
          </button>
        )}
      </div>
    </div>
  );
};

export default ProductCard;`
          }
        ]
      },
      'Backend': {
        'Node.js Fundamentals': [
          {
            title: 'HTTP Server with Routing',
            code: `// Advanced Node.js server with routing
const http = require('http');
const url = require('url');

class SimpleRouter {
  constructor() {
    this.routes = new Map();
  }
  
  addRoute(method, path, handler) {
    const key = \`\${method}:\${path}\`;
    this.routes.set(key, handler);
  }
  
  handleRequest(req, res) {
    const parsedUrl = url.parse(req.url, true);
    const key = \`\${req.method}:\${parsedUrl.pathname}\`;
    
    const handler = this.routes.get(key);
    if (handler) {
      handler(req, res, parsedUrl.query);
    } else {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Route not found' }));
    }
  }
}

const router = new SimpleRouter();

// Define routes
router.addRoute('GET', '/', (req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ 
    message: 'Welcome to Node.js API',
    timestamp: new Date().toISOString()
  }));
});

const server = http.createServer((req, res) => {
  console.log(\`\${new Date().toISOString()} - \${req.method} \${req.url}\`);
  router.handleRequest(req, res);
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
});`
          }
        ]
      },
      'Data Science': {
        'Python Data Types': [
          {
            title: 'Advanced Data Structures',
            code: `# Advanced Python data structures and operations
from collections import defaultdict, Counter, namedtuple
from datetime import datetime, timedelta
import json

# Named tuples for structured data
Person = namedtuple('Person', ['name', 'age', 'email', 'department'])

# Sample data
employees = [
    Person('Alice Johnson', 28, 'alice@company.com', 'Engineering'),
    Person('Bob Smith', 35, 'bob@company.com', 'Marketing'),
    Person('Carol Davis', 42, 'carol@company.com', 'Engineering')
]

# Dictionary operations
department_count = defaultdict(int)
for emp in employees:
    department_count[emp.department] += 1

print("Employees by Department:")
for dept, count in department_count.items():
    print(f"  {dept}: {count} employees")

# List comprehensions
senior_employees = [emp for emp in employees if emp.age >= 35]
print(f"Senior employees (35+): {len(senior_employees)}")

# JSON serialization
employee_data = {
    'employees': [emp._asdict() for emp in employees],
    'summary': {
        'total_employees': len(employees),
        'departments': dict(department_count)
    }
}

print("Employee data as JSON:")
print(json.dumps(employee_data, indent=2))`
          }
        ]
      }
    };

    examples['DevOps'] = {
      'Docker Basics': [
        {
          title: 'Dockerfile for Node App',
          code: `# syntax=docker/dockerfile:1\nFROM node:18-alpine\nWORKDIR /app\nCOPY package*.json ./\nRUN npm ci --only=production\nCOPY . .\nENV PORT=3000\nEXPOSE 3000\nCMD [\"node\", \"server.js\"]`
        },
        {
          title: 'docker-compose.yml',
          code: `version: '3.8'\nservices:\n  api:\n    build: .\n    ports:\n      - \"3000:3000\"\n    environment:\n      - NODE_ENV=production\n    depends_on:\n      - mongo\n  mongo:\n    image: mongo:6\n    ports:\n      - \"27017:27017\"\n    volumes:\n      - mongo_data:/data/db\nvolumes:\n  mongo_data:`
        }
      ]
    };
    
    const categoryExamples = examples[category] || {};
    const lessonExamples = categoryExamples[lessonTitle] || [
      { title: 'Basic Example', code: `// ${lessonTitle} - Example code\nconsole.log('Hello, ${category}!');` }
    ];
    
    return lessonExamples;
  };

  const getChallenges = (lessonTitle, category) => {
    const challenges = {
      'Frontend': [
        `Build a component for ${lessonTitle} with memoization and accessibility`,
        'Refactor state to reduce renders; measure with console timings',
        'Write tests for edge cases and user interactions'
      ],
      'Backend': [
        'Design a secure endpoint with validation and rate limits',
        'Model data with indexes; explain trade-offs',
        'Add error handling and structured logs'
      ],
      'Data Science': [
        'Clean a noisy dataset and justify transformations',
        'Train a model and prevent overfitting',
        'Evaluate with proper metrics and report findings'
      ]
    };
    const list = challenges[category] || ['Create a mini project applying concepts'];
    return list;
  };

  if (loading) {
    return <div className="text-center py-8">Loading course...</div>;
  }

  if (!course) {
    return (
      <div className="text-center py-8">
        <h2 className="text-xl font-semibold mb-4">Course Not Found</h2>
        <button 
          onClick={() => window.location.href = '/dashboard/courses'}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
        >
          Browse Courses
        </button>
      </div>
    );
  }

  if (!enrollment) {
    return (
      <div className="text-center py-8">
        <h2 className="text-xl font-semibold mb-4">Not Enrolled</h2>
        <button 
          onClick={() => window.location.href = '/dashboard/courses'}
          className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition"
        >
          Enroll Now
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto px-4 space-y-6">
      <div className="flex items-center text-sm text-gray-500">
        <button onClick={() => router.push('/dashboard/courses')} className="hover:text-gray-700">Courses</button>
        <span className="mx-2">/</span>
        <span className="text-gray-900">{course.title}</span>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h1 className="text-3xl font-bold mb-2">{course.title}</h1>
        <p className="text-gray-600 mb-4">{course.description}</p>
        <div className="flex items-center space-x-4">
          <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">{course.level}</span>
          <span className="text-sm text-gray-500">Progress: {Math.round(enrollment.progress)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
          <div 
            className="bg-blue-600 h-2 rounded-full" 
            style={{width: `${enrollment.progress}%`}}
          ></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Course Content</h2>
            <div className="space-y-2">
              {course.lessons.map((lesson, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg cursor-pointer transition ${
                    currentLesson === index
                      ? 'bg-blue-50 border-l-4 border-blue-500'
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setCurrentLesson(index)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">{lesson.title}</h3>
                      <p className="text-sm text-gray-500">{lesson.duration} min</p>
                    </div>
                    {isLessonCompleted(index) && (
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold mb-2">
                {course.lessons[currentLesson]?.title}
              </h2>
              <p className="text-gray-600">
                Duration: {course.lessons[currentLesson]?.duration} minutes
              </p>
            </div>

            <div className="space-y-6">
              {/* Lesson Content */}
              <div className="p-6 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-medium mb-4">Lesson Overview</h3>
                <div className="space-y-4">
                  <p className="text-gray-700">
                    {course.lessons[currentLesson]?.content || `Welcome to ${course.lessons[currentLesson]?.title}. This lesson will cover the fundamental concepts and practical applications.`}
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    <div className="bg-blue-50 p-3 rounded">
                      <h4 className="font-medium text-blue-800">Difficulty</h4>
                      <p className="text-blue-600">{course.level}</p>
                    </div>
                    <div className="bg-green-50 p-3 rounded">
                      <h4 className="font-medium text-green-800">Duration</h4>
                      <p className="text-green-600">{course.lessons[currentLesson]?.duration} min</p>
                    </div>
                    <div className="bg-purple-50 p-3 rounded">
                      <h4 className="font-medium text-purple-800">Status</h4>
                      <p className="text-purple-600">
                        {isLessonCompleted(currentLesson) ? '✅ Completed' : '⏳ In Progress'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Code Examples */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Code Examples</h3>
                {getCodeExamples(course.lessons[currentLesson]?.title, course.category).map((example, index) => (
                  <div key={index} className="bg-white border rounded-lg overflow-hidden">
                    <div className="bg-gray-100 px-4 py-2 border-b flex items-center justify-between">
                      <h4 className="font-medium text-gray-800">{example.title}</h4>
                      <button
                        onClick={() => navigator.clipboard.writeText(example.code)}
                        className="text-xs px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded"
                      >Copy</button>
                    </div>
                    <div className="p-4">
                      <pre className="bg-gray-900 text-green-400 p-4 rounded overflow-x-auto text-sm">
                        <code>{example.code}</code>
                      </pre>
                    </div>
                  </div>
                ))}
              </div>

              {/* Challenge Tasks */}
              <div className="space-y-3 p-6 bg-white border rounded-lg">
                <h3 className="text-lg font-medium">Challenge Tasks</h3>
                <ul className="list-disc pl-6 text-gray-700">
                  {getChallenges(course.lessons[currentLesson]?.title, course.category).map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>

              {/* Interactive Elements */}
              <div className="bg-white p-6 rounded-lg border">
                <h3 className="text-lg font-medium mb-4">Lesson Actions</h3>
                <div className="flex flex-wrap gap-3">
                  {!isLessonCompleted(currentLesson) && (
                    <button
                      onClick={() => completeLesson(currentLesson)}
                      className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition"
                    >
                      Mark as Complete
                    </button>
                  )}
                  
                  <button
                    onClick={() => {
                      setNotesOpen(!notesOpen);
                      logger.info('Toggle lesson notes', { lessonIndex: currentLesson, open: !notesOpen });
                    }}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
                  >
                    {notesOpen ? 'Hide Notes' : 'Take Notes'}
                  </button>
                  
                  <button
                    onClick={() => {
                      logger.info('Navigate to assessment', { courseId });
                      router.push(`/dashboard/assessment/${courseId}`);
                    }}
                    className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition"
                  >
                    Practice
                  </button>
                  
                  {currentLesson > 0 && (
                    <button
                      onClick={() => {
                        const to = currentLesson - 1;
                        setCurrentLesson(to);
                        logger.info('User navigated to prev lesson', { from: currentLesson, to });
                      }}
                      className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition"
                    >
                      ← Previous
                    </button>
                  )}
                  {currentLesson < course.lessons.length - 1 && (
                    <button
                      onClick={() => {
                        const to = currentLesson + 1;
                        setCurrentLesson(to);
                        logger.info('User navigated to next lesson', { from: currentLesson, to });
                      }}
                      className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition"
                    >
                      Next →
                    </button>
                  )}
                </div>
                {notesOpen && (
                  <div className="mt-6 border rounded-lg">
                    <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b">
                      <span className="text-sm font-medium">Lesson Notes</span>
                      <div className="flex gap-2">
                        <button
                          onClick={clearNotes}
                          className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                        >Clear</button>
                        <button
                          onClick={() => navigator.clipboard.writeText(lessonNotes || '')}
                          className="text-xs px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                        >Copy</button>
                      </div>
                    </div>
                    <div className="p-4">
                      <textarea
                        value={lessonNotes}
                        onChange={(e) => {
                          const val = e.target.value;
                          setLessonNotes(val);
                          saveNotes(val);
                        }}
                        placeholder="Write your notes here..."
                        className="w-full h-40 p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <div className="mt-2 text-xs text-gray-500">
                        {notesSavedAt ? `Saved at ${new Date(notesSavedAt).toLocaleString()}` : 'Not saved yet'}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
