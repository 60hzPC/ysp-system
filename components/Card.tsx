import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  glass?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hover = false,
  glass = false,
  padding = 'md',
}) => {
  const baseStyles = 'rounded-xl border transition-all duration-300';
  
  const glassStyles = glass
    ? 'bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg border-white/20 dark:border-gray-700/20 shadow-xl'
    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg';
  
  const hoverStyles = hover
    ? 'hover:shadow-2xl hover:-translate-y-1 cursor-pointer'
    : '';
  
  const paddingStyles = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };
  
  return (
    <div className={`${baseStyles} ${glassStyles} ${hoverStyles} ${paddingStyles[padding]} ${className}`}>
      {children}
    </div>
  );
};

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  trend,
  className = '',
}) => {
  return (
    <Card glass hover className={className}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
            {title}
          </p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {value}
          </p>
          {trend && (
            <div className={`flex items-center text-sm font-medium ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
              <svg
                className={`w-4 h-4 mr-1 ${trend.isPositive ? '' : 'rotate-180'}`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              {Math.abs(trend.value)}%
            </div>
          )}
        </div>
        {icon && (
          <div className="flex-shrink-0 p-3 bg-yspOrange-100 dark:bg-yspOrange-900/30 rounded-lg">
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
};
