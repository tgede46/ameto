import React, { useState } from 'react';
import Card, { CardBody, CardHeader } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import { Search, Plus, Edit, Eye, Filter, MapPin, Users, TrendingUp, Home } from 'lucide-react';

const PropertiesOwner = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const properties = [
    { id: 1, name: 'T2 Tokoin', type: 'Appartement', price: '150.000 CFA', status: 'loue', tenant: 'Mme Afi', location: 'Lome, Tokoin', surface: '65m²', yield: '8.5%' },
    { id: 2, name: 'Studio Adidogome', type: 'Studio', price: '85.000 CFA', status: 'loue', tenant: 'M. Jean', location: 'Lome, Adidogome', surface: '35m²', yield: '7.2%' },
    { id: 3, name: 'Villa Lome', type: 'Villa', price: '450.000 CFA', status: 'en attente', tenant: null, location: 'Lome, Nyekonakpoe', surface: '250m²', yield: '6.8%' },
    { id: 4, name: 'Local Commercial', type: 'Commerce', price: '500.000 CFA', status: 'disponible', tenant: null, location: 'Lome, Adidogome', surface: '120m²', yield: '9.2%' },
  ];
  
  const getStatusBadge = (status) => {
    switch(status) {
      case 'loue': return <Badge variant="success">Loue</Badge>;
      case 'disponible': return <Badge variant="info">Disponible</Badge>;
      case 'en attente': return <Badge variant="warning">En attente</Badge>;
      default: return <Badge>Inconnu</Badge>;
    }
  };
  
  const filteredProperties = properties.filter(prop =>
    prop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prop.location.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary">Mes biens immobiliers</h1>
          <p className="text-secondary mt-2">Gerez et suivez la performance de vos biens</p>
        </div>
        <a href="/owner/properties/add" className="inline-flex items-center justify-center bg-brand-500 text-white px-6 py-3 rounded-xl font-semibold transition-all hover:bg-brand-600 active:scale-95">
          <Plus size={20} className="mr-2" />
          Ajouter un bien
        </a>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card><CardBody className="flex items-center justify-between"><div><p className="text-secondary text-sm">Total biens</p><p className="text-2xl font-bold text-primary">{properties.length}</p></div><Home size={32} className="text-brand-500" /></CardBody></Card>
        <Card><CardBody className="flex items-center justify-between"><div><p className="text-secondary text-sm">Biens loues</p><p className="text-2xl font-bold text-primary">{properties.filter(p => p.status === 'loue').length}</p></div><Users size={32} className="text-brand-500" /></CardBody></Card>
        <Card><CardBody className="flex items-center justify-between"><div><p className="text-secondary text-sm">Rendement moyen</p><p className="text-2xl font-bold text-primary">{(properties.reduce((acc, p) => acc + parseFloat(p.yield), 0) / properties.length).toFixed(1)}%</p></div><TrendingUp size={32} className="text-brand-500" /></CardBody></Card>
      </div>
      
      <Card><CardBody><div className="flex flex-col md:flex-row gap-4"><div className="flex-1 relative"><Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary" /><input type="text" placeholder="Rechercher..." className="input-field pl-10" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div><Button variant="outline"><Filter size={20} className="mr-2" />Filtres</Button></div></CardBody></Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProperties.map((property) => (
          <Card key={property.id} className="hover:shadow-xl transition-all">
            <div className="relative h-48 overflow-hidden bg-gray-200"><div className="absolute top-3 right-3">{getStatusBadge(property.status)}</div></div>
            <CardBody>
              <div className="flex justify-between items-start mb-3"><div><h3 className="text-lg font-bold text-primary">{property.name}</h3><div className="flex items-center text-secondary text-sm mt-1"><MapPin size={14} className="mr-1" />{property.location}</div></div><div className="text-right"><p className="text-xl font-bold text-brand-500">{property.price}</p><p className="text-xs text-secondary">/mois</p></div></div>
              <div className="flex justify-between items-center mb-4 pt-3 border-t border-border"><div className="text-sm text-secondary"><span className="font-medium">Surface:</span> {property.surface}</div><div className="text-sm text-secondary"><span className="font-medium">Rendement:</span> {property.yield}</div></div>
              {property.tenant && <div className="mb-4 p-3 bg-brand-50 rounded-xl"><p className="text-sm"><span className="font-medium">Locataire:</span> {property.tenant}</p></div>}
              <div className="flex space-x-2">
                <a href={"/owner/properties/" + property.id} className="flex-1 inline-flex justify-center items-center px-4 py-2 border-2 border-border rounded-xl font-semibold hover:border-primary transition-colors"><Eye size={16} className="mr-2" />Details</a>
                <a href={"/owner/properties/" + property.id + "/edit"} className="flex-1 inline-flex justify-center items-center bg-brand-500 text-white px-4 py-2 rounded-xl font-semibold hover:bg-brand-600 transition-colors"><Edit size={16} className="mr-2" />Gerer</a>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default PropertiesOwner;
