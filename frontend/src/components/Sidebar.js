'use client';
import { authAPI } from '../lib/auth';
import { useRouter, usePathname } from 'next/navigation';

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    authAPI.logout();
    router.push('/');
  };

  const isActive = (path) => pathname === path;

  return (
    <aside className="w-64 bg-white shadow-lg p-6 hidden md:block relative">
      <h2 className="text-2xl font-bold mb-8 text-blue-600">SkillHub</h2>
      <nav className="space-y-4">
        <button 
          onClick={() => router.push('/dashboard')}
          className={`w-full text-left py-2 px-3 rounded-lg transition ${
            isActive('/dashboard') 
              ? 'bg-blue-50 text-blue-700 font-medium' 
              : 'hover:bg-gray-100'
          }`}
        >
          Dashboard
        </button>
        <button 
          onClick={() => router.push('/dashboard/profile')}
          className={`w-full text-left py-2 px-3 rounded-lg transition ${
            isActive('/dashboard/profile') 
              ? 'bg-blue-50 text-blue-700 font-medium' 
              : 'hover:bg-gray-100'
          }`}
        >
          Profile
        </button>
        <button 
          onClick={() => router.push('/dashboard/courses')}
          className={`w-full text-left py-2 px-3 rounded-lg transition ${
            isActive('/dashboard/courses') 
              ? 'bg-blue-50 text-blue-700 font-medium' 
              : 'hover:bg-gray-100'
          }`}
        >
          Courses
        </button>
        <button className="w-full text-left py-2 px-3 rounded-lg hover:bg-gray-100 transition">
          Settings
        </button>
      </nav>

      <div className="absolute bottom-6 left-6 right-6">
        <button
          onClick={handleLogout}
          className="w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition"
        >
          Logout
        </button>
      </div>
    </aside>
  );
}