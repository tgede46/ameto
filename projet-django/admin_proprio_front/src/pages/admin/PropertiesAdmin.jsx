import React, { useState } from 'react';
import Card, { CardBody, CardHeader } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import { Search, Plus, Edit, Eye, Trash2, Filter } from 'lucide-react';

const PropertiesAdmin = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const properties = [
    { id: 1, name: 'T2 Tokoin', type: 'Appartement', price: '150.000 CFA', status: 'loué', owner: 'M. Koffi', location: 'Lomé, Tokoin' },
    { id: 2, name: 'Villa Lomé', type: 'Villa', price: '800.000 CFA', status: 'disponible', owner: 'Mme Ama', location: 'Lomé, Nyékonakpoé' },
    { id: 3, name: 'Local Commercial', type: 'Commerce', price: '500.000 CFA', status: 'en attente', owner: 'M. Yao', location: 'Lomé, Adidogomé' },
  ];
  
  const getStatusBadge = (status) => {
    switch(status) {
      case 'loué': return <Badge variant="success">Loué</Badge>;
      case 'disponible': return <Badge variant="info">Disponible</Badge>;
      case 'en attente': return <Badge variant="warning">En attente</Badge>;
      default: return <Badge>Inconnu</Badge>;
    }
  };
  
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-primary">Gestion des biens</h1>
          <p className="text-secondary mt-2">Gérez tous les biens immobiliers de la plateforme</p>
        </div>
        <Button variant="primary">
          <Plus size={20} className="mr-2" />
          Ajouter un bien
        </Button>
      </div>
      
      {/* Filters */}
      <Card>
        <CardBody>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary" />
              <input
                type="text"
                placeholder="Rechercher un bien..."
                className="input-field pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline">
              <Filter size={20} className="mr-2" />
              Filtres
            </Button>
          </div>
        </CardBody>
      </Card>
      
      {/* Properties Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-border">
              <tr>
                <th className="text-left p-4 font-semibold text-secondary">Bien</th>
                <th className="text-left p-4 font-semibold text-secondary">Type</th>
                <th className="text-left p-4 font-semibold text-secondary">Prix</th>
                <th className="text-left p-4 font-semibold text-secondary">Localisation</th>
                <th className="text-left p-4 font-semibold text-secondary">Propriétaire</th>
                <th className="text-left p-4 font-semibold text-secondary">Statut</th>
                <th className="text-left p-4 font-semibold text-secondary">Actions</th>
              </tr>
            </thead>
            <tbody>
              {properties.map((property) => (
                <tr key={property.id} className="border-b border-border hover:bg-gray-50 transition-colors">
                  <td className="p-4 font-medium">{property.name}</td>
                  <td className="p-4 text-secondary">{property.type}</td>
                  <td className="p-4 text-secondary">{property.price}</td>
                  <td className="p-4 text-secondary">{property.location}</td>
                  <td className="p-4 text-secondary">{property.owner}</td>
                  <td className="p-4">{getStatusBadge(property.status)}</td>
                  <td className="p-4">
                    <div className="flex space-x-2">
                      <button className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
                        <Eye size={18} className="text-secondary" />
                      </button>
                      <button className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
                        <Edit size={18} className="text-secondary" />
                      </button>
                      <button className="p-1 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 size={18} className="text-error" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default PropertiesAdmin;