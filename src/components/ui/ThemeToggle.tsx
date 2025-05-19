import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

interface ThemeToggleProps {
  className?: string;
  iconOnly?: boolean;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '', iconOnly = false }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`p-2 rounded-md transition-colors ${
        iconOnly 
          ? 'hover:bg-light-200 dark:hover:bg-dark-300' 
          : 'flex items-center space-x-2 btn-ghost'
      } ${className}`}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'light' ? (
        <>
          <Moon size={18} />
          {!iconOnly && <span>Dark Mode</span>}
        </>
      ) : (
        <>
          <Sun size={18} />
          {!iconOnly && <span>Light Mode</span>}
        </>
      )}
    </button>
  );
};

export default ThemeToggle;