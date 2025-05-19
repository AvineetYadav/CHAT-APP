import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { MessageCircle } from 'lucide-react';
import Button from '../components/ui/Button';
import ThemeToggle from '../components/ui/ThemeToggle';

const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await login(formData.email, formData.password);
      navigate('/chat');
    } catch (err: any) {
      setError(err.response?.data?.message || 'An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-light-100 dark:bg-dark-100">
      <header className="p-4 flex justify-end">
        <ThemeToggle />
      </header>
      
      <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 p-8 bg-white dark:bg-dark-200 rounded-xl shadow-md transition-all animate-fade-in">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 rounded-full bg-primary-500 flex items-center justify-center">
              <MessageCircle size={24} className="text-white" />
            </div>
            <h2 className="mt-6 text-3xl font-bold text-light-900 dark:text-dark-900">
              Welcome back
            </h2>
            <p className="mt-2 text-sm text-light-600 dark:text-dark-400">
              Sign in to continue to ChatSphere
            </p>
          </div>
          
          {error && (
            <div className="bg-error-100 text-error-800 dark:bg-error-900 dark:text-error-200 p-3 rounded-md text-sm">
              {error}
            </div>
          )}
          
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-light-700 dark:text-dark-300">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="input mt-1 w-full"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-light-700 dark:text-dark-300">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="input mt-1 w-full"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <Button
                type="submit"
                fullWidth
                isLoading={isLoading}
              >
                Sign in
              </Button>
            </div>
          </form>
          
          <p className="mt-4 text-center text-sm text-light-600 dark:text-dark-400">
            Don't have an account?{' '}
            <Link to="/register" className="font-medium text-primary-500 hover:text-primary-600">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;