import React from 'react';
import { Button, User, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from '@nextui-org/react';
import { Search, Bell, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const Header: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <header className="bg-gray-900/95 backdrop-blur-sm border-b border-gray-800 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Search */}
        <div className="flex-1 max-w-xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search Comitte..."
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <Button isIconOnly variant="light" className="text-gray-400 hover:text-white">
            <Bell className="w-5 h-5" />
          </Button>

          {/* Settings */}
          <Button isIconOnly variant="light" className="text-gray-400 hover:text-white">
            <Settings className="w-5 h-5" />
          </Button>

          {/* User Menu */}
          <Dropdown placement="bottom-end">
            <DropdownTrigger>
              <div className="flex items-center gap-2 p-1 hover:bg-gray-800 rounded-lg transition-colors cursor-pointer">
                <User
                  as="button"
                  avatarProps={{
                    isBordered: true,
                    src: "",
                    color: "danger",
                    name: user?.username?.charAt(0).toUpperCase(),
                    size: "sm"
                  }}
                  className="transition-transform"
                  description={<span className="text-xs text-gray-400 hidden sm:block">{user?.email}</span>}
                  name={<span className="text-sm font-medium text-white hidden sm:block">{user?.username}</span>}
                />
              </div>
            </DropdownTrigger>
            <DropdownMenu aria-label="User menu" className="w-56">
              <DropdownItem
                key="profile"
                description="Manage your account settings"
                startContent={<Settings className="w-4 h-4" />}
              >
                Profile Settings
              </DropdownItem>
              <DropdownItem
                key="logout"
                color="danger"
                description="Sign out of your account"
                startContent={<LogOut className="w-4 h-4" />}
                onClick={logout}
              >
                Log Out
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
      </div>
    </header>
  );
};

export default Header;