'use client';
import { useState,useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AuthForm from '../../components/AuthForm';
import Link from 'next/link';
import { motion } from 'framer-motion';
import logo from "../../assests/logo.png";
export default function LoginPage() {
  const router = useRouter();
  const [animateBg, setAnimateBg] = useState(true);
  const [reverseAnim, setReverseAnim] = useState(false);
  const handleLoginSuccess = (response) => {
    console.log('Login successful:', response);
    router.push('/');
  };
  useEffect(() => {}, []);
  
  const handleCreateAccountClick = () => {
    setReverseAnim(true);
    setTimeout(() => {
      router.push('/register');
    }, 800);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center p-4">
      <div className="w-full max-w-6xl bg-[#C0C0C0] flex rounded-2xl shadow-2xl overflow-hidden relative">
        
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800"
          initial={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0% 100%)' }}
          animate={
            reverseAnim
              ? { clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0% 100%)' }
              : animateBg
                ? { clipPath: 'polygon(0 0, 100% 0, 0% 100%, 0% 100%)' }
                : {}
          }
          transition={{ duration: 0.8, ease: 'easeInOut' }}
        ></motion.div>


        <div className="hidden lg:flex lg:w-1/2 p-12 items-center justify-start relative">
          <motion.div
            className="relative z-10 text-center"
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
          <div className="relative z-10 text-center">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-8">
              <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">Welcome to SkillHub</h1>
            <p className="text-blue-100 text-lg leading-relaxed">
              Sign in to access your dashboard and manage<br></br> your account with ease.
            </p>
          </div>
          </motion.div>
        </div>


        <div className="w-full lg:w-1/2 p-8 lg:p-12 flex flex-col justify-center relative z-10">
           <motion.div
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }}
          >
          <div className="w-full max-w-md mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">Sign In to SkillHub</h2>
              {/* <p className="text-white">Enter your credentials to continue</p> */}
            </div>

            <AuthForm type="login" onSuccess={handleLoginSuccess} />

            <div className="mt-8 text-center">
              <p className="text-white">
                Don’t have an account?{' '}
                <button
                  className="font-semibold text-blue-500 hover:text-blue-900 transition-colors duration-200 cursor-pointer"
                  onClick={handleCreateAccountClick}
                >
                  Create one here
                </button>
              </p>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-xs text-white text-center">
                By signing in, you agree to our Terms of Service and Privacy Policy
              </p>
            </div>
          </div>
          </motion.div>
        </div>

      </div>
    </div>
  );
}
