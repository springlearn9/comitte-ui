import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  UserPlus, 
  LogOut, 
  Briefcase,
  BarChart3,
  Grid3X3
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface NavItem {
  icon: React.ReactNode;
  label: string;
  path: string;
}

const Sidebar: React.FC = () => {
  const location = useLocation();
  const { logout } = useAuth();

  const navItems: NavItem[] = [
    {
      icon: <LayoutDashboard className="w-5 h-5" />,
      label: 'Comitte',
      path: '/committees',
    },
    {
      icon: <FileText className="w-5 h-5" />,
      label: 'Bids',
      path: '/bids',
    },
    {
      icon: <Users className="w-5 h-5" />,
      label: 'Members',
      path: '/members',
    },
    {
      icon: <UserPlus className="w-5 h-5" />,
      label: 'Attach Mem',
      path: '/attach-member',
    },
    {
      icon: <BarChart3 className="w-5 h-5" />,
      label: 'About',
      path: '/about',
    },
    {
      icon: <Briefcase className="w-5 h-5" />,
      label: 'Feedback',
      path: '/feedback',
    },
    {
      icon: <Grid3X3 className="w-5 h-5" />,
      label: 'App Gallery',
      path: '/app-gallery',
    },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="w-16 sm:w-64 bg-gray-900 border-r border-gray-800 flex flex-col min-h-screen">
      {/* Logo */}
      <div className="p-4 sm:p-6 border-b border-gray-800">
        <Link to="/dashboard" className="flex items-center justify-center sm:justify-start gap-3 hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-sm">C</span>
          </div>
          <span className="hidden sm:block text-xl font-bold text-white">Comitte</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 sm:py-6">
        <div className="space-y-3 px-2 sm:px-4">
          {navItems.map((item) => (
            <Link key={item.path} to={item.path} title={item.label}>
              <div className={`flex items-center gap-3 px-4 py-3 rounded-full transition-colors duration-200 ${
                isActive(item.path)
                  ? 'bg-gray-700 text-white shadow-lg'
                  : 'text-gray-300 hover:text-white hover:bg-gray-800'
              }`}>
                <div className="flex items-center justify-center w-5 h-5 flex-shrink-0">
                  {item.icon}
                </div>
                <span className="hidden sm:block font-medium">{item.label}</span>
              </div>
            </Link>
          ))}
        </div>
      </nav>

      {/* Bottom section */}
      <div className="p-2 sm:p-4 border-t border-gray-800">
        <div 
          onClick={logout}
          className="flex items-center gap-3 px-4 py-3 rounded-full text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors duration-200 cursor-pointer"
          title="Logout"
        >
          <div className="flex items-center justify-center w-5 h-5 flex-shrink-0">
            <LogOut className="w-5 h-5" />
          </div>
          <span className="hidden sm:block font-medium">Logout</span>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;