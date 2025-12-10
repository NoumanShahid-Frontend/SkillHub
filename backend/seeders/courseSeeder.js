import Course from '../models/Course.js';
import mongoose from 'mongoose';

const courses = [
  {
    _id: new mongoose.Types.ObjectId("69394d9c08202cc2b780dacb"),
    title: "Complete React Development",
    description: "Master React from basics to advanced concepts including hooks, context, and performance optimization.",
    category: "Frontend",
    level: "Intermediate",
    duration: 40,
    lessons: [
      { title: "Introduction to React", duration: 45, content: "Learn what React is, why it's popular, and set up your development environment. Understand the virtual DOM and React's component-based architecture." },
      { title: "JSX and Components", duration: 60, content: "Master JSX syntax, create functional and class components, understand component composition and reusability patterns." },
      { title: "Props and State Management", duration: 50, content: "Learn how to pass data between components using props, manage local component state, and understand data flow in React applications." },
      { title: "Event Handling and Forms", duration: 40, content: "Handle user interactions, work with forms, controlled vs uncontrolled components, and form validation techniques." },
      { title: "React Hooks Deep Dive", duration: 70, content: "Master useState, useEffect, useContext, useReducer, and custom hooks. Learn when and how to use each hook effectively." },
      { title: "Context API and Global State", duration: 55, content: "Implement global state management using Context API, avoid prop drilling, and create efficient state providers." },
      { title: "Performance Optimization", duration: 65, content: "Learn React.memo, useMemo, useCallback, code splitting, lazy loading, and profiling techniques for optimal performance." },
      { title: "Routing with React Router", duration: 50, content: "Implement client-side routing, nested routes, route parameters, navigation guards, and programmatic navigation." },
      { title: "HTTP Requests and APIs", duration: 45, content: "Fetch data from APIs, handle loading states, error handling, and implement CRUD operations in React applications." },
      { title: "Testing React Applications", duration: 60, content: "Write unit tests, integration tests, and end-to-end tests using Jest, React Testing Library, and Cypress." },
      { title: "Final Assessment", duration: 30, content: "Complete the final assessment to test your React knowledge and earn your certificate." }
    ],
    skills: ["React", "JavaScript", "JSX", "Hooks"],
    instructor: "Sarah Johnson",
    rating: 4.8,
    enrolledStudents: 1250
  },
  {
    title: "JavaScript Fundamentals",
    description: "Learn JavaScript from scratch with hands-on projects and real-world examples.",
    category: "Frontend",
    level: "Beginner",
    duration: 30,
    lessons: [
      { title: "Variables and Data Types", duration: 40 },
      { title: "Functions and Scope", duration: 50 },
      { title: "Objects and Arrays", duration: 45 },
      { title: "DOM Manipulation", duration: 60 },
      { title: "Async JavaScript", duration: 55 },
      { title: "ES6+ Features", duration: 50 }
    ],
    skills: ["JavaScript", "DOM", "ES6"],
    instructor: "Mike Chen",
    rating: 4.7,
    enrolledStudents: 2100
  },
  {
    title: "Node.js and Express Mastery",
    description: "Build scalable backend applications with Node.js and Express framework.",
    category: "Backend",
    level: "Intermediate",
    duration: 45,
    lessons: [
      { title: "Node.js Fundamentals", duration: 50 },
      { title: "Express.js Setup", duration: 45 },
      { title: "Middleware and Routing", duration: 55 },
      { title: "Database Integration", duration: 60 },
      { title: "Authentication & Security", duration: 65 },
      { title: "API Development", duration: 50 },
      { title: "Testing and Deployment", duration: 55 }
    ],
    skills: ["Node.js", "Express", "API Development"],
    instructor: "John Smith",
    rating: 4.9,
    enrolledStudents: 1800
  },
  {
    title: "Python for Data Science",
    description: "Learn Python programming specifically for data analysis and machine learning.",
    category: "Data Science",
    level: "Beginner",
    duration: 40,
    lessons: [
      { title: "Python Data Types", duration: 45 },
      { title: "NumPy and Pandas", duration: 60 },
      { title: "Data Visualization", duration: 50 },
      { title: "Statistical Analysis", duration: 55 },
      { title: "Machine Learning Basics", duration: 65 }
    ],
    skills: ["Python", "Data Analysis", "Pandas", "NumPy"],
    instructor: "Dr. Maria Santos",
    rating: 4.8,
    enrolledStudents: 1900
  },
  {
    title: "Docker Containerization",
    description: "Learn containerization with Docker for modern application deployment.",
    category: "DevOps",
    level: "Intermediate",
    duration: 30,
    lessons: [
      { title: "Docker Basics", duration: 45 },
      { title: "Dockerfile and Images", duration: 50 },
      { title: "Container Management", duration: 40 },
      { title: "Docker Compose", duration: 45 },
      { title: "Container Orchestration", duration: 55 }
    ],
    skills: ["Docker", "Containerization", "DevOps"],
    instructor: "Kevin Brown",
    rating: 4.8,
    enrolledStudents: 1400
  }
];

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

