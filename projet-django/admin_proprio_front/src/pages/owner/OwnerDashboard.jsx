import React from 'react';
import Card, { CardBody, CardHeader } from '../../components/common/Card';
import Button from '../../components/common/Button';
import { TrendingUp, DollarSign, Home, Calendar, Wrench } from 'lucide-react';

const OwnerDashboard = () => {
  const stats = {
    totalProperties: 5,
    occupiedProperties: 4,
    occupancyRate: 80,
    monthlyRevenue: 1350000,
    netYield: 7.2,
    pendingMaintenance: 2
  };
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-gradient-to-r from-brand-500 to-brand-600 rounded-3xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Bonjour M. Koffi</h1>
        <p className="text-white/90">Voici le resume de votre patrimoine immobilier</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card><CardBody><div className="flex items-center justify-between"><div><p className="text-secondary text-sm">Taux occupation</p><p className="text-2xl font-bold text-primary">{stats.occupancyRate}%</p></div><Home size={24} className="text-brand-500" /></div></CardBody></Card>
        <Card><CardBody><div className="flex items-center justify-between"><div><p className="text-secondary text-sm">Revenus mensuels</p><p className="text-2xl font-bold text-primary">{stats.monthlyRevenue.toLocaleString()} CFA</p></div><DollarSign size={24} className="text-brand-500" /></div></CardBody></Card>
        <Card><CardBody><div className="flex items-center justify-between"><div><p className="text-secondary text-sm">Rendement net</p><p className="text-2xl font-bold text-primary">{stats.netYield}%</p></div><TrendingUp size={24} className="text-brand-500" /></div></CardBody></Card>
        <Card><CardBody><div className="flex items-center justify-between"><div><p className="text-secondary text-sm">Maintenance</p><p className="text-2xl font-bold text-primary">{stats.pendingMaintenance}</p></div><Wrench size={24} className="text-brand-500" /></div></CardBody></Card>
      </div>
      <Card className="border-l-4 border-l-warning">
        <CardBody>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Calendar size={24} className="text-warning" />
              <div><h4 className="font-semibold">Alerte revision de loyer</h4><p className="text-secondary text-sm">Revision annuelle prevue pour le T2 Tokoin (+3% IRL)</p></div>
            </div>
            <Button variant="primary" size="sm">Voir les details</Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default OwnerDashboard;
