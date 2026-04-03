import React from 'react';
import Card, { CardBody, CardHeader } from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import { BarChart3, TrendingUp, DollarSign, Users, Home, Calendar } from 'lucide-react';

const AdminDashboard = () => {
  const stats = [
    { icon: Home, label: 'Total biens', value: '156', change: '+12%', color: 'brand' },
    { icon: Users, label: 'Utilisateurs', value: '2,345', change: '+8%', color: 'brand' },
    { icon: DollarSign, label: 'CA mensuel', value: '45.2M CFA', change: '+15%', color: 'brand' },
    { icon: TrendingUp, label: 'Rendement moyen', value: '7.2%', change: '+0.5%', color: 'brand' },
  ];
  
  const recentActivities = [
    { id: 1, type: 'property', message: 'Nouveau bien ajouté - T2 Tokoin', time: 'il y a 5 min', status: 'success' },
    { id: 2, type: 'payment', message: 'Paiement loyer - 150k CFA', time: 'il y a 1h', status: 'success' },
    { id: 3, type: 'user', message: 'Nouvel utilisateur inscrit', time: 'il y a 2h', status: 'info' },
    { id: 4, type: 'alert', message: 'Fin de bail - Appart Lomé', time: 'il y a 3h', status: 'warning' },
  ];
  
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