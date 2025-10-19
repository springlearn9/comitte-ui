import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardHeader, CardBody, Button, Divider } from '@nextui-org/react';
import { useAuth } from '../../hooks/useAuth';

const SignIn: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const success = await login(username, password);
      if (success) {
        navigate('/dashboard');
      } else {
        setError('Invalid username or password');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black p-4 sm:p-6 lg:p-8 flex items-center justify-center">
      <div className="w-full max-w-sm sm:max-w-md lg:max-w-lg">
        <Card className="bg-gray-900/50 backdrop-blur-md border border-gray-800 shadow-2xl">
          <CardHeader className="flex flex-col gap-3 pb-4 sm:pb-6 px-4 sm:px-6 pt-6 sm:pt-8">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-red-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-base sm:text-lg">C</span>
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-white">Comitte</h1>
                <p className="text-gray-400 text-xs sm:text-sm">Management System</p>
              </div>
            </div>
          </CardHeader>
          
          <Divider className="bg-gray-700" />
          
          <CardBody className="pt-4 sm:pt-6 px-4 sm:px-6 pb-6 sm:pb-8">
            <form onSubmit={handleSubmit} noValidate className="space-y-5 sm:space-y-6">
              <div className="space-y-4 sm:space-y-5">
                <div>
                  <label className="block text-gray-300 text-sm sm:text-base font-medium mb-2">
                    Username
                  </label>
                  <input
                    type="text"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full h-11 sm:h-12 px-3 sm:px-4 text-sm sm:text-base bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-300 text-sm sm:text-base font-medium mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-11 sm:h-12 px-3 sm:px-4 text-sm sm:text-base bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
                  />
                </div>
              </div>

              {error && (
                <div className="text-red-500 text-sm text-center bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-red-600 hover:bg-red-700 text-white font-medium text-sm sm:text-base h-11 sm:h-12"
                isDisabled={!username || !password || isLoading}
                isLoading={isLoading}
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            {/* Auth Links */}
            <div className="space-y-4 pt-4 border-t border-gray-700">
              {/* Forgot Password */}
              <div className="text-center">
                <Link to="/auth/forgot-password" className="text-red-400 hover:text-red-300 text-sm font-medium transition-colors">
                  Forgot Password?
                </Link>
              </div>

              {/* Sign Up Link */}
              <div className="text-center">
                <p className="text-gray-400 text-xs sm:text-sm">
                  Don't have an account?{' '}
                  <Link to="/auth/signup" className="text-red-400 hover:text-red-300 font-medium transition-colors">
                    Sign Up
                  </Link>
                </p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default SignIn;