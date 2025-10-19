import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardBody, Button, Divider } from '@nextui-org/react';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // TODO: Implement actual forgot password API call
      console.log('Forgot password for:', email);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setIsEmailSent(true);
    } catch (err) {
      setError('Failed to send reset email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isEmailSent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black p-4 sm:p-6 lg:p-8 flex items-center justify-center">
        <div className="w-full max-w-sm sm:max-w-md lg:max-w-lg">
          <Card className="bg-gray-900/50 backdrop-blur-md border border-gray-800 shadow-2xl">
            <CardHeader className="flex flex-col gap-3 pb-4 sm:pb-6 px-4 sm:px-6 pt-6 sm:pt-8">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-base sm:text-lg">✓</span>
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-white">Email Sent</h1>
                  <p className="text-gray-400 text-xs sm:text-sm">Check your inbox</p>
                </div>
              </div>
            </CardHeader>
            
            <Divider className="bg-gray-700" />
            
            <CardBody className="pt-4 sm:pt-6 px-4 sm:px-6 pb-6 sm:pb-8">
              <div className="text-center space-y-4">
                <p className="text-gray-300">
                  We've sent a password reset link to{' '}
                  <span className="text-white font-medium">{email}</span>
                </p>
                <p className="text-gray-400 text-sm">
                  Please check your email and follow the instructions to reset your password.
                </p>
                
                <div className="pt-4">
                  <Link to="/auth/signin">
                    <Button className="w-full bg-red-600 hover:bg-red-700 text-white font-medium">
                      Back to Sign In
                    </Button>
                  </Link>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    );
  }

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
                <h1 className="text-xl sm:text-2xl font-bold text-white">Reset Password</h1>
                <p className="text-gray-400 text-xs sm:text-sm">Enter your email address</p>
              </div>
            </div>
          </CardHeader>
          
          <Divider className="bg-gray-700" />
          
          <CardBody className="pt-4 sm:pt-6 px-4 sm:px-6 pb-6 sm:pb-8">
            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-11 px-3 text-sm bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
                />
                <p className="text-gray-400 text-xs mt-2">
                  We'll send you a link to reset your password
                </p>
              </div>

              {error && (
                <div className="text-red-500 text-sm text-center bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-red-600 hover:bg-red-700 text-white font-medium text-sm h-11"
                isDisabled={!email || isLoading}
                isLoading={isLoading}
              >
                {isLoading ? 'Sending...' : 'Send Reset Link'}
              </Button>
            </form>

            {/* Back to Sign In */}
            <div className="text-center pt-4 border-t border-gray-700">
              <p className="text-gray-400 text-sm">
                Remember your password?{' '}
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

export default ForgotPassword;