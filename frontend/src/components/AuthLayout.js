// components/AuthLayout.js
'use client';
import { motion } from 'framer-motion';

export default function AuthLayout({ isRegister, children }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative bg-blue-50">
      <motion.div
        className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 z-0"
        initial={{ clipPath: 'polygon(0 0, 100% 0, 0% 100%, 0% 100%)' }}
        animate={{
          clipPath: isRegister
            ? 'polygon(0 0, 100% 0, 100% 100%, 0% 100%)'
            : 'polygon(0 0, 100% 0, 0% 100%, 0% 100%)',
        }}
        transition={{ duration: 0.8, ease: 'easeInOut' }}
      ></motion.div>

      <motion.div
        className="relative z-10 w-full max-w-6xl flex bg-white rounded-2xl shadow-2xl overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        {children}
      </motion.div>
    </div>
  );
}
