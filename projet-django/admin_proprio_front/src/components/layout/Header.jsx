import React, { useState } from 'react';
import { Bell, User, LogOut, ChevronDown } from 'lucide-react';

const Header = ({ userRole, userName }) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-border">
      <div className="flex items-center justify-between px-8 py-4">
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-primary">Bonjour, {userName}</h1>
        </div>
        <div className="flex items-center space-x-4">
          <button className="relative p-2 rounded-full hover:bg-gray-100 transition-colors">
            <Bell size={20} className="text-secondary" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-brand-500 rounded-full"></span>
          </button>
          <div className="relative">
            <button onClick={() => setShowUserMenu(!showUserMenu)} className="flex items-center space-x-2 p-2 rounded-xl hover:bg-gray-100 transition-colors">
              <div className="w-8 h-8 bg-brand-500 rounded-full flex items-center justify-center">
                <User size={16} className="text-white" />
              </div>
              <span className="font-medium text-primary">{userName}</span>
              <ChevronDown size={16} className="text-secondary" />
            </button>
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-border overflow-hidden">
                <button className="w-full flex items-center space-x-2 px-4 py-3 text-left hover:bg-gray-50 transition-colors">
                  <LogOut size={16} />
                  <span>Deconnexion</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
