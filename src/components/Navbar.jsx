import React from 'react';
import { Cloud, LogOut, Search, X, Upload } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';
import StorageMeter from './StorageMeter';

export default function Navbar({ searchQuery, setSearchQuery, onUploadClick, totalBytes }) {
  const { user, signOut } = useAuth();
  const userDisplayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Account';

  return (
    <header className="sticky top-0 z-30 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-sm border-b border-zinc-200 dark:border-zinc-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 gap-3">
          
          {/* Brand Logo */}
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 flex items-center justify-center font-bold">
              <Cloud className="w-4 h-4" />
            </div>
            <span className="font-semibold text-sm tracking-tight text-zinc-900 dark:text-zinc-100">
              CloudVault
            </span>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-sm mx-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search files..."
                className="w-full bg-zinc-100 dark:bg-zinc-900 border border-transparent focus:border-zinc-300 dark:focus:border-zinc-700 rounded-lg pl-8 pr-7 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Actions & Profile */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Storage Meter */}
            <div className="hidden md:block">
              <StorageMeter totalBytes={totalBytes} />
            </div>

            {/* Upload Button */}
            <button
              onClick={onUploadClick}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-zinc-900 text-xs font-semibold rounded-lg shadow-subtle transition"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload</span>
            </button>

            {/* Theme Switcher */}
            <ThemeToggle />

            {/* User Avatar & Logout */}
            <div className="flex items-center space-x-1 pl-1 border-l border-zinc-200 dark:border-zinc-800">
              <div 
                className="w-7 h-7 rounded-lg bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 flex items-center justify-center text-xs font-semibold"
                title={user?.email}
              >
                {userDisplayName.charAt(0).toUpperCase()}
              </div>

              <button
                onClick={signOut}
                title="Sign out"
                className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-lg transition"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>

          </div>

        </div>
      </div>
    </header>
  );
}
