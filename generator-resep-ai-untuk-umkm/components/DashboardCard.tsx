import React from 'react';

interface DashboardCardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  className?: string;
  noPadding?: boolean;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ 
  children, 
  title, 
  subtitle, 
  className = '', 
  noPadding = false 
}) => {
  return (
    <div className={`bg-white border border-gray-200 rounded-lg ${className}`}>
      {(title || subtitle) && (
        <div className="px-6 py-4 border-b border-gray-200">
          {title && <h3 className="text-sm font-semibold text-gray-900">{title}</h3>}
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
      )}
      <div className={noPadding ? '' : 'p-6'}>
        {children}
      </div>
    </div>
  );
};

export default DashboardCard;
