'use client';
import { useRouter } from 'next/navigation';
import AuthForm from '../../components/AuthForm';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export default function RegisterPage() {
  const router = useRouter();
  const [animateRegisterBg, setAnimateRegisterBg] = useState(true);
  const [reverseAnimRegister, setReverseAnimRegister] = useState(false);
  
  const handleRegisterSuccess = (response) => {
    console.log('Registration successful:', response);
    router.push('/login');
  };
  
  const handleSignInClick = () => {
    setReverseAnimRegister(true);
    setTimeout(() => {
      router.push('/login');
    }, 800);
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl flex bg-[#C0C0C0] rounded-2xl shadow-2xl overflow-hidden relative">

        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800"
          initial={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0% 100%)' }}
          animate={reverseAnimRegister
            ? { clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0% 100%)' }
            : animateRegisterBg
              ? { clipPath: 'polygon(100% 0, 100% 0, 100% 100%, 0% 100%)' }
              : {}}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
        ></motion.div>
        <div className="w-full lg:w-1/2 p-8 lg:p-12 flex flex-col justify-center relative z-10">
          <motion.div
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }}
          >
            <div className="w-full max-w-md mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-white mb-2">Join SkillHub</h2>
                <p className="text-white">Fill in your details to get started</p>
              </div>

              <AuthForm type="register" onSuccess={handleRegisterSuccess} />

              <div className="mt-8 text-center">
                <p className="text-white">
                  <span className='text-white'>Alrea</span>dy have an account?{' '}
                  <button
                    className="font-semibold text-blue-100 cursor-pointer hover:text-white transition-colors duration-200"
                    onClick={handleSignInClick}
                  >
                    Sign in here
                  </button>
                </p>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-200">
                <p className="text-xs text-white text-center">
                  By creating an account, you agree to our Terms of Service and Privacy Policy
                </p>
              </div>
            </div>
          </motion.div>
        </div>
        <div className="hidden lg:flex lg:w-1/2 p-12 items-center justify-center relative">
          <motion.div
            className="relative z-10 text-center"
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-8">
              <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">Join SkillHub</h1>
            <p className="text-blue-100 text-lg leading-relaxed">
              Create your account and start your journey with our amazing platform.
            </p>
          </motion.div>
        </div>

      </div>
    </div>
  );
}
