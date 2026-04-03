import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMaintenanceRequests } from '../../store/slices/maintenanceSlice';
import Card, { CardBody, CardHeader } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Wrench, CheckCircle, Clock, AlertCircle, Search, Filter, Eye, Check, X, MessageSquare } from 'lucide-react';

const MaintenanceAdmin = () => {
  const dispatch = useDispatch();
  const { requests, loading, error } = useSelector(state => state.maintenance);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);

  useEffect(() => {
    dispatch(fetchMaintenanceRequests());
  }, [dispatch]);

  if (loading) return <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>;
  if (error) return <div className="p-6 bg-red-50 text-red-600 rounded-2xl">{error}</div>;
  
  const technicians = ['Plombier Ahmed', 'Electricien Kofi', 'Menuisier Yao', 'Peintre Ama', 'Climatisation Serge'];
  
  const getStatusConfig = (status) => {
    switch(status) {
      case 'pending': return { label: 'En attente', icon: Clock, variant: 'warning' };
      case 'in_progress': return { label: 'En cours', icon: Wrench, variant: 'info' };
      case 'completed': return { label: 'Terminé', icon: CheckCircle, variant: 'success' };
      default: return { label: 'Inconnu', icon: AlertCircle, variant: 'default' };
    }
  };
  
  const getPriorityConfig = (priority) => {
    switch(priority) {
      case 'urgent': return { label: 'Urgent', variant: 'error' };
      case 'normal': return { label: 'Normal', variant: 'warning' };
      default: return { label: 'Normal', variant: 'default' };
    }
  };
  
  const handleAssign = () => {
    setRequests(requests.map(req => 
      req.id === selectedRequest.id 
        ? { ...req, status: 'in_progress', assignedTo: selectedRequest.assignedTo }
        : req
    ));
    setShowAssignModal(false);
  };
  
  const handleComplete = (id) => {
    setRequests(requests.map(req => 
      req.id === id ? { ...req, status: 'completed' } : req
    ));
  };
  
  const filteredRequests = requests.filter(req =>
    req.property.toLowerCase().includes(searchTerm.toLowerCase()) ||
    req.issue.toLowerCase().includes(searchTerm.toLowerCase()) ||
    req.tenant.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const stats = {
    pending: requests.filter(r => r.status === 'pending').length,
    inProgress: requests.filter(r => r.status === 'in_progress').length,
    completed: requests.filter(r => r.status === 'completed').length,
    urgent: requests.filter(r => r.priority === 'urgent').length,
  };
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-primary">Gestion de la maintenance</h1>
          <p className="text-secondary mt-2">Suivez et gérez toutes les demandes de réparation</p>
        </div>
        <Button variant="primary"><Wrench size={20} className="mr-2" />Nouvelle intervention</Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><CardBody><div className="text-center"><p className="text-secondary text-sm">En attente</p><p className="text-2xl font-bold text-warning">{stats.pending}</p></div></CardBody></Card>
        <Card><CardBody><div className="text-center"><p className="text-secondary text-sm">En cours</p><p className="text-2xl font-bold text-brand-500">{stats.inProgress}</p></div></CardBody></Card>
        <Card><CardBody><div className="text-center"><p className="text-secondary text-sm">Terminés</p><p className="text-2xl font-bold text-success">{stats.completed}</p></div></CardBody></Card>
        <Card><CardBody><div className="text-center"><p className="text-secondary text-sm">Urgents</p><p className="text-2xl font-bold text-error">{stats.urgent}</p></div></CardBody></Card>
      </div>
      
      <Card><CardBody><div className="flex flex-col md:flex-row gap-4"><div className="flex-1 relative"><Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary" /><input type="text" placeholder="Rechercher..." className="input-field pl-10" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div><Button variant="outline"><Filter size={20} className="mr-2" />Filtres</Button></div></CardBody></Card>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-border">
            <tr><th className="p-4 text-left">Bien</th><th className="p-4 text-left">Locataire</th><th className="p-4 text-left">Problème</th><th className="p-4 text-left">Priorité</th><th className="p-4 text-left">Statut</th><th className="p-4 text-left">Technicien</th><th className="p-4 text-left">Actions</th></tr>
          </thead>
          <tbody>
            {filteredRequests?.map((req) => (
              <tr key={req.id} className="border-b border-border hover:bg-gray-50 transition-colors">
                <td className="p-4 font-medium">{req.bien_nom || 'N/A'}</td>
                <td className="p-4">{req.locataire || '-'}</td>
                <td className="p-4 text-secondary">{req.titre || req.issue}</td>
                <td className="p-4 text-secondary">{req.date_creation ? new Date(req.date_creation).toLocaleDateString() : '-'}</td>
                <td className="p-4"><Badge variant={getPriorityConfig(req.priorite || req.priority).variant}>{getPriorityConfig(req.priorite || req.priority).label}</Badge></td>
                <td className="p-4"><Badge variant={getStatusConfig(req.statut || req.status).variant}>{getStatusConfig(req.statut || req.status).label}</Badge></td>
                <td className="p-4">
                  <div className="flex space-x-2">
                    <button onClick={() => { setSelectedRequest(req); setShowDetailsModal(true); }} className="p-1 hover:bg-gray-100 rounded text-brand-500"><Eye size={18} /></button>
                    {(req.statut || req.status) === 'pending' && <button onClick={() => { setSelectedRequest(req); setShowAssignModal(true); }} className="p-1 hover:bg-gray-100 rounded text-success"><Check size={18} /></button>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <Modal isOpen={showDetailsModal} onClose={() => setShowDetailsModal(false)} title="Détails de la demande">
        {selectedRequest && (<div><p><strong>Bien:</strong> {selectedRequest.property}</p><p><strong>Locataire:</strong> {selectedRequest.tenant}</p><p><strong>Problème:</strong> {selectedRequest.issue}</p><p><strong>Description:</strong> {selectedRequest.description}</p><p><strong>Coût estimé:</strong> {selectedRequest.estimatedCost.toLocaleString()} CFA</p></div>)}
      </Modal>
      
      <Modal isOpen={showAssignModal} onClose={() => setShowAssignModal(false)} title="Assigner un technicien">
        {selectedRequest && (<div><select className="input-field mb-4" value={selectedRequest.assignedTo || ''} onChange={(e) => setSelectedRequest({...selectedRequest, assignedTo: e.target.value})}><option value="">Sélectionner un technicien</option>{technicians.map(t => <option key={t}>{t}</option>)}</select><div className="flex space-x-3"><Button variant="outline" className="flex-1" onClick={() => setShowAssignModal(false)}>Annuler</Button><Button variant="primary" className="flex-1" onClick={handleAssign}>Assigner</Button></div></div>)}
      </Modal>
    </div>
  );
};

export default MaintenanceAdmin;
