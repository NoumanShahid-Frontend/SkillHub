'use client';
import { useState, useEffect } from 'react';
import { dashboardAPI } from '../../lib/dashboard';
import { coursesAPI } from '../../lib/courses';
import { useToast } from '../../components/Toast';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [weeklyActivity, setWeeklyActivity] = useState([]);
  const [progress, setProgress] = useState([]);
  const [monthlyProgress, setMonthlyProgress] = useState([]);
  const [streak, setStreak] = useState(null);
  const [loading, setLoading] = useState(true);
  const [distribution, setDistribution] = useState([]);
  const toast = useToast();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [statsRes, weeklyRes, progressRes, monthlyRes, streakRes, enrollmentsRes] = await Promise.all([
        dashboardAPI.getStats(),
        dashboardAPI.getWeeklyActivity(),
        dashboardAPI.getProgress(),
        dashboardAPI.getMonthlyProgress(),
        dashboardAPI.getStreak(),
        coursesAPI.getEnrollments()
      ]);

      if (statsRes.success) setStats(statsRes.data);
      if (weeklyRes.success) {
        const fullWeek = ensureFullWeek(weeklyRes.data);
        setWeeklyActivity(fullWeek);
      }
      if (progressRes.success && enrollmentsRes.success) {
        const correctedProgress = calculateLearningProgress(enrollmentsRes.data, statsRes.data);
        setProgress(correctedProgress);
      }
      if (monthlyRes.success) setMonthlyProgress(monthlyRes.data);
      if (streakRes.success) setStreak(streakRes.data);
      if (enrollmentsRes.success) {
        const dist = computeDistribution(enrollmentsRes.data);
        setDistribution(dist);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast?.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const ensureFullWeek = (weeklyData) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dataMap = {};
    weeklyData.forEach(d => {
      dataMap[d.day] = d.studyTime || 0;
    });
    return days.map(day => ({
      day,
      studyTime: dataMap[day] || 0
    }));
  };

  const calculateLearningProgress = (enrollments, stats) => {
    const categoryProgress = {};
    enrollments.forEach(e => {
      const cat = e.courseId?.category;
      if (!cat) return;
      if (!categoryProgress[cat]) {
        categoryProgress[cat] = { enrolled: 0, completed: 0 };
      }
      categoryProgress[cat].enrolled++;
      if (e.completed) categoryProgress[cat].completed++;
    });
    
    return Object.keys(categoryProgress).map(cat => ({
      skill: cat,
      progress: categoryProgress[cat].enrolled > 0 
        ? Math.round((categoryProgress[cat].completed / categoryProgress[cat].enrolled) * 100)
        : 0
    }));
  };

  const computeDistribution = (enrollments) => {
    const totals = {};
    enrollments.forEach(e => {
      const cat = e.courseId?.category;
      if (!cat) return;
      totals[cat] = (totals[cat] || 0) + 1;
    });
    const total = Object.values(totals).reduce((a, b) => a + b, 0) || 1;
    const entries = Object.keys(totals).map(cat => ({
      label: cat,
      value: totals[cat],
      percent: Math.round((totals[cat] / total) * 100)
    })).sort((a, b) => b.value - a.value);
    return entries;
  };

  const logStudySession = async () => {
    try {
      await dashboardAPI.logActivity({
        studyTime: 30, // 30 minutes
        lessonsCompleted: 1
      });
      loadDashboardData(); // Refresh data
    } catch (error) {
      console.error('Error logging activity:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Quick Action */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <button
          onClick={logStudySession}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
        >
          Log 30min Study Session
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold mb-2">Total Courses</h3>
          <p className="text-3xl font-bold">{stats?.totalCourses || 0}</p>
          <p className="text-sm opacity-80">Available courses</p>
        </div>
        
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold mb-2">Completed</h3>
          <p className="text-3xl font-bold">{stats?.completedCourses || 0}</p>
          <p className="text-sm opacity-80">This month</p>
        </div>
        
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold mb-2">Study Hours</h3>
          <p className="text-3xl font-bold">{stats?.studyHours || 0}</p>
          <p className="text-sm opacity-80">This month</p>
        </div>
        
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold mb-2">Certificates</h3>
          <p className="text-3xl font-bold">{stats?.certificates || 0}</p>
          <p className="text-sm opacity-80">Earned</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Progress Chart */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-xl font-semibold mb-4">Learning Progress</h3>
          <div className="space-y-4">
            {progress.length > 0 ? progress.map((skill, index) => {
              const colors = ['bg-blue-600', 'bg-green-600', 'bg-purple-600', 'bg-yellow-600'];
              return (
                <div key={skill.skill}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">{skill.skill}</span>
                    <span className="text-sm text-gray-500">{skill.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`${colors[index % colors.length]} h-2 rounded-full transition-all duration-300`} 
                      style={{width: `${skill.progress}%`}}
                    ></div>
                  </div>
                </div>
              );
            }) : (
              <div className="text-sm text-gray-500">No enrolled courses yet</div>
            )}
          </div>
        </div>

        {/* Activity Chart */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-xl font-semibold mb-4">Weekly Activity</h3>
          <div className="flex h-48">
            {/* Y-axis labels */}
            <div className="flex flex-col justify-between text-xs text-gray-500 mr-2 py-2">
              <span>120m</span>
              <span>90m</span>
              <span>60m</span>
              <span>30m</span>
              <span>0m</span>
            </div>
            {/* Chart area */}
            <div className="flex-1 border-l border-b border-gray-200 pl-2 pb-2">
              <svg className="w-full h-full" viewBox="0 0 350 180">
                {/* Grid lines */}
                <defs>
                  <pattern id="weeklyGrid" width="50" height="45" patternUnits="userSpaceOnUse">
                    <path d="M 50 0 L 0 0 0 45" fill="none" stroke="#f3f4f6" strokeWidth="1"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#weeklyGrid)" />
                
                {/* Bars */}
                {weeklyActivity.map((day, idx) => {
                  const maxTime = Math.max(...weeklyActivity.map(d => d.studyTime), 120);
                  const height = day.studyTime > 0 ? (day.studyTime / maxTime) * 160 : 4;
                  const x = 25 + (idx * 50);
                  const y = 180 - height;
                  return (
                    <g key={day.day}>
                      <rect
                        x={x}
                        y={y}
                        width="30"
                        height={height}
                        fill={day.studyTime > 0 ? '#3B82F6' : '#E5E7EB'}
                        rx="2"
                        className="transition-all duration-300 hover:opacity-80"
                      />
                      <text x={x + 15} y="195" textAnchor="middle" className="text-xs fill-gray-600">{day.day}</text>
                      {day.studyTime > 0 && (
                        <text x={x + 15} y={y - 5} textAnchor="middle" className="text-xs fill-gray-600">{day.studyTime}m</text>
                      )}
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>
          <div className="mt-4 text-center">
            <span className="text-sm text-gray-500">
              Total: {weeklyActivity.reduce((sum, day) => sum + day.studyTime, 0)} minutes this week
            </span>
          </div>
        </div>

        {/* Skill Distribution */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-xl font-semibold mb-4">Skill Distribution</h3>
          {distribution.length > 0 ? (
            <>
              <div className="flex justify-center mb-4">
                <div className="relative w-32 h-32">
                  <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 36 36">
                    {distribution.map((d, idx) => {
                      const colors = ['#3B82F6','#10B981','#8B5CF6','#F59E0B','#F97316'];
                      const prevPercent = distribution.slice(0, idx).reduce((sum, item) => sum + item.percent, 0);
                      const strokeDasharray = `${d.percent} ${100 - d.percent}`;
                      const strokeDashoffset = 100 - prevPercent;
                      return (
                        <circle
                          key={d.label}
                          cx="18"
                          cy="18"
                          r="15.915"
                          fill="transparent"
                          stroke={colors[idx % 5]}
                          strokeWidth="3"
                          strokeDasharray={strokeDasharray}
                          strokeDashoffset={strokeDashoffset}
                          className="transition-all duration-300"
                        />
                      );
                    })}
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm font-semibold text-gray-600">
                      {distribution.length} Skills
                    </span>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                {distribution.map((d, idx) => (
                  <div key={d.label} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full mr-2 ${['bg-blue-500','bg-green-500','bg-purple-500','bg-yellow-500','bg-orange-500'][idx % 5]}`}></div>
                      <span className="text-sm font-medium">{d.label}</span>
                    </div>
                    <span className="text-sm text-gray-500">{d.percent}%</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-sm text-gray-500 text-center py-8">No enrolled courses yet</div>
          )}
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Progress */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-xl font-semibold mb-4">Monthly Progress</h3>
          <div className="flex h-40">
            {/* Y-axis labels */}
            <div className="flex flex-col justify-between text-xs text-gray-500 mr-2 py-2">
              <span>100%</span>
              <span>75%</span>
              <span>50%</span>
              <span>25%</span>
              <span>0%</span>
            </div>
            {/* Chart area */}
            <div className="flex-1 border-l border-b border-gray-200 pl-2 pb-2">
              {monthlyProgress.length > 0 ? (
                <svg className="w-full h-full" viewBox="0 0 300 150">
                  {/* Grid lines */}
                  <defs>
                    <pattern id="monthlyGrid" width="50" height="30" patternUnits="userSpaceOnUse">
                      <path d="M 50 0 L 0 0 0 30" fill="none" stroke="#f3f4f6" strokeWidth="1"/>
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#monthlyGrid)" />
                  
                  {monthlyProgress.length > 1 ? (
                    <polyline
                      fill="none"
                      stroke="#10B981"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      points={monthlyProgress.map((month, idx) => {
                        const spacing = 240 / (monthlyProgress.length - 1);
                        const x = 30 + (idx * spacing);
                        const y = 140 - (month.progress * 1.1);
                        return `${x},${y}`;
                      }).join(' ')}
                    />
                  ) : null}
                  
                  {/* Data points */}
                  {monthlyProgress.map((month, idx) => {
                    const spacing = monthlyProgress.length > 1 ? 240 / (monthlyProgress.length - 1) : 0;
                    const x = monthlyProgress.length === 1 ? 150 : 30 + (idx * spacing);
                    const y = 140 - (month.progress * 1.1);
                    return (
                      <g key={idx}>
                        <circle cx={x} cy={y} r="5" fill="#10B981" stroke="white" strokeWidth="2"/>
                        <text x={x} y={y - 12} textAnchor="middle" className="text-xs fill-gray-600 font-medium">{month.progress}%</text>
                        <text x={x} y={y + 20} textAnchor="middle" className="text-xs fill-gray-500">{month.month}</text>
                      </g>
                    );
                  })}
                </svg>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  No monthly data available
                </div>
              )}
            </div>
          </div>
          <div className="mt-2 text-center">
            <span className="text-sm text-gray-500">
              {monthlyProgress.length > 0 ? `${monthlyProgress.length} month${monthlyProgress.length > 1 ? 's' : ''} of activity` : 'No activity recorded'}
            </span>
          </div>
        </div>

        {/* Learning Streak */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-xl font-semibold mb-4">Learning Streak</h3>
          <div className="text-center">
            <div className="text-4xl font-bold text-orange-500 mb-2">{streak?.currentStreak || 0}</div>
            <p className="text-gray-600 mb-2">Days in a row</p>
            <p className="text-sm text-gray-500 mb-4">Longest: {streak?.longestStreak || 0} days</p>
            <div className="grid grid-cols-7 gap-1">
              {Array.from({length: 21}, (_, i) => {
                const isActive = i < (streak?.currentStreak || 0);
                return (
                  <div 
                    key={i} 
                    className={`w-6 h-6 rounded transition-colors ${
                      isActive ? 'bg-orange-500' : 'bg-gray-200'
                    }`}
                    title={isActive ? `Day ${i + 1}` : 'Not achieved'}
                  ></div>
                );
              })}
            </div>
            <p className="text-sm text-gray-500 mt-2">
              {streak?.currentStreak > 0 ? `🔥 ${streak.currentStreak} day streak!` : 'Start your streak today!'}
            </p>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-xl font-semibold mb-4">Recent Activity</h3>
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-gray-700">Logged study session</span>
            <span className="text-sm text-gray-500 ml-auto">Today</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span className="text-gray-700">Started learning journey</span>
            <span className="text-sm text-gray-500 ml-auto">Recently</span>
          </div>
          {streak?.currentStreak > 0 && (
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <span className="text-gray-700">Achieved {streak.currentStreak}-day learning streak</span>
              <span className="text-sm text-gray-500 ml-auto">Current</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