const categoryPools = {
  Frontend: {
    titles: [
      'Advanced React Patterns',
      'React Performance Engineering',
      'Modern CSS & Tailwind',
      'TypeScript for React',
      'Next.js Fullstack Basics',
      'State Management with Redux Toolkit',
      'Testing React with RTL',
      'Accessibility in Frontend',
      'Animations with Framer Motion',
      'Frontend Architecture'
    ],
    skills: ['React', 'TypeScript', 'Tailwind', 'Redux', 'Testing']
  },
  Backend: {
    titles: [
      'Advanced Node.js',
      'Express Security Best Practices',
      'RESTful APIs Design',
      'GraphQL with Node',
      'Authentication & Authorization',
      'Scaling Node Apps',
      'MongoDB Data Modeling',
      'Caching & Performance',
      'Message Queues Basics',
      'Testing APIs'
    ],
    skills: ['Node.js', 'Express', 'MongoDB', 'GraphQL', 'JWT']
  },
  'Data Science': {
    titles: [
      'Machine Learning Foundations',
      'Deep Learning Introduction',
      'Pandas Advanced',
      'Data Visualization Mastery',
      'Statistics for DS',
      'Feature Engineering',
      'Model Evaluation',
      'Time Series Basics',
      'NLP Fundamentals',
      'MLOps Overview'
    ],
    skills: ['Python', 'Pandas', 'NumPy', 'ML', 'Visualization']
  },
  DevOps: {
    titles: [
      'Kubernetes Basics',
      'CI/CD Pipelines',
      'Terraform IaC',
      'Monitoring & Logging',
      'Docker Advanced',
      'Cloud Fundamentals',
      'Security & Compliance',
      'GitOps with ArgoCD',
      'Load Balancing & Scaling',
      'Observability'
    ],
    skills: ['Docker', 'Kubernetes', 'CI/CD', 'Terraform', 'Cloud']
  }
};

const lessonTemplates = (topic) => [
  { title: `${topic}: Overview`, duration: 40 },
  { title: `${topic}: Setup`, duration: 45 },
  { title: `${topic}: Core Concepts`, duration: 55 },
  { title: `${topic}: Hands-on`, duration: 60 },
  { title: `${topic}: Best Practices`, duration: 50 },
  { title: `${topic}: Assessment`, duration: 30 }
];

const instructors = ['Alex Rivera', 'Priya Nair', 'Liam O’Connor', 'Yuki Tanaka', 'Noah Williams', 'Amelia Clark'];

const levels = ['Beginner', 'Intermediate', 'Advanced'];

const generateCourses = (count = 30) => {
  const categories = Object.keys(categoryPools);
  const generated = [];
  for (let i = 0; i < count; i++) {
    const category = categories[i % categories.length];
    const pool = categoryPools[category];
    const baseTitle = pool.titles[i % pool.titles.length];
    const title = `${baseTitle} ${i + 1}`;
    const level = levels[i % levels.length];
    const duration = 24 + (i % 20); // 24–43 hours
    const skills = pool.skills.slice(0, 3);
    const instructor = pick(instructors);
    const rating = 4.3 + ((i % 6) * 0.1); // 4.3–4.8
    const enrolledStudents = 500 + (i * 23);

    generated.push({
      title,
      description: `Comprehensive ${category} course on ${baseTitle}. Learn theory, apply in projects, and master best practices.`,
      category,
      level,
      duration,
      lessons: lessonTemplates(baseTitle),
      skills,
      instructor,
      rating: Number(rating.toFixed(1)),
      enrolledStudents
    });
  }
  return generated;
};

export const seedCourses = async () => {
  try {
    // Always reseed to ensure correct IDs
    await Course.deleteMany({});
    const generatedCourses = generateCourses(30);
    await Course.insertMany([...courses, ...generatedCourses]);
    console.log('Courses seeded successfully');
    
    // Log the actual course IDs
    const seededCourses = await Course.find({}, '_id title');
    console.log('Seeded course IDs:', seededCourses.map(c => ({ id: c._id, title: c.title })));
  } catch (error) {
    console.error('Error seeding courses:', error);
  }
};

export default courses;
