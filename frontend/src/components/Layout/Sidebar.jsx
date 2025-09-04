import React, { useState } from 'react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import {
  ArrowUpTrayIcon,
  ChartPieIcon,
  ClipboardDocumentListIcon,
  Squares2X2Icon,
  BugAntIcon,
  Cog6ToothIcon,
  HomeIcon,
  SunIcon,
  MoonIcon,
  UsersIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';

const Sidebar = ({ activeTab, setActiveTab }) => {
  const [open, setOpen] = useState(false);
  const { darkMode, toggleTheme } = useTheme();
  const { user, logout } = useAuth();

  const navigation = [
    { id: 'dashboard', name: 'Analytics', icon: HomeIcon, roles: ['super_admin', 'admin', 'general_user'] },
    { id: 'upload', name: 'Upload Files', icon: ArrowUpTrayIcon, roles: ['super_admin', 'admin'] },
    { id: 'proposals', name: 'Proposals', icon: ClipboardDocumentListIcon, roles: ['super_admin', 'admin', 'general_user'] },
    { id: 'scopes', name: 'Scopes', icon: Squares2X2Icon, roles: ['super_admin', 'admin', 'general_user'] },
    { id: 'vulnerabilities', name: 'Vulnerabilities', icon: BugAntIcon, roles: ['super_admin', 'admin', 'general_user'] },
    { id: 'analytics', name: 'Dashboard', icon: ChartPieIcon, roles: ['super_admin', 'admin', 'general_user'] },
    { id: 'users', name: 'User Management', icon: UsersIcon, roles: ['super_admin'] },
  ];

  // Filter navigation based on user role
  const filteredNavigation = navigation.filter(item => 
    item.roles.includes(user?.role)
  );

  const onToggleClick = () => toggleTheme();

  return (
    <motion.div
      className={cn('h-full px-3 py-6 hidden md:flex md:flex-col bg-white dark:bg-black shrink-0 shadow-lg border-r border-neutral-200 dark:border-neutral-800')}
      animate={{ width: open ? '320px' : '80px' }}
      transition={{ 
        type: "tween",
        duration: 0.2,
        ease: "easeInOut"
      }}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      {/* Header */}
      <div className="flex items-center justify-center mb-8">
        {open ? (
          <div className="flex items-center gap-3">
            <img src="/vapt-favicon.svg" alt="VAPT" className="w-8 h-8" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">VAPT Central</h1>
          </div>
        ) : (
          <img src="/vapt-favicon.svg" alt="VAPT" className="w-10 h-10" />
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2">
        {filteredNavigation.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveTab(item.id)}
              className={cn(
                'w-full flex items-center rounded-xl text-base font-medium transition-all duration-300 ease-in-out group relative transform hover:scale-[1.02] hover:shadow-md',
                open ? 'gap-3 py-3 px-4 justify-start' : 'py-4 justify-center',
                isActive
                  ? 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-white shadow-sm'
                  : 'text-gray-700 hover:bg-gray-50 dark:text-neutral-200 dark:hover:bg-gray-800/50'
              )}
              title={!open ? item.name : undefined}
            >
              <Icon className={cn(
                'transition-all duration-300 ease-in-out transform group-hover:scale-110',
                open ? 'h-6 w-6' : 'h-7 w-7',
                isActive ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-neutral-300 group-hover:text-gray-900 dark:group-hover:text-white'
              )} />
              {open && (
                <span className="whitespace-pre font-semibold transition-all duration-300 ease-in-out transform group-hover:translate-x-1">
                  {item.name}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* User Info */}
      {open && user && (
        <div className="pt-6 border-t border-neutral-200 dark:border-neutral-800">
          <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-12 w-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                  <span className="text-lg font-bold text-gray-700 dark:text-gray-300">
                    {user.first_name?.charAt(0)}{user.last_name?.charAt(0)}
                  </span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-base font-semibold text-gray-900 dark:text-white">
                  {user.first_name} {user.last_name}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                  {user.role?.replace('_', ' ').toUpperCase()}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer Controls */}
      <div className="pt-6 border-t border-neutral-200 dark:border-neutral-800 space-y-2">
        <button
          type="button"
          onClick={onToggleClick}
          className={cn(
            'w-full flex items-center rounded-xl text-base font-medium transition-all duration-300 ease-in-out group transform hover:scale-[1.02] hover:shadow-md',
            open ? 'gap-3 py-3 px-4 justify-start' : 'py-4 justify-center',
            'text-gray-700 hover:bg-gray-50 dark:text-neutral-200 dark:hover:bg-gray-800/50'
          )}
          title={!open ? (darkMode ? 'Light Mode' : 'Dark Mode') : undefined}
        >
          {darkMode ? (
            <SunIcon className={cn(
              'transition-all duration-300 ease-in-out transform group-hover:scale-110 group-hover:rotate-12 text-amber-500 group-hover:text-amber-600',
              open ? 'h-6 w-6' : 'h-7 w-7'
            )} />
          ) : (
            <MoonIcon className={cn(
              'transition-all duration-300 ease-in-out transform group-hover:scale-110 group-hover:-rotate-12 text-slate-600 group-hover:text-slate-700 dark:text-slate-300 dark:group-hover:text-slate-200',
              open ? 'h-6 w-6' : 'h-7 w-7'
            )} />
          )}
          {open && (
            <span className="whitespace-pre font-semibold transition-all duration-300 ease-in-out transform group-hover:translate-x-1">
              {darkMode ? 'Light Mode' : 'Dark Mode'}
            </span>
          )}
        </button>
        
        <button
          type="button"
          onClick={logout}
          className={cn(
            'w-full flex items-center rounded-xl text-base font-medium transition-all duration-300 ease-in-out group transform hover:scale-[1.02] hover:shadow-md',
            open ? 'gap-3 py-3 px-4 justify-start' : 'py-4 justify-center',
            'text-gray-700 hover:bg-gray-50 dark:text-neutral-200 dark:hover:bg-gray-800/50'
          )}
          title={!open ? 'Logout' : undefined}
        >
          <ArrowRightOnRectangleIcon className={cn(
            'transition-all duration-300 ease-in-out transform group-hover:scale-110 group-hover:translate-x-1 text-red-500 group-hover:text-red-600',
            open ? 'h-6 w-6' : 'h-7 w-7'
          )} />
          {open && (
            <span className="whitespace-pre font-semibold transition-all duration-300 ease-in-out transform group-hover:translate-x-1">
              Logout
            </span>
          )}
        </button>
      </div>
    </motion.div>
  );
};

export default Sidebar;