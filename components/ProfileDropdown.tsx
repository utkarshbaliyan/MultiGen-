import React, { useState, useEffect, useRef } from 'react';
import { User } from '../types';

interface ProfileDropdownProps {
  user: User | null;
  onLogout: () => void;
}

const UserIcon = ({ className = 'w-6 h-6' }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
);

const ProfileDropdown: React.FC<ProfileDropdownProps> = ({ user, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-full hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <UserIcon className="w-6 h-6 text-gray-400" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-gray-900/80 backdrop-blur-md border border-gray-800 rounded-lg shadow-lg z-20">
          {user && (
            <div className="px-4 py-3 border-b border-gray-700">
              <p className="text-sm font-medium text-white truncate">Signed in as</p>
              <p className="text-sm text-gray-400 truncate">{user.email}</p>
            </div>
          )}
          <ul className="py-1">
            <li>
              <a href="#" className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-800">Manage Account</a>
            </li>
            <li>
              <button
                onClick={() => {
                  setIsOpen(false);
                  onLogout();
                }}
                className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-800"
              >
                Logout
              </button>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;