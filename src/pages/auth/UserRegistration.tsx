import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardBody, Button, Divider } from '@nextui-org/react';

interface UserRegistrationData {
  personalInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    dateOfBirth: string;
  };
  addressInfo: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  accountInfo: {
    username: string;
    password: string;
    confirmPassword: string;
  };
}

const UserRegistration: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState<UserRegistrationData>({
    personalInfo: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      dateOfBirth: ''
    },
    addressInfo: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    },
    accountInfo: {
      username: '',
      password: '',
      confirmPassword: ''
    }
  });

  const handleInputChange = (section: keyof UserRegistrationData, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        const { firstName, lastName, email, phone } = formData.personalInfo;
        return !!(firstName && lastName && email && phone);
      case 2:
        const { street, city, state, zipCode, country } = formData.addressInfo;
        return !!(street && city && state && zipCode && country);
      case 3:
        const { username, password, confirmPassword } = formData.accountInfo;
        return !!(username && password && confirmPassword && password === confirmPassword);
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
      setError('');
    } else {
      setError('Please fill in all required fields');
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => prev - 1);
    setError('');
  };

  const handleSubmit = async () => {
    if (!validateStep(3)) {
      setError('Please complete all fields correctly');
      return;
    }

    if (formData.accountInfo.password !== formData.accountInfo.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // TODO: Implement actual registration API call
      console.log('Registration data:', formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // For now, just redirect to signin
      navigate('/auth/signin');
    } catch (err) {
      setError('Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderPersonalInfo = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-gray-300 text-sm font-medium mb-2">First Name</label>
          <input
            type="text"
            placeholder="First name"
            value={formData.personalInfo.firstName}
            onChange={(e) => handleInputChange('personalInfo', 'firstName', e.target.value)}
            className="w-full h-10 px-3 text-sm bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
          />
        </div>
        <div>
          <label className="block text-gray-300 text-sm font-medium mb-2">Last Name</label>
          <input
            type="text"
            placeholder="Last name"
            value={formData.personalInfo.lastName}
            onChange={(e) => handleInputChange('personalInfo', 'lastName', e.target.value)}
            className="w-full h-10 px-3 text-sm bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
          />
        </div>
      </div>
      
      <div>
        <label className="block text-gray-300 text-sm font-medium mb-2">Email</label>
        <input
          type="email"
          placeholder="Email address"
          value={formData.personalInfo.email}
          onChange={(e) => handleInputChange('personalInfo', 'email', e.target.value)}
          className="w-full h-10 px-3 text-sm bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
        />
      </div>
      
      <div>
        <label className="block text-gray-300 text-sm font-medium mb-2">Phone</label>
        <input
          type="tel"
          placeholder="Phone number"
          value={formData.personalInfo.phone}
          onChange={(e) => handleInputChange('personalInfo', 'phone', e.target.value)}
          className="w-full h-10 px-3 text-sm bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
        />
      </div>
      
      <div>
        <label className="block text-gray-300 text-sm font-medium mb-2">Date of Birth</label>
        <input
          type="date"
          value={formData.personalInfo.dateOfBirth}
          onChange={(e) => handleInputChange('personalInfo', 'dateOfBirth', e.target.value)}
          className="w-full h-10 px-3 text-sm bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
        />
      </div>
    </div>
  );

  const renderAddressInfo = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-gray-300 text-sm font-medium mb-2">Street Address</label>
        <input
          type="text"
          placeholder="Street address"
          value={formData.addressInfo.street}
          onChange={(e) => handleInputChange('addressInfo', 'street', e.target.value)}
          className="w-full h-10 px-3 text-sm bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
        />
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-gray-300 text-sm font-medium mb-2">City</label>
          <input
            type="text"
            placeholder="City"
            value={formData.addressInfo.city}
            onChange={(e) => handleInputChange('addressInfo', 'city', e.target.value)}
            className="w-full h-10 px-3 text-sm bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
          />
        </div>
        <div>
          <label className="block text-gray-300 text-sm font-medium mb-2">State</label>
          <input
            type="text"
            placeholder="State"
            value={formData.addressInfo.state}
            onChange={(e) => handleInputChange('addressInfo', 'state', e.target.value)}
            className="w-full h-10 px-3 text-sm bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-gray-300 text-sm font-medium mb-2">ZIP Code</label>
          <input
            type="text"
            placeholder="ZIP code"
            value={formData.addressInfo.zipCode}
            onChange={(e) => handleInputChange('addressInfo', 'zipCode', e.target.value)}
            className="w-full h-10 px-3 text-sm bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
          />
        </div>
        <div>
          <label className="block text-gray-300 text-sm font-medium mb-2">Country</label>
          <input
            type="text"
            placeholder="Country"
            value={formData.addressInfo.country}
            onChange={(e) => handleInputChange('addressInfo', 'country', e.target.value)}
            className="w-full h-10 px-3 text-sm bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
          />
        </div>
      </div>
    </div>
  );

  const renderAccountInfo = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-gray-300 text-sm font-medium mb-2">Username</label>
        <input
          type="text"
          placeholder="Choose a username"
          value={formData.accountInfo.username}
          onChange={(e) => handleInputChange('accountInfo', 'username', e.target.value)}
          className="w-full h-10 px-3 text-sm bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
        />
      </div>
      
      <div>
        <label className="block text-gray-300 text-sm font-medium mb-2">Password</label>
        <input
          type="password"
          placeholder="Create a password"
          value={formData.accountInfo.password}
          onChange={(e) => handleInputChange('accountInfo', 'password', e.target.value)}
          className="w-full h-10 px-3 text-sm bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
        />
      </div>
      
      <div>
        <label className="block text-gray-300 text-sm font-medium mb-2">Confirm Password</label>
        <input
          type="password"
          placeholder="Confirm your password"
          value={formData.accountInfo.confirmPassword}
          onChange={(e) => handleInputChange('accountInfo', 'confirmPassword', e.target.value)}
          className="w-full h-10 px-3 text-sm bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
        />
      </div>
    </div>
  );

  const stepTitles = ['Personal Information', 'Address Information', 'Account Setup'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black p-4 sm:p-6 lg:p-8 flex items-center justify-center">
      <div className="w-full max-w-md lg:max-w-lg">
        <Card className="bg-gray-900/50 backdrop-blur-md border border-gray-800 shadow-2xl">
          <CardHeader className="flex flex-col gap-3 pb-4 px-4 sm:px-6 pt-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">{currentStep}</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">{stepTitles[currentStep - 1]}</h1>
                <p className="text-gray-400 text-sm">Step {currentStep} of 3</p>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-red-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / 3) * 100}%` }}
              />
            </div>
          </CardHeader>
          
          <Divider className="bg-gray-700" />
          
          <CardBody className="pt-4 px-4 sm:px-6 pb-6">
            <div className="space-y-5">
              {currentStep === 1 && renderPersonalInfo()}
              {currentStep === 2 && renderAddressInfo()}
              {currentStep === 3 && renderAccountInfo()}

              {error && (
                <div className="text-red-500 text-sm text-center bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                  {error}
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex gap-3 pt-4">
                {currentStep > 1 && (
                  <Button
                    onClick={handlePrevious}
                    className="flex-1 bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white border border-gray-600 hover:border-gray-500 font-medium text-sm h-10 rounded-full transition-all duration-200"
                  >
                    Previous
                  </Button>
                )}
                
                {currentStep < 3 ? (
                  <Button
                    onClick={handleNext}
                    className="flex-1 bg-gray-600 hover:bg-white text-white hover:text-black border border-gray-500 hover:border-gray-400 font-medium text-sm h-10 rounded-full transition-all duration-200"
                  >
                    Next
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    className="flex-1 bg-gray-600 hover:bg-white text-white hover:text-black border border-gray-500 hover:border-gray-400 font-medium text-sm h-10 rounded-full transition-all duration-200"
                    isLoading={isLoading}
                    isDisabled={isLoading}
                  >
                    {isLoading ? 'Creating Account...' : 'Complete Registration'}
                  </Button>
                )}
              </div>
            </div>

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

export default UserRegistration;