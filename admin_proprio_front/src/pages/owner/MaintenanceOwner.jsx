import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMaintenanceRequests } from '../../store/slices/maintenanceSlice';
import Card, { CardBody } from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Wrench, Clock, CheckCircle, AlertTriangle, MessageSquare, MapPin } from 'lucide-react';

const MaintenanceOwner = () => {
  const dispatch = useDispatch();
  const { requests, loading, error } = useSelector(state => state.maintenance);

  useEffect(() => {
    dispatch(fetchMaintenanceRequests());
  }, [dispatch]);

  const getStatusBadge = (status) => {
    switch(status?.toUpperCase()) {
      case 'EN_ATTENTE': return <Badge variant="warning">En attente</Badge>;
      case 'APPROUVE': return <Badge variant="info">Approuvé</Badge>;
      case 'EN_COURS': return <Badge variant="info">En cours</Badge>;
      case 'TERMINE': return <Badge variant="success">Terminé</Badge>;
      case 'REFUSE': return <Badge variant="danger">Refusé</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  const getPriorityIcon = (priority) => {
    switch(priority?.toUpperCase()) {
      case 'URGENT': return <AlertTriangle className="text-red-500" size={18} />;
      case 'HAUTE': return <AlertTriangle className="text-orange-500" size={18} />;
      default: return <Clock className="text-blue-500" size={18} />;
    }
  };

  if (loading && requests.length === 0) return <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>;

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900">Suivi de maintenance</h1>
        <p className="text-gray-500 mt-2">Gérez les demandes de réparation de vos locataires</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {requests.map(request => (
          <Card key={request.id} className="border-0 shadow-sm hover:shadow-md transition-all overflow-hidden bg-white group">
            <CardBody className="p-0">
              <div className="flex flex-col md:flex-row">
                <div className="p-6 flex-1">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-3 bg-brand-50 rounded-2xl text-brand-500">
                        <Wrench size={24} />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{request.titre}</h3>
                        <div className="flex items-center text-sm text-gray-500 mt-1">
                          <MapPin size={14} className="mr-1 text-brand-500" />
                          {request.bien_adresse}
                        </div>
                      </div>
                    </div>
                    {getStatusBadge(request.statut)}
                  </div>
                  
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    {request.description}
                  </p>
                  
                  <div className="flex flex-wrap items-center gap-6 pt-6 border-t border-gray-50">
                    <div className="flex items-center space-x-2">
                      {getPriorityIcon(request.priorite)}
                      <span className="text-sm font-bold text-gray-700 uppercase tracking-wider">Priorité {request.priorite}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock size={18} className="text-gray-400" />
                      <span className="text-sm text-gray-500">Signalé le {new Date(request.date_signalement).toLocaleDateString()}</span>
                    </div>
                    {request.cout_estime && (
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-bold text-brand-500">Coût estimé: {parseFloat(request.cout_estime).toLocaleString()} CFA</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="bg-gray-50 p-6 md:w-64 flex flex-col justify-center space-y-3 border-t md:border-t-0 md:border-l border-gray-100">
                  <button className="w-full py-3 bg-white border border-gray-200 text-gray-900 rounded-xl font-bold hover:bg-gray-50 transition-all flex items-center justify-center gap-2 shadow-sm">
                    <MessageSquare size={18} />
                    Discuter
                  </button>
                  {request.statut === 'EN_ATTENTE' && (
                    <button className="w-full py-3 bg-brand-500 text-white rounded-xl font-bold hover:bg-brand-600 transition-all shadow-lg shadow-brand-500/20">
                      Approuver
                    </button>
                  )}
                  {request.statut === 'EN_COURS' && (
                    <button className="w-full py-3 bg-green-500 text-white rounded-xl font-bold hover:bg-green-600 transition-all shadow-lg shadow-green-500/20">
                      Marquer terminé
                    </button>
                  )}
                </div>
              </div>
            </CardBody>
          </Card>
        ))}
        
        {requests.length === 0 && !loading && (
          <div className="text-center py-20 bg-gray-50 rounded-[40px] border-2 border-dashed border-gray-200">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
              <CheckCircle size={32} className="text-green-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Tout est en ordre</h3>
            <p className="text-gray-500 mt-1">Aucune demande de maintenance en attente.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MaintenanceOwner;
