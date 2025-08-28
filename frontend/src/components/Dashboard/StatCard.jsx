import React from 'react';

const StatCard = ({ title, value, icon: Icon, color = 'blue', trend }) => {
  const colorClasses = {
    blue: 'bg-primary-500 text-white',
    green: 'bg-success-500 text-white',
    yellow: 'bg-warning-500 text-white',
    red: 'bg-danger-500 text-white',
    crit: 'bg-[#8B0000] text-white',
    high: 'bg-[#FF0000] text-white',
  };

  return (
    <div className="bg-neutral-900 text-white rounded-lg shadow border border-neutral-800 p-6">
      <div className="flex items-center">
        <div className={`p-3 rounded-full ${colorClasses[color]} mr-4`}>
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <p className="text-sm font-medium text-neutral-300">{title}</p>
          <p className="text-2xl font-semibold text-white">{value}</p>
          {trend && (
            <p className={`text-sm ${trend > 0 ? 'text-green-400' : 'text-red-400'}`}>
              {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatCard;