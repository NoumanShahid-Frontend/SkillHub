const API_BASE_URL = 'http://localhost:5000/api/courses';

export const coursesAPI = {
  // Get all courses
  getCourses: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    const response = await fetch(`${API_BASE_URL}?${params}`);
    return response.json();
  },

  // Get course by ID
  getCourse: async (id) => {
    const response = await fetch(`${API_BASE_URL}/${id}`);
    return response.json();
  },

  // Enroll in course
  enrollCourse: async (courseId) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/${courseId}/enroll`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  // Get user enrollments
  getEnrollments: async () => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/user/enrollments`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  // Complete lesson
  completeLesson: async (courseId, lessonId) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/${courseId}/lessons/${lessonId}/complete`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  // Complete course
  completeCourse: async (courseId) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/${courseId}/complete`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  }
};