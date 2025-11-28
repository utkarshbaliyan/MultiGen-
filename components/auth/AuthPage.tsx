import React, { useState } from 'react';
import LoginPage from './LoginPage';
import SignUpPage from './SignUpPage';

interface AuthPageProps {
  onAuthSuccess: () => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onAuthSuccess }) => {
  const [isLoginView, setIsLoginView] = useState(true);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
       <div className="w-full max-w-md">
        <div className="text-center mb-8">
            <h1 className="text-5xl font-bold text-white tracking-wider">
                Multi<span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">Gen</span>
            </h1>
            <p className="text-gray-400 mt-2">Your Centralized AI Powerhouse</p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 shadow-2xl shadow-purple-500/10">
            <div className="flex space-x-4 mb-8 bg-gray-950 p-1 rounded-lg border border-gray-800">
              <button
                onClick={() => setIsLoginView(true)}
                className={`flex-1 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  isLoginView
                    ? 'bg-purple-600 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => setIsLoginView(false)}
                className={`flex-1 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  !isLoginView
                    ? 'bg-purple-600 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                Sign Up
              </button>
            </div>

            {isLoginView ? (
                <LoginPage onAuthSuccess={onAuthSuccess} />
            ) : (
                <SignUpPage onAuthSuccess={onAuthSuccess} />
            )}
        </div>
       </div>
    </div>
  );
};

export default AuthPage;