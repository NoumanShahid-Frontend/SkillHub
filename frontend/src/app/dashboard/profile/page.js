'use client';
import { useState, useEffect } from 'react';
import { authAPI } from '../../../lib/auth';

export default function Profile() {
  const [user] = useState(() => authAPI.getUser());

  if (!user) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-2xl font-bold mb-6">Profile Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
            <input 
              type="text" 
              value={user.name} 
              className="w-full p-3 border rounded-lg"
              readOnly
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input 
              type="email" 
              value={user.email} 
              className="w-full p-3 border rounded-lg"
              readOnly
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
            <input 
              type="text" 
              value={user.role} 
              className="w-full p-3 border rounded-lg"
              readOnly
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">User ID</label>
            <input 
              type="text" 
              value={user.userId} 
              className="w-full p-3 border rounded-lg"
              readOnly
            />
          </div>
        </div>
      </div>
    </div>
  );
}
