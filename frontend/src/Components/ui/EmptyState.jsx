import React from 'react';

const EmptyState = ({ 
  icon = "📦",
  title = "No data available",
  description = "There's nothing to show here yet.",
  action = null,
  className = ""
}) => {
  return (
    <div className={`text-center py-20 ${className}`}>
      <div className="text-6xl mb-4">{icon}</div>
      <h2 className="text-2xl font-bold text-gray-800 mb-4">{title}</h2>
      <p className="text-gray-600 mb-6">{description}</p>
      {action && (
        <div className="space-y-4">
          {action}
        </div>
      )}
    </div>
  );
};

export default EmptyState;
