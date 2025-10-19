import React from 'react';
import { Card, CardHeader, CardBody } from '@nextui-org/react';
import { useAuth } from '../hooks/useAuth';

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
          Welcome back, {user?.username || 'User'}!
        </h1>
        <p className="text-sm sm:text-base text-gray-400">
          Committee Management Dashboard
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <Card className="bg-gray-900/50 border border-gray-800">
          <CardHeader className="pb-2 sm:pb-3">
            <h3 className="text-base sm:text-lg font-semibold text-white">Total Committees</h3>
          </CardHeader>
          <CardBody className="pt-0">
            <p className="text-2xl sm:text-3xl font-bold text-red-500">12</p>
            <p className="text-gray-400 text-xs sm:text-sm">Active committees</p>
          </CardBody>
        </Card>

        <Card className="bg-gray-900/50 border border-gray-800">
          <CardHeader className="pb-2 sm:pb-3">
            <h3 className="text-base sm:text-lg font-semibold text-white">Total Members</h3>
          </CardHeader>
          <CardBody className="pt-0">
            <p className="text-2xl sm:text-3xl font-bold text-blue-500">248</p>
            <p className="text-gray-400 text-xs sm:text-sm">Registered members</p>
          </CardBody>
        </Card>

        <Card className="bg-gray-900/50 border border-gray-800 sm:col-span-2 lg:col-span-1">
          <CardHeader className="pb-2 sm:pb-3">
            <h3 className="text-base sm:text-lg font-semibold text-white">Pending Bids</h3>
          </CardHeader>
          <CardBody className="pt-0">
            <p className="text-2xl sm:text-3xl font-bold text-yellow-500">7</p>
            <p className="text-gray-400 text-xs sm:text-sm">Awaiting approval</p>
          </CardBody>
        </Card>
      </div>

      <Card className="bg-gray-900/50 border border-gray-800">
        <CardHeader>
          <h3 className="text-lg sm:text-xl font-semibold text-white">Recent Activity</h3>
        </CardHeader>
        <CardBody>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
              <div>
                <p className="text-white text-sm sm:text-base">New member joined: John Doe</p>
                <p className="text-gray-400 text-xs sm:text-sm">2 hours ago</p>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
              <div>
                <p className="text-white text-sm sm:text-base">Bid submitted for Project Alpha</p>
                <p className="text-gray-400 text-xs sm:text-sm">5 hours ago</p>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
              <div>
                <p className="text-white text-sm sm:text-base">Committee meeting scheduled</p>
                <p className="text-gray-400 text-xs sm:text-sm">1 day ago</p>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default Dashboard;