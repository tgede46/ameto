import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const OwnerLayout = () => {
  const userName = "M. Koffi";
  const userRole = "owner";
  
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar userRole={userRole} />
      <div className="flex-1 ml-64">
        <Header userRole={userRole} userName={userName} />
        <main className="p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default OwnerLayout;
