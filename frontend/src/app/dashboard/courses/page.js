'use client';
import { useState, useEffect } from 'react';
import { coursesAPI } from '../../../lib/courses';
import { useToast } from '../../../components/Toast';

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('relevance');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(9);
  const toast = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [coursesRes, enrollmentsRes] = await Promise.all([
        coursesAPI.getCourses(),
        coursesAPI.getEnrollments()
      ]);
      
      if (coursesRes.success) setCourses(coursesRes.data);
      if (enrollmentsRes.success) setEnrollments(enrollmentsRes.data);
    } catch (error) {
      console.error('Error loading courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (courseId) => {
    try {
      const result = await coursesAPI.enrollCourse(courseId);
      if (result.success) {
        loadData();
        toast?.success('Enrolled successfully');
      } else {
        toast?.error(result.message || 'Failed to enroll');
      }
    } catch (error) {
      toast?.error('Error enrolling');
    }
  };

  const isEnrolled = (courseId) => {
    return enrollments.some(e => e.courseId && e.courseId._id === courseId);
  };

  const filteredCourses = courses.filter(course => {
    if (filter === 'all') return true;
    if (filter === 'enrolled') return isEnrolled(course._id);
    return course.category === filter;
  }).filter(course => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      course.title.toLowerCase().includes(q) ||
      (course.description || '').toLowerCase().includes(q) ||
      (course.instructor || '').toLowerCase().includes(q)
    );
  }).sort((a, b) => {
    if (sort === 'rating') return (b.rating || 0) - (a.rating || 0);
    if (sort === 'duration') return (a.duration || 0) - (b.duration || 0);
    if (sort === 'level') {
      const order = { Beginner: 0, Intermediate: 1, Advanced: 2 };
      return (order[a.level] ?? 99) - (order[b.level] ?? 99);
    }
    return 0;
  });

  useEffect(() => {
    setPage(1);
  }, [filter, search, sort]);

  const totalPages = Math.max(1, Math.ceil(filteredCourses.length / pageSize));
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const paginatedCourses = filteredCourses.slice(start, end);

  if (loading) {
    return <div className="text-center py-8">Loading courses...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="flex flex-wrap gap-2">
          {['all', 'enrolled', 'Frontend', 'Backend', 'Data Science', 'DevOps'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg transition ${
                filter === f 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search courses"
            className="w-full px-3 py-2 border rounded"
          />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="w-full px-3 py-2 border rounded"
          >
            <option value="relevance">Sort: Relevance</option>
            <option value="rating">Sort: Rating</option>
            <option value="duration">Sort: Duration</option>
            <option value="level">Sort: Level</option>
          </select>
          <div className="flex items-center text-sm text-gray-500">
            <span>{filteredCourses.length} results</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {paginatedCourses.map(course => (
          <div key={course._id} className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-start mb-3">
                <span className={`px-2 py-1 text-xs rounded-full ${
                  course.level === 'Beginner' ? 'bg-green-100 text-green-800' :
                  course.level === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {course.level}
                </span>
                <span className="text-sm text-gray-500">{course.duration}h</span>
              </div>
              
              <h3 className="text-lg font-semibold mb-2">{course.title}</h3>
              <p className="text-gray-600 text-sm mb-4">{course.description}</p>
              
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-gray-500">By {course.instructor}</span>
                <div className="flex items-center">
                  <span className="text-yellow-500">★</span>
                  <span className="text-sm ml-1">{course.rating}</span>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-1 mb-4">
                {course.skills.slice(0, 3).map(skill => (
                  <span key={skill} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded">
                    {skill}
                  </span>
                ))}
              </div>
              {isEnrolled(course._id) && (
                <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${enrollments.find(e => e.courseId && e.courseId._id === course._id)?.progress || 0}%` }}
                  ></div>
                </div>
              )}
              
              {isEnrolled(course._id) ? (
                <div className="space-y-2">
                  <button
                    onClick={() => window.location.href = `/dashboard/study/${course._id}`}
                    className="w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                  >
                    Continue Learning
                  </button>
                  <div className="text-xs text-center text-gray-500">
                    Progress: {enrollments.find(e => e.courseId && e.courseId._id === course._id)?.progress || 0}%
                  </div>
                  <button
                    onClick={() => window.location.href = `/dashboard/assessment/${course._id}`}
                    className="w-full py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition"
                  >
                    Practice Questions
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => handleEnroll(course._id)}
                  className="w-full py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
                >
                  Enroll Now
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-2 bg-gray-100 rounded disabled:opacity-50"
          >Prev</button>
          <span className="text-sm text-gray-600">Page {page} of {totalPages}</span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-2 bg-gray-100 rounded disabled:opacity-50"
          >Next</button>
        </div>
        <div>
          <select
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
            className="px-3 py-2 border rounded"
          >
            <option value={6}>6 per page</option>
            <option value={9}>9 per page</option>
            <option value={12}>12 per page</option>
          </select>
        </div>
      </div>
    </div>
  );
}
