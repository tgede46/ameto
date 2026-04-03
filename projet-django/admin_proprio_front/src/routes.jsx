import { createBrowserRouter } from 'react-router-dom';
import Home from './pages/Home';
import AdminLayout from './components/layout/AdminLayout';
import OwnerLayout from './components/layout/OwnerLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import PropertiesAdmin from './pages/admin/PropertiesAdmin';
import UsersAdmin from './pages/admin/UsersAdmin';
import FinancialAdmin from './pages/admin/FinancialAdmin';
import ReportsAdmin from './pages/admin/ReportsAdmin';
import SettingsAdmin from './pages/admin/SettingsAdmin';
import MaintenanceAdmin from './pages/admin/MaintenanceAdmin';
import ChatAdmin from './pages/admin/ChatAdmin';
import OwnerDashboard from './pages/owner/OwnerDashboard';
import PropertiesOwner from './pages/owner/PropertiesOwner';
import FinancialOwner from './pages/owner/FinancialOwner';
import MaintenanceOwner from './pages/owner/MaintenanceOwner';
import ProfileOwner from './pages/owner/ProfileOwner';
import ChatOwner from './pages/owner/ChatOwner';
import AddPropertyOwner from './pages/owner/AddPropertyOwner';

export const router = createBrowserRouter([
  { path: '/', element: <Home /> },
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      { index: true, element: <AdminDashboard /> },
      { path: 'dashboard', element: <AdminDashboard /> },
      { path: 'properties', element: <PropertiesAdmin /> },
      { path: 'users', element: <UsersAdmin /> },
      { path: 'financial', element: <FinancialAdmin /> },
      { path: 'reports', element: <ReportsAdmin /> },
      { path: 'settings', element: <SettingsAdmin /> },
      { path: 'maintenance', element: <MaintenanceAdmin /> },
      { path: 'chat', element: <ChatAdmin /> },
    ],
  },
  {
    path: '/owner',
    element: <OwnerLayout />,
    children: [
      { index: true, element: <OwnerDashboard /> },
      { path: 'dashboard', element: <OwnerDashboard /> },
      { path: 'properties', element: <PropertiesOwner /> },
      { path: 'properties/add', element: <AddPropertyOwner /> },
      { path: 'financial', element: <FinancialOwner /> },
      { path: 'maintenance', element: <MaintenanceOwner /> },
      { path: 'profile', element: <ProfileOwner /> },
      { path: 'chat', element: <ChatOwner /> },
    ],
  },
]);
