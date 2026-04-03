import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPayments } from '../../store/slices/financialSlice';
import { fetchProperties } from '../../store/slices/propertySlice';
import Card, { CardBody, CardHeader } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { DollarSign, TrendingUp, Download, Calendar, FileText, CheckCircle, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const FinancialOwner = () => {
  const dispatch = useDispatch();
  const { payments, loading: finLoading } = useSelector(state => state.financial);
  const { properties, stats, loading: propLoading } = useSelector(state => state.properties);
  const [selectedYear, setSelectedYear] = useState('2026');
  const [selectedProperty, setSelectedProperty] = useState('all');

  useEffect(() => {
    dispatch(fetchPayments());
    dispatch(fetchProperties('owner'));
  }, [dispatch]);
  
  const filteredPayments = payments?.filter(p => 
    (selectedProperty === 'all' || p.bail_details?.bien === parseInt(selectedProperty)) &&
    (new Date(p.date_paiement).getFullYear().toString() === selectedYear)
  ) || [];

  const totalRevenue = filteredPayments.reduce((sum, p) => p.statut?.toUpperCase() === 'VALIDE' ? sum + parseFloat(p.montant) : sum, 0);
  const commission = totalRevenue * 0.1;
  const netRevenue = totalRevenue - commission;

  if ((finLoading || propLoading) && payments.length === 0) return <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>;

  const months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">Comptabilité & Rentabilité</h1>
          <p className="text-gray-500 mt-2">Gérez vos revenus fonciers et suivez la performance de votre patrimoine</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" className="rounded-xl shadow-sm border-gray-200">
            <Download size={20} className="mr-2" />
            Exporter CSV
          </Button>
          <Button variant="primary" className="rounded-xl shadow-lg shadow-brand-500/20">
            <FileText size={20} className="mr-2" />
            Rapport DGI Togo
          </Button>
        </div>
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-0 shadow-sm hover:shadow-md transition-all">
          <CardBody className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-50 text-green-600 rounded-2xl">
                <DollarSign size={24} />
              </div>
              <div className="flex items-center text-green-600 font-bold text-sm bg-green-50 px-2 py-1 rounded-lg">
                <ArrowUpRight size={14} className="mr-1" />
                +12%
              </div>
            </div>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Revenus bruts (annuel)</p>
            <p className="text-3xl font-extrabold text-gray-900">{totalRevenue.toLocaleString()} <span className="text-sm font-normal text-gray-400">CFA</span></p>
          </CardBody>
        </Card>

        <Card className="border-0 shadow-sm hover:shadow-md transition-all">
          <CardBody className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-brand-50 text-brand-500 rounded-2xl">
                <TrendingUp size={24} />
              </div>
              <div className="text-gray-400 font-bold text-sm bg-gray-50 px-2 py-1 rounded-lg">
                10% fixe
              </div>
            </div>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Commission Agence</p>
            <p className="text-3xl font-extrabold text-gray-900">{commission.toLocaleString()} <span className="text-sm font-normal text-gray-400">CFA</span></p>
          </CardBody>
        </Card>

        <Card className="border-0 shadow-sm hover:shadow-md transition-all">
          <CardBody className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                <CheckCircle size={24} />
              </div>
              <div className="flex items-center text-blue-600 font-bold text-sm bg-blue-50 px-2 py-1 rounded-lg">
                Net d'impôts
              </div>
            </div>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Revenu net propriétaire</p>
            <p className="text-3xl font-extrabold text-gray-900">{netRevenue.toLocaleString()} <span className="text-sm font-normal text-gray-400">CFA</span></p>
          </CardBody>
        </Card>
      </div>
      
      {/* Filters */}
      <Card className="border-0 shadow-sm">
        <CardBody className="p-4 flex flex-wrap gap-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-bold text-gray-700 uppercase tracking-wider">Année :</span>
            <select 
              className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-brand-500/10 focus:border-brand-500 font-bold text-gray-900"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
            >
              <option value="2026">2026</option>
              <option value="2025">2025</option>
              <option value="2024">2024</option>
            </select>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-sm font-bold text-gray-700 uppercase tracking-wider">Bien :</span>
            <select 
              className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-brand-500/10 focus:border-brand-500 font-bold text-gray-900"
              value={selectedProperty}
              onChange={(e) => setSelectedProperty(e.target.value)}
            >
              <option value="all">Tous les biens</option>
              {properties?.map(p => (
                <option key={p.id} value={p.id}>{p.adresse}</option>
              ))}
            </select>
          </div>
        </CardBody>
      </Card>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Monthly Revenue Table */}
        <Card className="lg:col-span-2 border-0 shadow-sm overflow-hidden">
          <CardHeader className="p-6 bg-gray-50/50 border-b border-gray-100">
            <h3 className="text-lg font-bold text-gray-900">Historique des paiements ({selectedYear})</h3>
          </CardHeader>
          <CardBody className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-50">
                    <th className="text-left p-4 font-bold text-gray-400 uppercase tracking-widest text-[10px]">Date</th>
                    <th className="text-left p-4 font-bold text-gray-400 uppercase tracking-widest text-[10px]">Référence</th>
                    <th className="text-right p-4 font-bold text-gray-400 uppercase tracking-widest text-[10px]">Montant</th>
                    <th className="text-center p-4 font-bold text-gray-400 uppercase tracking-widest text-[10px]">Statut</th>
                    <th className="text-right p-4 font-bold text-gray-400 uppercase tracking-widest text-[10px]">Quittance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredPayments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-gray-50/30 transition-colors">
                      <td className="p-4 text-sm font-medium text-gray-900">
                        {new Date(payment.date_paiement).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-sm text-gray-500 font-mono">
                        {payment.reference}
                      </td>
                      <td className="p-4 text-right">
                        <span className="font-extrabold text-gray-900">{parseFloat(payment.montant).toLocaleString()}</span>
                        <span className="text-[10px] text-gray-400 ml-1">CFA</span>
                      </td>
                      <td className="p-4 text-center">
                        <Badge variant={payment.statut?.toUpperCase() === 'VALIDE' ? 'success' : 'warning'} className="uppercase text-[10px]">
                          {payment.statut}
                        </Badge>
                      </td>
                      <td className="p-4 text-right">
                        {payment.statut?.toUpperCase() === 'VALIDE' && (
                          <button className="p-2 text-brand-500 hover:bg-brand-50 rounded-lg transition-all">
                            <Download size={16} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {filteredPayments.length === 0 && (
                    <tr>
                      <td colSpan="5" className="p-8 text-center text-gray-400 italic">
                        Aucun paiement enregistré pour cette période.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>
        
        {/* Tax & Stats */}
        <div className="space-y-8">
          <Card className="border-0 shadow-sm bg-gray-900 text-white overflow-hidden">
            <CardBody className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-brand-500 rounded-2xl flex items-center justify-center">
                  <TrendingUp size={20} className="text-white" />
                </div>
                <h3 className="text-xl font-bold">Performance</h3>
              </div>
              
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-400 text-xs font-bold uppercase tracking-widest">Taux d'occupation</span>
                    <span className="font-bold">{stats?.taux_occupation || 0}%</span>
                  </div>
                  <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                    <div className="bg-brand-500 h-full rounded-full transition-all duration-1000" style={{ width: `${stats?.taux_occupation || 0}%` }} />
                  </div>
                </div>
                
                <div className="pt-4 border-t border-white/10 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-xs font-bold uppercase tracking-widest">Rendement Net</span>
                    <span className="text-xl font-extrabold text-brand-500">{stats?.rendement_net || 7.5}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-xs font-bold uppercase tracking-widest">Biens Loués</span>
                    <span className="font-bold">{stats?.biens_loues || 0} / {stats?.total_biens || 0}</span>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card className="border-0 shadow-sm bg-brand-50/50 border border-brand-500/10">
            <CardBody className="p-8">
              <div className="flex items-center gap-3 mb-4 text-brand-500">
                <FileText size={20} />
                <h3 className="text-lg font-bold">Estimation Fiscale</h3>
              </div>
              <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                Estimation basée sur les revenus fonciers {selectedYear} selon les tranches de la DGI Togo (environ 15%).
              </p>
              <div className="bg-white p-4 rounded-2xl shadow-sm mb-6 border border-brand-500/5">
                <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-1">Impôt estimé</p>
                <p className="text-2xl font-extrabold text-gray-900">{(netRevenue * 0.15).toLocaleString()} <span className="text-xs font-normal">CFA</span></p>
              </div>
              <Button variant="primary" className="w-full py-3 rounded-xl font-bold">
                Détails de simulation
              </Button>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FinancialOwner;
