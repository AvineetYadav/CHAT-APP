import React from 'react';
import { getInitials, stringToColor } from '../../utils/helpers';

interface AvatarProps {
  src?: string | null;
  alt: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  status?: 'online' | 'offline' | 'away' | 'busy' | null;
  className?: string;
}

const Avatar: React.FC<AvatarProps> = ({
  src,
  alt,
  size = 'md',
  status = null,
  className = '',
}) => {
  const sizeClasses = {
    xs: 'w-6 h-6 text-[8px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-base',
    xl: 'w-20 h-20 text-lg',
  };

  const statusClasses = {
    online: 'bg-success-500',
    offline: 'bg-light-500 dark:bg-dark-500',
    away: 'bg-warning-500',
    busy: 'bg-error-500',
  };

  const statusSizeClasses = {
    xs: 'w-1.5 h-1.5',
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
    lg: 'w-3 h-3',
    xl: 'w-4 h-4',
  };

  const initials = getInitials(alt);
  const bgColor = stringToColor(alt);

  return (
    <div className={`relative inline-flex ${className}`}>
      {src ? (
        <img
          src={src}
          alt={alt}
          className={`${sizeClasses[size]} rounded-full object-cover border-2 border-light-200 dark:border-dark-600`}
        />
      ) : (
        <div
          className={`${sizeClasses[size]} rounded-full flex items-center justify-center font-medium text-white border-2 border-light-200 dark:border-dark-600`}
          style={{ backgroundColor: bgColor }}
        >
          {initials}
        </div>
      )}
      
      {status && (
        <span 
          className={`absolute block rounded-full ${statusClasses[status]} ${statusSizeClasses[size]} ring-2 ring-white dark:ring-dark-200`}
          style={{ 
            bottom: size === 'xs' ? '-1px' : size === 'sm' ? '0' : '2px', 
            right: size === 'xs' ? '-1px' : size === 'sm' ? '0' : '2px'
          }}
        ></span>
      )}
    </div>
  );
};

export default Avatar;