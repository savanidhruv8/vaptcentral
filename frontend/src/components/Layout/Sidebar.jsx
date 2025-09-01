import React, { useState } from 'react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';
import { useTheme } from '../../context/ThemeContext';
import {
  ArrowUpTrayIcon,
  ChartPieIcon,
  ClipboardDocumentListIcon,
  Squares2X2Icon,
  BugAntIcon,
  Cog6ToothIcon,
  HomeIcon,
  SunIcon,
  MoonIcon
} from '@heroicons/react/24/outline';

const Sidebar = ({ activeTab, setActiveTab }) => {
  const [open, setOpen] = useState(false);
  const { darkMode, toggleTheme } = useTheme();

  const navigation = [
    { id: 'dashboard', name: 'Analytics', icon: HomeIcon },
    { id: 'upload', name: 'Upload Files', icon: ArrowUpTrayIcon },
    { id: 'proposals', name: 'Proposals', icon: ClipboardDocumentListIcon },
    { id: 'scopes', name: 'Scopes', icon: Squares2X2Icon },
    { id: 'vulnerabilities', name: 'Vulnerabilities', icon: BugAntIcon },
    { id: 'analytics', name: 'Dashboard', icon: ChartPieIcon },
  ];

  const onToggleClick = () => toggleTheme();

  return (
    <motion.div
      className={cn('h-full px-2 py-4 hidden md:flex md:flex-col bg-white dark:bg-black shrink-0')}
      animate={{ width: open ? '300px' : '60px' }}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        {open ? (
          <div className="flex items-center gap-2">
            <img src="/vapt-favicon.svg" alt="VAPT" className={cn('w-5 h-5')} />
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">VAPT Dashboard</h1>
          </div>
        ) : (
          <img src="/vapt-favicon.svg" alt="VAPT" className={cn('w-6 h-6')} />
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveTab(item.id)}
              className={cn(
                'w-full flex items-center rounded-lg text-sm transition-colors',
                open ? 'gap-2 py-2 px-3 justify-start' : 'py-3 justify-center',
                isActive
                  ? 'bg-neutral-100 text-gray-900 dark:bg-neutral-900 dark:text-white'
                  : 'text-gray-700 hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-900'
              )}
              title={!open ? item.name : undefined}
            >
              <Icon className={cn(open ? 'h-5 w-5' : 'h-6 w-6')} />
              {open && <span className="whitespace-pre">{item.name}</span>}
            </button>
          );
        })}
      </nav>

      {/* Footer Controls */}
      <div className="pt-4 border-t border-neutral-800">
        <button
          type="button"
          onClick={onToggleClick}
          className={cn(
            'w-full flex items-center rounded-lg text-sm text-gray-700 hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-900',
            open ? 'gap-2 py-2 px-3 justify-start' : 'py-3 justify-center'
          )}
          title={!open ? (darkMode ? 'Light Mode' : 'Dark Mode') : undefined}
        >
          {darkMode ? (
            <SunIcon className={cn(open ? 'h-5 w-5' : 'h-6 w-6')} />
          ) : (
            <MoonIcon className={cn(open ? 'h-5 w-5' : 'h-6 w-6')} />
          )}
          {open && <span className="whitespace-pre">{darkMode ? 'Light Mode' : 'Dark Mode'}</span>}
        </button>
        <button
          type="button"
          className={cn(
            'mt-2 w-full flex items-center rounded-lg text-sm text-gray-700 hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-900',
            open ? 'gap-2 py-2 px-3 justify-start' : 'py-3 justify-center'
          )}
          title={!open ? 'Settings' : undefined}
        >
          <Cog6ToothIcon className={cn(open ? 'h-5 w-5' : 'h-6 w-6')} />
          {open && <span className="whitespace-pre">Settings</span>}
        </button>
      </div>
    </motion.div>
  );
};

export default Sidebar;