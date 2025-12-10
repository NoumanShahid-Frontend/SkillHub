'use client';
import { useEffect, useState } from 'react';
import { authAPI } from '../../lib/auth';
import { useRouter } from 'next/navigation';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import { ToastProvider } from '../../components/Toast';

export default function DashboardLayout({ children }) {
  const [user] = useState(() => authAPI.getUser());
  const router = useRouter();

  useEffect(() => {
    if (!authAPI.isAuthenticated()) {
      router.push('/login');
      return;
    }
  }, [router]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-gray-600 text-lg">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <ToastProvider>
      <div className="h-screen bg-gray-100 flex overflow-hidden">
        <Sidebar />
        <div className="flex-1 p-8 overflow-auto">
          <Header user={user} />
          {children}
        </div>
      </div>
    </ToastProvider>
  );
}
