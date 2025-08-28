import React, { useState } from 'react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';
import {
  ChartBarIcon,
  DocumentArrowUpIcon,
  TableCellsIcon,
  Cog6ToothIcon,
  HomeIcon,
  SunIcon,
  MoonIcon
} from '@heroicons/react/24/outline';

const Sidebar = ({ activeTab, setActiveTab, darkMode, setDarkMode }) => {
  const [open, setOpen] = useState(false);

  const navigation = [
    { id: 'dashboard', name: 'Dashboard', icon: HomeIcon },
    { id: 'upload', name: 'Upload Files', icon: DocumentArrowUpIcon },
    { id: 'proposals', name: 'Proposals', icon: TableCellsIcon },
    { id: 'scopes', name: 'Scopes', icon: TableCellsIcon },
    { id: 'vulnerabilities', name: 'Vulnerabilities', icon: TableCellsIcon },
    { id: 'analytics', name: 'Analytics', icon: ChartBarIcon },
  ];

  const toggleTheme = () => {
    const next = !darkMode;
    setDarkMode(next);
    if (next) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    try { localStorage.setItem('darkMode', String(next)); } catch (_) {}
  };

  return (
    <motion.div
      className={cn('h-full px-2 py-4 hidden md:flex md:flex-col bg-black shrink-0')}
      animate={{ width: open ? '300px' : '60px' }}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        {open ? (
          <h1 className="text-xl font-bold text-white">VAPT Dashboard</h1>
        ) : (
          <div className="w-6 h-6 rounded bg-neutral-800" aria-hidden="true"></div>
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
                  ? 'bg-neutral-900 text-white'
                  : 'text-neutral-200 hover:bg-neutral-900'
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
          onClick={toggleTheme}
          className={cn(
            'w-full flex items-center rounded-lg text-sm text-neutral-200 hover:bg-neutral-900',
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
            'mt-2 w-full flex items-center rounded-lg text-sm text-neutral-200 hover:bg-neutral-900',
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