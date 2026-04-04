import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMaintenanceRequests } from '../../store/slices/maintenanceSlice';
import api from '../../services/api';
import Card, { CardBody, CardHeader } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Wrench, CheckCircle, Clock, AlertCircle, Search, Filter, Eye, Check, X, MessageSquare, Save } from 'lucide-react';
import toast from 'react-hot-toast';

const MaintenanceAdmin = () => {
  const dispatch = useDispatch();
  const { requests, loading, error } = useSelector(state => state.maintenance);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [coutEstime, setCoutEstime] = useState(0);

  useEffect(() => {
    dispatch(fetchMaintenanceRequests());
  }, [dispatch]);

  const getStatusConfig = (status) => {
    switch (status?.toUpperCase()) {
      case 'EN_ATTENTE': return { label: 'En attente', icon: Clock, variant: 'warning' };
      case 'APPROUVE': return { label: 'Approuvé', icon: Check, variant: 'info' };
      case 'EN_COURS': return { label: 'En cours', icon: Wrench, variant: 'info' };
      case 'TERMINE': return { label: 'Terminé', icon: CheckCircle, variant: 'success' };
      case 'REFUSE': return { label: 'Refusé', icon: X, variant: 'danger' };
      default: return { label: status || 'Inconnu', icon: AlertCircle, variant: 'default' };
    }
  };

  const getPriorityConfig = (priority) => {
    switch (priority?.toUpperCase()) {
      case 'URGENT': return { label: 'Urgent', variant: 'danger' };
      case 'HAUTE': return { label: 'Haute', variant: 'warning' };
      case 'MOYENNE': return { label: 'Moyenne', variant: 'info' };
      case 'BASSE': return { label: 'Basse', variant: 'default' };
      default: return { label: priority || 'Normal', variant: 'default' };
    }
  };

  const handleUpdateStatus = async (id, newStatus, extra = {}) => {
    try {
      await api.patch(`maintenances/${id}/`, { statut: newStatus, ...extra });
      toast.success(`Demande mise à jour : ${newStatus}`);
      dispatch(fetchMaintenanceRequests());
      setShowAssignModal(false);
      setShowDetailsModal(false);
    } catch (err) {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  if (loading && (!requests || requests.length === 0)) return <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>;

  const filteredRequests = (requests || []).filter(req =>
    (req.bien_adresse || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (req.titre || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (req.locataire_nom || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    pending: (requests || []).filter(r => r.statut === 'EN_ATTENTE').length,
    inProgress: (requests || []).filter(r => r.statut === 'EN_COURS' || r.statut === 'APPROUVE').length,
    completed: (requests || []).filter(r => r.statut === 'TERMINE').length,
    urgent: (requests || []).filter(r => r.priorite === 'URGENT').length,
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-primary">Maintenance</h1>
          <p className="text-secondary mt-2">Suivez et gérez les interventions techniques</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card><CardBody><div className="flex items-center gap-4"><div className="p-3 bg-warning/10 text-warning rounded-xl"><Clock size={20} /></div><div><p className="text-secondary text-xs font-bold uppercase tracking-widest">En attente</p><p className="text-2xl font-bold text-primary">{stats.pending}</p></div></div></CardBody></Card>
        <Card><CardBody><div className="flex items-center gap-4"><div className="p-3 bg-brand/10 text-brand-500 rounded-xl"><Wrench size={20} /></div><div><p className="text-secondary text-xs font-bold uppercase tracking-widest">En cours</p><p className="text-2xl font-bold text-primary">{stats.inProgress}</p></div></div></CardBody></Card>
        <Card><CardBody><div className="flex items-center gap-4"><div className="p-3 bg-success/10 text-success rounded-xl"><CheckCircle size={20} /></div><div><p className="text-secondary text-xs font-bold uppercase tracking-widest">Terminés</p><p className="text-2xl font-bold text-primary">{stats.completed}</p></div></div></CardBody></Card>
        <Card><CardBody><div className="flex items-center gap-4"><div className="p-3 bg-red-50 text-red-500 rounded-xl"><AlertCircle size={20} /></div><div><p className="text-secondary text-xs font-bold uppercase tracking-widest">Urgents</p><p className="text-2xl font-bold text-primary">{stats.urgent}</p></div></div></CardBody></Card>
      </div>

      <Card className="border-0 shadow-sm"><CardBody><div className="flex flex-col md:flex-row gap-4"><div className="flex-1 relative"><Search size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" /><input type="text" placeholder="Rechercher un bien, un titre ou un locataire..." className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-brand-500/10 focus:border-brand-500 transition-all font-medium" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div><Button variant="outline" className="rounded-xl px-6 font-bold"><Filter size={20} className="mr-2" />Filtres</Button></div></CardBody></Card>

      <Card className="border-0 shadow-sm overflow-hidden"><CardBody className="p-0"><div className="overflow-x-auto"><table className="w-full text-left border-collapse"><thead className="bg-gray-50/50 border-b border-gray-100"><tr><th className="p-4 text-[10px] font-bold uppercase text-gray-400 tracking-widest">Bien / Locataire</th><th className="p-4 text-[10px] font-bold uppercase text-gray-400 tracking-widest">Demande</th><th className="p-4 text-[10px] font-bold uppercase text-gray-400 tracking-widest">Priorité</th><th className="p-4 text-[10px] font-bold uppercase text-gray-400 tracking-widest">Statut</th><th className="p-4 text-[10px] font-bold uppercase text-gray-400 tracking-widest text-right">Actions</th></tr></thead><tbody className="divide-y divide-gray-50">
        {filteredRequests?.map((req) => (
          <tr key={req.id} className="hover:bg-gray-50/50 transition-colors">
            <td className="p-4">
              <p className="font-bold text-primary text-sm">{req.bien_adresse || 'Bien non spécifié'}</p>
              <p className="text-secondary text-xs mt-0.5">{req.locataire_nom || 'Anonyme'}</p>
            </td>
            <td className="p-4">
              <p className="font-bold text-primary text-sm line-clamp-1">{req.titre}</p>
              <p className="text-secondary text-xs mt-0.5 line-clamp-1">{req.description}</p>
            </td>
            <td className="p-4"><Badge variant={getPriorityConfig(req.priorite).variant} className="rounded-lg">{getPriorityConfig(req.priorite).label}</Badge></td>
            <td className="p-4"><Badge variant={getStatusConfig(req.statut).variant} className="rounded-lg">{getStatusConfig(req.statut).label}</Badge></td>
            <td className="p-4 text-right">
              <div className="flex items-center justify-end gap-2">
                <button onClick={() => { setSelectedRequest(req); setCoutEstime(req.cout_estime || 0); setShowDetailsModal(true); }} className="p-2 text-gray-400 hover:text-brand-500 hover:bg-white rounded-xl shadow-sm border border-transparent hover:border-gray-100 transition-all"><Eye size={18} /></button>
                {req.statut === 'EN_ATTENTE' && (
                  <button onClick={() => { setSelectedRequest(req); setCoutEstime(0); setShowAssignModal(true); }} className="px-3 py-1.5 bg-brand-500 text-white text-[10px] font-extrabold uppercase rounded-lg hover:bg-brand-600 transition-all shadow-lg shadow-brand-500/20">Approuver</button>
                )}
                {(req.statut === 'APPROUVE' || req.statut === 'EN_COURS') ? (
                  <button onClick={() => handleUpdateStatus(req.id, 'TERMINE')} className="px-3 py-1.5 bg-success text-white text-[10px] font-extrabold uppercase rounded-lg hover:bg-green-600 transition-all shadow-lg shadow-green-500/20 whitespace-nowrap">Terminer</button>
                ) : null}
              </div>
            </td>
          </tr>
        ))}
      </tbody></table></div></CardBody></Card>

      {filteredRequests.length === 0 && !loading && (
        <div className="text-center py-20 bg-gray-50 rounded-[40px] border-2 border-dashed border-gray-200">
          <Wrench size={48} className="text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900">Aucune demande trouvée</h3>
          <p className="text-gray-500 mt-1">Les nouvelles demandes apparaîtront ici</p>
        </div>
      )}

      <Modal isOpen={showDetailsModal} onClose={() => setShowDetailsModal(false)} title="Détails de la demande">
        {selectedRequest && (
          <div className="space-y-6 pt-2">
            <div className="bg-gray-50 p-4 rounded-2xl">
              <p className="text-secondary text-[10px] font-bold uppercase tracking-widest mb-1">Description du problème</p>
              <p className="text-primary text-sm font-medium">{selectedRequest.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 border border-gray-100 rounded-2xl">
                <p className="text-secondary text-[10px] font-bold uppercase tracking-widest mb-1">Bien</p>
                <p className="text-primary text-sm font-bold">{selectedRequest.bien_adresse}</p>
              </div>
              <div className="p-4 border border-gray-100 rounded-2xl">
                <p className="text-secondary text-[10px] font-bold uppercase tracking-widest mb-1">Locataire</p>
                <p className="text-primary text-sm font-bold">{selectedRequest.locataire_nom}</p>
              </div>
            </div>

            <div className="p-4 border border-gray-100 rounded-2xl flex items-center justify-between">
              <div>
                <p className="text-secondary text-[10px] font-bold uppercase tracking-widest mb-1">Coût estimé</p>
                <p className="text-brand-500 text-lg font-extrabold">{(selectedRequest.cout_estime || 0).toLocaleString()} <span className="text-xs">FCFA</span></p>
              </div>
              {selectedRequest.statut === 'EN_ATTENTE' && (
                <Button variant="primary" onClick={() => { setShowDetailsModal(false); setShowAssignModal(true); }}>Modifier</Button>
              )}
            </div>

            <div className="flex gap-3 pt-4 border-t border-gray-50">
              <Button variant="outline" className="flex-1" onClick={() => setShowDetailsModal(false)}>Fermer</Button>
              {selectedRequest.statut === 'EN_ATTENTE' && (
                <Button variant="danger" onClick={() => handleUpdateStatus(selectedRequest.id, 'REFUSE')} className="flex-1">Refuser</Button>
              )}
            </div>
          </div>
        )}
      </Modal>

      <Modal isOpen={showAssignModal} onClose={() => setShowAssignModal(false)} title="Approuver & Estimer">
        {selectedRequest && (
          <div className="space-y-6 pt-2">
            <div>
              <label className="block text-secondary text-[10px] font-bold uppercase tracking-widest mb-2">Estimation des frais (FCFA)</label>
              <input
                type="number"
                className="w-full px-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-primary focus:ring-2 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all"
                value={coutEstime}
                onChange={(e) => setCoutEstime(e.target.value)}
                placeholder="Ex: 50000"
              />
            </div>

            <div className="bg-yellow-50 p-4 rounded-2xl flex items-start gap-3">
              <AlertCircle size={20} className="text-yellow-600 mt-1 flex-shrink-0" />
              <p className="text-xs text-yellow-700 font-medium leading-relaxed">
                En approuvant cette demande, le locataire sera notifié et l'intervention pourra commencer. Le coût estimé pourra être réajusté lors de la validation finale.
              </p>
            </div>

            <div className="flex space-x-3">
              <Button variant="outline" className="flex-1 font-bold h-14" onClick={() => setShowAssignModal(false)}>Annuler</Button>
              <Button
                variant="primary"
                className="flex-1 font-extrabold h-14 shadow-lg shadow-brand-500/20"
                onClick={() => handleUpdateStatus(selectedRequest.id, 'APPROUVE', { cout_estime: coutEstime })}
              >
                <Save size={18} className="mr-2" /> Approuver
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default MaintenanceAdmin;
