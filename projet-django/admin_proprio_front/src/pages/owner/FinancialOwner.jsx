import React, { useState } from 'react';
import Card, { CardBody, CardHeader } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import { DollarSign, TrendingUp, Download, Calendar, ChevronDown, FileText } from 'lucide-react';

const FinancialOwner = () => {
  const [selectedYear, setSelectedYear] = useState('2026');
  const [selectedProperty, setSelectedProperty] = useState('all');
  
  const yearlyRevenue = {
    '2026': [
      { month: 'Janvier', revenue: 1350000, expenses: 150000, net: 1200000 },
      { month: 'Février', revenue: 1350000, expenses: 200000, net: 1150000 },
      { month: 'Mars', revenue: 1350000, expenses: 100000, net: 1250000 },
    ]
  };
  
  const properties = [
    { id: 1, name: 'T2 Tokoin', monthlyRent: 150000, yield: 8.5, expenses: 15000 },
    { id: 2, name: 'Studio Adidogomé', monthlyRent: 85000, yield: 7.2, expenses: 10000 },
    { id: 3, name: 'Villa Lomé', monthlyRent: 450000, yield: 6.8, expenses: 45000 },
  ];
  
  const totalRevenue = yearlyRevenue[selectedYear].reduce((sum, m) => sum + m.revenue, 0);
  const totalExpenses = yearlyRevenue[selectedYear].reduce((sum, m) => sum + m.expenses, 0);
  const totalNet = yearlyRevenue[selectedYear].reduce((sum, m) => sum + m.net, 0);
  
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary">Rentabilité et Finances</h1>
          <p className="text-secondary mt-2">Suivez vos revenus et optimisez votre rentabilité</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline">
            <Download size={20} className="mr-2" />
            Exporter Excel
          </Button>
          <Button variant="primary">
            <FileText size={20} className="mr-2" />
            Rapport fiscal
          </Button>
        </div>
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardBody>
            <div className="flex items-center justify-between mb-3">
              <DollarSign size={24} className="text-brand-500" />
              <Badge variant="success">+15%</Badge>
            </div>
            <p className="text-secondary text-sm">Revenus totaux</p>
            <p className="text-2xl font-bold text-primary">{totalRevenue.toLocaleString()} CFA</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <div className="flex items-center justify-between mb-3">
              <TrendingUp size={24} className="text-warning" />
              <Badge variant="warning">-5%</Badge>
            </div>
            <p className="text-secondary text-sm">Charges totales</p>
            <p className="text-2xl font-bold text-primary">{totalExpenses.toLocaleString()} CFA</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <div className="flex items-center justify-between mb-3">
              <DollarSign size={24} className="text-success" />
              <Badge variant="success">+12%</Badge>
            </div>
            <p className="text-secondary text-sm">Bénéfice net</p>
            <p className="text-2xl font-bold text-primary">{totalNet.toLocaleString()} CFA</p>
          </CardBody>
        </Card>
      </div>
      
      {/* Filters */}
      <div className="flex gap-4">
        <select 
          className="input-field w-auto"
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
        >
          <option value="2026">2026</option>
          <option value="2025">2025</option>
          <option value="2024">2024</option>
        </select>
        
        <select 
          className="input-field w-auto"
          value={selectedProperty}
          onChange={(e) => setSelectedProperty(e.target.value)}
        >
          <option value="all">Tous les biens</option>
          {properties.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>
      
      {/* Monthly Revenue Table */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-bold">Relevé mensuel des revenus</h3>
        </CardHeader>
        <CardBody>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-border">
                <tr>
                  <th className="text-left p-4 font-semibold text-secondary">Mois</th>
                  <th className="text-right p-4 font-semibold text-secondary">Revenus</th>
                  <th className="text-right p-4 font-semibold text-secondary">Charges</th>
                  <th className="text-right p-4 font-semibold text-secondary">Bénéfice net</th>
                  <th className="text-right p-4 font-semibold text-secondary">Actions</th>
                </tr>
              </thead>
              <tbody>
                {yearlyRevenue[selectedYear].map((month, index) => (
                  <tr key={index} className="border-b border-border hover:bg-gray-50 transition-colors">
                    <td className="p-4 font-medium">{month.month}</td>
                    <td className="p-4 text-right text-success font-medium">
                      +{month.revenue.toLocaleString()} CFA
                    </td>
                    <td className="p-4 text-right text-error">
                      -{month.expenses.toLocaleString()} CFA
                    </td>
                    <td className="p-4 text-right font-bold">
                      {month.net.toLocaleString()} CFA
                    </td>
                    <td className="p-4 text-right">
                      <Button variant="outline" size="sm">
                        <Download size={16} />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>
      
      {/* Properties Performance */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-bold">Performance par bien</h3>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => (
              <div key={property.id} className="p-4 border border-border rounded-xl hover:shadow-md transition-shadow">
                <h4 className="font-bold text-primary mb-3">{property.name}</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-secondary">Loyer mensuel:</span>
                    <span className="font-medium">{property.monthlyRent.toLocaleString()} CFA</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-secondary">Charges:</span>
                    <span className="font-medium">{property.expenses.toLocaleString()} CFA</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-secondary">Rendement:</span>
                    <Badge variant="success">{property.yield}%</Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
      
      {/* Tax Simulation */}
      <Card className="border-2 border-brand-500/20 bg-brand-50/30">
        <CardBody>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h3 className="text-lg font-bold text-primary">Simulation fiscale Togo</h3>
              <p className="text-secondary mt-1">
                Estimation des impôts sur les revenus fonciers 2026
              </p>
              <p className="text-2xl font-bold text-brand-500 mt-2">
                ~{(totalNet * 0.2).toLocaleString()} CFA
              </p>
              <p className="text-sm text-secondary">Estimation 20% de tranche fiscale</p>
            </div>
            <Button variant="primary">
              <Calendar size={20} className="mr-2" />
              Exporter pour DGI
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default FinancialOwner;