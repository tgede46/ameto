import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProperties } from '../../store/slices/propertySlice';
import { fetchUsers } from '../../store/slices/userSlice';
import { fetchPayments } from '../../store/slices/financialSlice';
import Card, { CardBody, CardHeader } from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { BarChart3, TrendingUp, DollarSign, Users, Home, Calendar } from 'lucide-react';

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const { properties, loading: propsLoading } = useSelector(state => state.properties);
  const { users, loading: usersLoading } = useSelector(state => state.users);
  const { payments, loading: finLoading } = useSelector(state => state.financial);

  useEffect(() => {
    dispatch(fetchProperties('admin'));
    dispatch(fetchUsers());
    dispatch(fetchPayments());
  }, [dispatch]);

  const totalCommission = payments?.reduce((sum, p) => {
    const status = p.statut?.toUpperCase();
    if (status === 'VALIDE' || status === 'PAYE') {
      return sum + (parseFloat(p.commission_admin) || 0);
    }
    return sum;
  }, 0) || 0;

  const stats = [
    { icon: Home, label: 'Total biens', value: properties?.length || 0, change: '+12%', color: 'brand' },
    { icon: Users, label: 'Utilisateurs', value: users?.length || 0, change: '+8%', color: 'brand' },
    { icon: DollarSign, label: 'Commissions (Gains)', value: `${totalCommission.toLocaleString()} CFA`, change: '+15%', color: 'brand' },
    { icon: TrendingUp, label: 'Biens loués', value: properties?.filter(p => p.statut === 'LOUE').length || 0, change: '+0.5%', color: 'brand' },
  ];

  const recentActivities = [
    { id: 1, type: 'property', message: 'Dernier bien : ' + (properties?.[0]?.adresse || 'Aucun'), time: 'Récent', status: 'success' },
    { id: 2, type: 'user', message: 'Dernier inscrit : ' + (users?.[0]?.prenom ? `${users[0].prenom} ${users[0].nom || ''}` : 'Aucun'), time: 'Récent', status: 'info' },
  ];

  if (propsLoading || usersLoading || finLoading) return <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>;


  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-primary">Tableau de bord Admin</h1>
        <p className="text-secondary mt-2">Vue d'ensemble de l'activité immobilière</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="hover:shadow-lg transition-all duration-300">
            <CardBody>
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 bg-brand-50 rounded-xl`}>
                  <stat.icon size={24} className="text-brand-500" />
                </div>
                <Badge variant="success">{stat.change}</Badge>
              </div>
              <div>
                <p className="text-secondary text-sm">{stat.label}</p>
                <p className="text-2xl font-bold text-primary mt-1">{stat.value}</p>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Charts and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart placeholder */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <h3 className="text-lg font-bold">Performance mensuelle</h3>
          </CardHeader>
          <CardBody>
            <div className="h-80 flex items-center justify-center bg-gray-50 rounded-xl">
              <BarChart3 size={48} className="text-gray-300" />
              <p className="text-secondary ml-3">Graphique des performances à venir</p>
            </div>
          </CardBody>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-bold">Activités récentes</h3>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                  <div className="flex-1">
                    <p className="text-primary font-medium">{activity.message}</p>
                    <p className="text-secondary text-sm mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;