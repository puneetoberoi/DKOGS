import React, { useState, useRef, useEffect } from 'react';
import { LogOut, LayoutGrid, ChevronDown, User as UserIcon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import type { User } from '@supabase/supabase-js';

interface UserMenuProps {
  user: User;
  onDashboardClick: () => void;
}

export const UserMenu: React.FC<UserMenuProps> = ({ user, onDashboardClick }) => {
  const { signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const avatarUrl = user.user_metadata?.avatar_url;
  const fullName = user.user_metadata?.full_name || user.email?.split('@')[0];

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1 pr-2 rounded-full border border-slate-200 hover:bg-slate-50 transition-colors bg-white"
      >
        {avatarUrl ? (
          <img src={avatarUrl} alt={fullName} className="w-8 h-8 rounded-full" />
        ) : (
          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
            <UserIcon size={16} />
          </div>
        )}
        <ChevronDown size={14} className="text-slate-400" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-100 py-1 z-50 animate-in slide-in-from-top-2 fade-in duration-200">
          <div className="px-4 py-3 border-b border-slate-100">
            <p className="text-sm font-medium text-slate-900 truncate">{fullName}</p>
            <p className="text-xs text-slate-500 truncate">{user.email}</p>
          </div>
          
          <button
            onClick={() => {
              onDashboardClick();
              setIsOpen(false);
            }}
            className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
          >
            <LayoutGrid size={16} />
            My Dashboard
          </button>
          
          <button
            onClick={() => {
              signOut();
              setIsOpen(false);
            }}
            className="w-full text-left px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 flex items-center gap-2"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
};
