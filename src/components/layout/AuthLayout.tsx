import React from 'react';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  showLogo?: boolean;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ 
  children, 
  title, 
  subtitle = "Management System",
  showLogo = true 
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black p-4 sm:p-6 lg:p-8 flex items-center justify-center">
      <div className="w-full max-w-sm sm:max-w-md lg:max-w-lg">
        {showLogo && (
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-2xl">C</span>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Comitte</h1>
            <p className="text-gray-400">{subtitle}</p>
          </div>
        )}
        
        <div className="bg-gray-900/50 backdrop-blur-md border border-gray-800 shadow-2xl rounded-lg">
          <div className="p-6 sm:p-8">
            <div className="text-center mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-white">{title}</h2>
            </div>
            
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;