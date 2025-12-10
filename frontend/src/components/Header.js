'use client';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authAPI } from '../lib/auth';

export default function Header({ user, title = "Dashboard" }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    authAPI.logout();
    router.push('/login');
  };

  return (
    <header className="flex justify-between items-center mb-8 bg-white p-6 rounded-lg shadow-sm">
      <h1 className="text-3xl font-bold text-gray-800">{title}</h1>
      <div className="flex items-center gap-4 relative">
        <span className="text-gray-700 font-medium">{user?.name}</span>
        <div className="relative" ref={menuRef}>
          <img
            src={`https://ui-avatars.com/api/?name=${user?.name}&background=3b82f6&color=fff`}
            className="w-10 h-10 rounded-full cursor-pointer hover:ring-2 hover:ring-blue-300 transition"
            alt="User Avatar"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          />
          {isMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border py-2 z-50">
              <button
                onClick={() => {
                  router.push('/dashboard/profile');
                  setIsMenuOpen(false);
                }}
                className="w-full cursor-pointer text-left px-4 py-2 hover:bg-gray-100 transition"
              >
                Profile
              </button>
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                }}
                className="w-full cursor-pointer text-left px-4 py-2 hover:bg-gray-100 transition"
              >
                Settings
              </button>
              <hr className="my-2" />
              <button
                onClick={handleLogout}
                className="w-full cursor-pointer text-left px-4 py-2 hover:bg-gray-100 transition text-red-600"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}