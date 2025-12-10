const API_BASE_URL = 'http://localhost:5000/api/dashboard';

export const dashboardAPI = {
  // Get dashboard statistics
  getStats: async () => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/stats`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  // Get weekly activity data
  getWeeklyActivity: async () => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/weekly-activity`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  // Get learning progress
  getProgress: async () => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/progress`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  // Log daily activity
  logActivity: async (activityData) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/log-activity`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(activityData)
    });
    return response.json();
  },

  // Get monthly progress
  getMonthlyProgress: async () => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/monthly-progress`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  // Get learning streak
  getStreak: async () => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/streak`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  }
};