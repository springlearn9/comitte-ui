import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardBody, Button, Divider } from '@nextui-org/react';

const SignUp: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    fullName: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Basic validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setIsLoading(false);
      return;
    }

    try {
      // TODO: Implement actual signup API call
      console.log('Signup data:', formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For now, just redirect to signin
      navigate('/auth/signin');
    } catch (err) {
      setError('Registration failed. Please try again.');
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
                <h1 className="text-xl sm:text-2xl font-bold text-white">Create Account</h1>
                <p className="text-gray-400 text-xs sm:text-sm">Join Comitte Management</p>
              </div>
            </div>
          </CardHeader>
          
          <Divider className="bg-gray-700" />
          
          <CardBody className="pt-4 sm:pt-6 px-4 sm:px-6 pb-6 sm:pb-8">
            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  name="fullName"
                  placeholder="Enter your full name"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="w-full h-11 px-3 text-sm bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Username
                </label>
                <input
                  type="text"
                  name="username"
                  placeholder="Choose a username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="w-full h-11 px-3 text-sm bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full h-11 px-3 text-sm bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
                />
              </div>
              
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full h-11 px-3 text-sm bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full h-11 px-3 text-sm bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
                />
              </div>

              {error && (
                <div className="text-red-500 text-sm text-center bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-red-600 hover:bg-red-700 text-white font-medium text-sm h-11"
                isDisabled={!formData.username || !formData.email || !formData.password || !formData.confirmPassword || isLoading}
                isLoading={isLoading}
              >
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </Button>
            </form>

            {/* Sign In Link */}
            <div className="text-center pt-4 border-t border-gray-700">
              <p className="text-gray-400 text-sm">
                Already have an account?{' '}
                <Link to="/auth/signin" className="text-red-400 hover:text-red-300 font-medium transition-colors">
                  Sign In
                </Link>
              </p>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default SignUp;