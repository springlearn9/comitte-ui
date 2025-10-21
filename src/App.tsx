import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { NextUIProvider } from '@nextui-org/react';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './hooks/useAuth';
import Dashboard from './pages/Dashboard';
import Bids from './pages/bids/Bids';
import { Committees } from './pages/committee';
import { SignIn, SignUp, ForgotPassword, UserRegistration } from './pages/auth';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/auth/signin" replace />;
  }
  
  return (
    <div className="flex min-h-screen bg-gray-950">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

const AppContent: React.FC = () => {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Auth Routes */}
      <Route path="/auth/signin" element={<SignIn />} />
      <Route path="/auth/signup" element={<SignUp />} />
      <Route path="/auth/forgot-password" element={<ForgotPassword />} />
      <Route path="/auth/user-registration" element={<UserRegistration />} />
      
      {/* Legacy login route - redirect to new signin */}
      <Route path="/login" element={<Navigate to="/auth/signin" replace />} />
      
      {/* Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/committees"
        element={
          <ProtectedRoute>
            <Committees />
          </ProtectedRoute>
        }
      />
      <Route
        path="/bids"
        element={
          <ProtectedRoute>
            <Bids />
          </ProtectedRoute>
        }
      />
      
      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/auth/signin" replace />} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <NextUIProvider>
      <div className="dark text-foreground bg-background">
        <AuthProvider>
          <Router>
            <AppContent />
          </Router>
        </AuthProvider>
      </div>
    </NextUIProvider>
  );
};

export default App;
