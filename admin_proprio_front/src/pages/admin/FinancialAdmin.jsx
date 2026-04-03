import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPayments } from '../../store/slices/financialSlice';
import Card, { CardBody, CardHeader } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { DollarSign, TrendingUp, Download, Calendar, Plus, Edit, Trash2, Eye, FileText } from 'lucide-react';

const FinancialAdmin = () => {
  const dispatch = useDispatch();
  const { payments, loading, error } = useSelector(state => state.financial);
  const [selectedYear, setSelectedYear] = useState('2026');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  useEffect(() => {
    dispatch(fetchPayments());
  }, [dispatch]);
  
  const stats = {
    totalRevenue: payments?.reduce((sum, t) => t.statut === 'valide' ? sum + t.montant : sum, 0) || 0,
    totalCommission: payments?.reduce((sum, t) => t.statut === 'valide' ? sum + (t.montant * 0.1) : sum, 0) || 0, // 10% par défaut
    pendingAmount: payments?.reduce((sum, t) => t.statut === 'en_attente' ? sum + t.montant : sum, 0) || 0,
    totalProperties: 0,
  };

  if (loading) return <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>;
  if (error) return <div className="p-6 bg-red-50 text-red-600 rounded-2xl">{error}</div>;

  
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div><h1 className="text-3xl font-bold text-primary">Finances</h1><p className="text-secondary mt-2">Suivi financier de l'agence</p></div>
        <Button variant="primary" onClick={() => setShowAddModal(true)}><Plus size={20} className="mr-2" />Ajouter une transaction</Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card><CardBody><div><p className="text-secondary text-sm">CA total</p><p className="text-2xl font-bold text-primary">{stats.totalRevenue.toLocaleString()} CFA</p></div></CardBody></Card>
        <Card><CardBody><div><p className="text-secondary text-sm">Commissions</p><p className="text-2xl font-bold text-primary">{stats.totalCommission.toLocaleString()} CFA</p></div></CardBody></Card>
        <Card><CardBody><div><p className="text-secondary text-sm">En attente</p><p className="text-2xl font-bold text-warning">{stats.pendingAmount.toLocaleString()} CFA</p></div></CardBody></Card>
        <Card><CardBody><div><p className="text-secondary text-sm">Biens gérés</p><p className="text-2xl font-bold text-primary">{stats.totalProperties}</p></div></CardBody></Card>
      </div>
      
      <div className="flex justify-between items-center">
        <div className="flex space-x-2"><select className="input-field w-32" value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}><option>2026</option><option>2025</option></select><Button variant="outline"><Download size={16} className="mr-2" />Exporter</Button></div>
        <Button variant="outline"><FileText size={16} className="mr-2" />Rapport fiscal DGI</Button>
      </div>
      
      <Card><CardHeader><h3 className="text-lg font-bold">Transactions</h3></CardHeader><CardBody><div className="overflow-x-auto"><table className="w-full"><thead className="border-b border-border"><tr><th className="p-4 text-left">Bien</th><th className="p-4 text-left">Propriétaire</th><th className="p-4 text-right">Montant</th><th className="p-4 text-right">Commission</th><th className="p-4 text-left">Date</th><th className="p-4 text-left">Statut</th><th className="p-4 text-left">Actions</th></tr></thead><tbody>
              {payments?.map((t) => (
                <tr key={t.id} className="border-b border-border hover:bg-gray-50 transition-colors">
                  <td className="p-4 font-medium">{t.bien_nom || 'N/A'}</td>
                  <td className="p-4 text-secondary">{t.proprietaire_nom || 'N/A'}</td>
                  <td className="p-4 text-right text-secondary">{t.montant.toLocaleString()} CFA</td>
                  <td className="p-4 text-right text-secondary">{(t.montant * 0.1).toLocaleString()} CFA</td>
                  <td className="p-4 text-secondary">{new Date(t.date_paiement).toLocaleDateString()}</td>
                  <td className="p-4">
                    <Badge variant={t.statut === 'valide' ? 'success' : 'warning'}>
                      {t.statut === 'valide' ? 'Payé' : 'En attente'}
                    </Badge>
                  </td>
                  <td className="p-4"><div className="flex space-x-2"><button onClick={() => { setSelectedTransaction(t); setShowDetailModal(true); }} className="p-1 hover:bg-gray-100 rounded"><Eye size={16} /></button><button className="p-1 hover:bg-gray-100 rounded"><Edit size={16} /></button></div></td></tr>))}</tbody></table></div></CardBody></Card>
      
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Ajouter une transaction"><div className="space-y-4"><div><label>Type</label><select className="input-field"><option>Loyer</option><option>Commission vente</option><option>Frais agence</option></select></div><div><label>Montant (CFA)</label><input type="number" className="input-field" /></div><div><label>Commission (CFA)</label><input type="number" className="input-field" /></div><div><label>Date</label><input type="date" className="input-field" /></div><div className="flex space-x-3"><Button variant="outline" className="flex-1">Annuler</Button><Button variant="primary" className="flex-1">Ajouter</Button></div></div></Modal>
      
      <Modal isOpen={showDetailModal} onClose={() => setShowDetailModal(false)} title="Détails transaction">{selectedTransaction && (<div><p><strong>Bien:</strong> {selectedTransaction.property}</p><p><strong>Propriétaire:</strong> {selectedTransaction.owner}</p><p><strong>Montant:</strong> {selectedTransaction.amount.toLocaleString()} CFA</p><p><strong>Commission:</strong> {selectedTransaction.commission.toLocaleString()} CFA</p><p><strong>Date:</strong> {selectedTransaction.date}</p></div>)}</Modal>
    </div>
  );
};

export default FinancialAdmin;
