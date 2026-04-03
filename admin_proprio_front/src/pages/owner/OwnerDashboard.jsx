import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchOwnerStats } from '../../store/slices/propertySlice';
import Card, { CardBody } from '../../components/common/Card';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { TrendingUp, DollarSign, Home, Calendar, Wrench } from 'lucide-react';

const OwnerDashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { stats, loading } = useSelector((state) => state.properties);
  
  useEffect(() => {
    dispatch(fetchOwnerStats());
  }, [dispatch]);

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="large" />
      </div>
    );
  }
  
  const dashboardStats = stats || {
    total_biens: 0,
    biens_loues: 0,
    taux_occupation: 0,
    revenus_mensuels: 0,
    rendement_net: 0,
    maintenance_en_attente: 0
  };
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-gradient-to-r from-brand-500 to-brand-600 rounded-3xl p-8 text-white shadow-xl shadow-brand-500/20">
        <h1 className="text-3xl font-bold mb-2">Bonjour {user?.prenom || user?.nom || 'Propriétaire'}</h1>
        <p className="text-white/90">Voici le résumé de votre patrimoine immobilier à Lomé</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium uppercase tracking-wider mb-1">Taux occupation</p>
                <p className="text-3xl font-extrabold text-gray-900">{dashboardStats.taux_occupation}%</p>
              </div>
              <div className="w-12 h-12 bg-brand-50 rounded-2xl flex items-center justify-center">
                <Home size={24} className="text-brand-500" />
              </div>
            </div>
          </CardBody>
        </Card>
        
        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium uppercase tracking-wider mb-1">Revenus mensuels</p>
                <p className="text-3xl font-extrabold text-gray-900">{dashboardStats.revenus_mensuels.toLocaleString()} <span className="text-sm font-normal">CFA</span></p>
              </div>
              <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center">
                <DollarSign size={24} className="text-green-500" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium uppercase tracking-wider mb-1">Rendement net</p>
                <p className="text-3xl font-extrabold text-gray-900">{dashboardStats.rendement_net}%</p>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center">
                <TrendingUp size={24} className="text-blue-500" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium uppercase tracking-wider mb-1">Maintenance</p>
                <p className="text-3xl font-extrabold text-gray-900">{dashboardStats.maintenance_en_attente}</p>
              </div>
              <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center">
                <Wrench size={24} className="text-orange-500" />
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {dashboardStats.taux_occupation < 100 && (
        <Card className="border-l-4 border-l-orange-500 bg-orange-50/30">
          <CardBody>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-orange-500/10 rounded-xl">
                  <Calendar size={24} className="text-orange-500" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">Optimisation de vos revenus</h4>
                  <p className="text-gray-600 text-sm">Vous avez {dashboardStats.total_biens - dashboardStats.biens_loues} bien(s) vacant(s). Pensez à vérifier les annonces.</p>
                </div>
              </div>
              <Button variant="primary" size="sm" className="rounded-xl">
                Gérer mes biens
              </Button>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
};

export default OwnerDashboard;
