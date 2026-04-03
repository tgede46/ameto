import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Building2, 
  Users, 
  BarChart3, 
  FileText, 
  Settings, 
  Home, 
  DollarSign, 
  Wrench, 
  MessageSquare,
  LogOut,
  HelpCircle,
  ChevronRight
} from 'lucide-react';

const Sidebar = ({ userRole }) => {
  const adminMenuItems = [
    { icon: LayoutDashboard, label: 'Tableau de bord', path: '/admin/dashboard', color: 'text-brand-500' },
    { icon: Building2, label: 'Biens immobiliers', path: '/admin/properties', color: 'text-blue-500' },
    { icon: Users, label: 'Utilisateurs', path: '/admin/users', color: 'text-green-500' },
    { icon: BarChart3, label: 'Finances', path: '/admin/financial', color: 'text-purple-500' },
    { icon: FileText, label: 'Rapports', path: '/admin/reports', color: 'text-orange-500' },
    { icon: Settings, label: 'Paramètres', path: '/admin/settings', color: 'text-gray-500' },
  ];
  
  const ownerMenuItems = [
    { icon: LayoutDashboard, label: 'Tableau de bord', path: '/owner/dashboard', color: 'text-brand-500' },
    { icon: Home, label: 'Mes biens', path: '/owner/properties', color: 'text-blue-500' },
    { icon: DollarSign, label: 'Rentabilité', path: '/owner/financial', color: 'text-green-500' },
    { icon: Wrench, label: 'Maintenance', path: '/owner/maintenance', color: 'text-orange-500' },
    { icon: MessageSquare, label: 'Messagerie', path: '/owner/chat', color: 'text-purple-500' },
    { icon: Settings, label: 'Profil', path: '/owner/profile', color: 'text-gray-500' },
  ];
  
  const menuItems = userRole === 'admin' ? adminMenuItems : ownerMenuItems;
  
  return (
    <aside className="fixed left-0 top-0 w-70 h-full bg-white border-r border-border flex flex-col">
      {/* Logo Section */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-brand-500 to-brand-600 rounded-2xl flex items-center justify-center shadow-lg shadow-brand-500/30">
            <span className="text-white font-bold text-xl">I</span>
          </div>
          <div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-brand-500 bg-clip-text text-transparent">
              ImmoTech
            </span>
            <p className="text-xs text-secondary">Gestion immobilière</p>
          </div>
        </div>
      </div>
      
      {/* Navigation Menu - prend tout l'espace disponible */}
      <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `group flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 ${
                isActive 
                  ? 'bg-brand-50 text-brand-500 shadow-sm' 
                  : 'text-secondary hover:bg-gray-100 hover:text-primary'
              }`
            }
          >
            <div className="flex items-center space-x-3">
              <div className={`transition-all duration-300 ${item.color}`}>
                <item.icon size={20} />
              </div>
              <span className="font-medium">{item.label}</span>
            </div>
            <ChevronRight 
              size={16} 
              className={`transition-all duration-300 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 ${item.color}`} 
            />
          </NavLink>
        ))}
      </nav>
      
      {/* Footer Section - colle en bas */}
      <div className="border-t border-border p-4 space-y-2 bg-white">
        <button className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-secondary hover:bg-gray-100 hover:text-primary transition-all duration-300">
          <HelpCircle size={20} />
          <span className="font-medium">Aide & Support</span>
        </button>
        <button className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-secondary hover:bg-red-50 hover:text-error transition-all duration-300">
          <LogOut size={20} />
          <span className="font-medium">Déconnexion</span>
        </button>
        
        {/* Version Info */}
        <div className="pt-4 text-center border-t border-border mt-2">
          <p className="text-xs text-secondary">Version 1.0.0</p>
          <p className="text-xs text-secondary mt-1">© 2026 ImmoTech Togo</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;