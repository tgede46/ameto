import React, { useState } from 'react';
import Card, { CardBody, CardHeader } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import { DollarSign, TrendingUp, Download, Calendar, Plus, Edit, Trash2, Eye, FileText } from 'lucide-react';

const FinancialAdmin = () => {
  const [selectedYear, setSelectedYear] = useState('2026');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  
  const [transactions, setTransactions] = useState([
    { id: 1, property: 'T2 Tokoin', amount: 150000, commission: 15000, owner: 'M. Koffi', date: '01/03/2026', status: 'paye', type: 'loyer' },
    { id: 2, property: 'Studio Adidogome', amount: 85000, commission: 8500, owner: 'M. Koffi', date: '28/02/2026', status: 'paye', type: 'loyer' },
    { id: 3, property: 'Villa Lome', amount: 450000, commission: 45000, owner: 'M. Koffi', date: '25/02/2026', status: 'en_attente', type: 'loyer' },
    { id: 4, property: 'Local Commercial', amount: 500000, commission: 50000, owner: 'Mme Ama', date: '20/02/2026', status: 'paye', type: 'commission_vente' },
  ]);
  
  const stats = {
    totalRevenue: transactions.reduce((sum, t) => t.status === 'paye' ? sum + t.amount : sum, 0),
    totalCommission: transactions.reduce((sum, t) => t.status === 'paye' ? sum + t.commission : sum, 0),
    pendingAmount: transactions.reduce((sum, t) => t.status === 'en_attente' ? sum + t.amount : sum, 0),
    totalProperties: 156,
  };
  
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
      
      <Card><CardHeader><h3 className="text-lg font-bold">Transactions</h3></CardHeader><CardBody><div className="overflow-x-auto"><table className="w-full"><thead className="border-b border-border"><tr><th className="p-4 text-left">Bien</th><th className="p-4 text-left">Propriétaire</th><th className="p-4 text-right">Montant</th><th className="p-4 text-right">Commission</th><th className="p-4 text-left">Date</th><th className="p-4 text-left">Statut</th><th className="p-4 text-left">Actions</th></tr></thead><tbody>{transactions.map(t => (<tr key={t.id} className="border-b border-border hover:bg-gray-50"><td className="p-4 font-medium">{t.property}</td><td className="p-4">{t.owner}</td><td className="p-4 text-right">{t.amount.toLocaleString()} CFA</td><td className="p-4 text-right">{t.commission.toLocaleString()} CFA</td><td className="p-4">{t.date}</td><td className="p-4"><Badge variant={t.status === 'paye' ? 'success' : 'warning'}>{t.status === 'paye' ? 'Payé' : 'En attente'}</Badge></td><td className="p-4"><div className="flex space-x-2"><button onClick={() => { setSelectedTransaction(t); setShowDetailModal(true); }} className="p-1 hover:bg-gray-100 rounded"><Eye size={16} /></button><button className="p-1 hover:bg-gray-100 rounded"><Edit size={16} /></button></div></td></tr>))}</tbody></table></div></CardBody></Card>
      
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Ajouter une transaction"><div className="space-y-4"><div><label>Type</label><select className="input-field"><option>Loyer</option><option>Commission vente</option><option>Frais agence</option></select></div><div><label>Montant (CFA)</label><input type="number" className="input-field" /></div><div><label>Commission (CFA)</label><input type="number" className="input-field" /></div><div><label>Date</label><input type="date" className="input-field" /></div><div className="flex space-x-3"><Button variant="outline" className="flex-1">Annuler</Button><Button variant="primary" className="flex-1">Ajouter</Button></div></div></Modal>
      
      <Modal isOpen={showDetailModal} onClose={() => setShowDetailModal(false)} title="Détails transaction">{selectedTransaction && (<div><p><strong>Bien:</strong> {selectedTransaction.property}</p><p><strong>Propriétaire:</strong> {selectedTransaction.owner}</p><p><strong>Montant:</strong> {selectedTransaction.amount.toLocaleString()} CFA</p><p><strong>Commission:</strong> {selectedTransaction.commission.toLocaleString()} CFA</p><p><strong>Date:</strong> {selectedTransaction.date}</p></div>)}</Modal>
    </div>
  );
};

export default FinancialAdmin;
