import React, { ButtonHTMLAttributes } from 'react';
import { twMerge } from 'tailwind-merge';
import LoadingSpinner from './LoadingSpinner';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  className,
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none';
  
  const variantStyles = {
    primary: 'bg-primary-500 text-white hover:bg-primary-600 focus:ring-2 focus:ring-primary-500/50',
    secondary: 'bg-secondary-500 text-white hover:bg-secondary-600 focus:ring-2 focus:ring-secondary-500/50',
    outline: 'border border-light-300 dark:border-dark-600 bg-transparent hover:bg-light-200 dark:hover:bg-dark-700 focus:ring-2 focus:ring-primary-500/20',
    ghost: 'bg-transparent hover:bg-light-200 dark:hover:bg-dark-700 focus:ring-2 focus:ring-primary-500/20',
    danger: 'bg-error-500 text-white hover:bg-error-600 focus:ring-2 focus:ring-error-500/50',
  };
  
  const sizeStyles = {
    sm: 'h-8 px-3 text-xs',
    md: 'h-10 px-4 text-sm',
    lg: 'h-12 px-6 text-base',
  };
  
  const disabledStyles = 'opacity-50 cursor-not-allowed pointer-events-none';
  const fullWidthStyles = 'w-full';
  
  const buttonClasses = twMerge(
    baseStyles,
    variantStyles[variant],
    sizeStyles[size],
    fullWidth ? fullWidthStyles : '',
    (disabled || isLoading) ? disabledStyles : '',
    className
  );

  return (
    <button
      className={buttonClasses}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <LoadingSpinner 
          size="sm" 
          className={`${children ? 'mr-2' : ''} ${variant === 'primary' || variant === 'secondary' || variant === 'danger' ? 'border-white' : ''}`} 
        />
      )}
      {!isLoading && leftIcon && <span className="mr-2">{leftIcon}</span>}
      {children}
      {!isLoading && rightIcon && <span className="ml-2">{rightIcon}</span>}
    </button>
  );
};

export default Button;