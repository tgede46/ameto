import React from 'react';
import Card, { CardBody, CardHeader } from '../../components/common/Card';
import Button from '../../components/common/Button';
import { FileText, Download, Calendar } from 'lucide-react';

const ReportsAdmin = () => {
  const reports = [{ name: 'Rapport fiscal DGI Togo', date: 'Mars 2026', type: 'PDF' }, { name: 'Rapport des transactions', date: 'Février 2026', type: 'Excel' }, { name: 'Rapport de rentabilité', date: 'Janvier 2026', type: 'PDF' }];

  return (
    <div className="space-y-6 animate-fade-in">
      <div><h1 className="text-3xl font-bold text-primary">Rapports</h1><p className="text-secondary mt-2">Générez et exportez vos rapports</p></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="cursor-pointer hover:shadow-xl transition-all"><CardBody className="text-center"><FileText size={48} className="mx-auto text-brand-500 mb-3" /><h3 className="font-bold">Rapport fiscal</h3><p className="text-secondary text-sm">Format DGI Togo</p><Button variant="outline" size="sm" className="mt-4">Générer</Button></CardBody></Card>
        <Card className="cursor-pointer hover:shadow-xl transition-all"><CardBody className="text-center"><Calendar size={48} className="mx-auto text-brand-500 mb-3" /><h3 className="font-bold">Rapport mensuel</h3><p className="text-secondary text-sm">Performance du mois</p><Button variant="outline" size="sm" className="mt-4">Générer</Button></CardBody></Card>
        <Card className="cursor-pointer hover:shadow-xl transition-all"><CardBody className="text-center"><Download size={48} className="mx-auto text-brand-500 mb-3" /><h3 className="font-bold">Export données</h3><p className="text-secondary text-sm">Excel / CSV</p><Button variant="outline" size="sm" className="mt-4">Exporter</Button></CardBody></Card>
      </div>
      <Card><CardHeader><h3 className="text-lg font-bold">Rapports générés</h3></CardHeader><CardBody>{reports.map((r, i) => (<div key={i} className="flex justify-between items-center p-4 border-b border-border last:border-0"><div><p className="font-medium">{r.name}</p><p className="text-secondary text-sm">{r.date}</p></div><Button variant="outline" size="sm"><Download size={16} className="mr-2" />{r.type}</Button></div>))}</CardBody></Card>
    </div>
  );
};

export default ReportsAdmin;
