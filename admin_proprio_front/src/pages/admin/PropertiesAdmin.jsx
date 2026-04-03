import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProperties } from '../../store/slices/propertySlice';
import Card, { CardBody } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Search, Plus, Edit, Eye, Trash2, Filter, Home } from 'lucide-react';

const PropertiesAdmin = () => {
  const dispatch = useDispatch();
  const { properties, loading, error } = useSelector((state) => state.properties);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    dispatch(fetchProperties('admin'));
  }, [dispatch]);


  
  const getStatusBadge = (status) => {
    switch(status?.toUpperCase()) {
      case 'LOUE': return <Badge variant="success">Loué</Badge>;
      case 'VACANT': return <Badge variant="info">Vacant</Badge>;
      case 'VENDRE': return <Badge variant="warning">À vendre</Badge>;
      case 'EN_TRAVAUX': return <Badge variant="danger">En travaux</Badge>;
      default: return <Badge>{status || 'Inconnu'}</Badge>;
    }
  };

  if (loading && properties.length === 0) return <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>;
  if (error) return <div className="p-6 bg-red-50 text-red-600 rounded-2xl">{error}</div>;

  
  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">Gestion des biens</h1>
          <p className="text-gray-500 mt-2">Supervisez l'ensemble du parc immobilier</p>
        </div>
        <Button variant="primary" className="rounded-xl shadow-lg shadow-brand-500/20 px-6">
          <Plus size={20} className="mr-2" />
          Ajouter un bien
        </Button>
      </div>
      
      {/* Filters */}
      <Card className="border-0 shadow-sm">
        <CardBody className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par adresse ou propriétaire..."
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" className="rounded-2xl px-6">
              <Filter size={20} className="mr-2" />
              Filtres avancés
            </Button>
          </div>
        </CardBody>
      </Card>
      
      {/* Properties Table */}
      <Card className="border-0 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="text-left p-6 font-bold text-gray-700 uppercase tracking-widest text-[10px]">Bien</th>
                <th className="text-left p-6 font-bold text-gray-700 uppercase tracking-widest text-[10px]">Type</th>
                <th className="text-left p-6 font-bold text-gray-700 uppercase tracking-widest text-[10px]">Loyer</th>
                <th className="text-left p-6 font-bold text-gray-700 uppercase tracking-widest text-[10px]">Localisation</th>
                <th className="text-left p-6 font-bold text-gray-700 uppercase tracking-widest text-[10px]">Statut</th>
                <th className="text-right p-6 font-bold text-gray-700 uppercase tracking-widest text-[10px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {properties?.map((property) => (
                <tr key={property.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0">
                        {property.photos_bien?.[0] ? (
                          <img src={property.photos_bien[0].image_url || property.photos_bien[0].image} className="w-full h-full object-cover" alt="" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300"><Home size={20} /></div>
                        )}
                      </div>
                      <div className="font-bold text-gray-900 line-clamp-1">{property.adresse}</div>
                    </div>
                  </td>
                  <td className="p-6 text-gray-600 text-sm">
                    <div className="font-medium text-gray-900">{property.categorie?.libelle || 'Bien'}</div>
                    <div className="text-xs text-gray-400 mt-1">{property.type_appartement?.libelle || '-'}</div>
                  </td>
                  <td className="p-6">
                    <div className="font-extrabold text-brand-500">{(property.loyer_hc || 0).toLocaleString()} <span className="text-[10px] text-gray-400">CFA</span></div>
                  </td>
                  <td className="p-6">
                    <div className="text-sm text-gray-600">Lomé, Togo</div>
                  </td>
                  <td className="p-6">{getStatusBadge(property.statut)}</td>
                  <td className="p-6">
                    <div className="flex justify-end space-x-2">
                      <button className="p-2 text-gray-400 hover:text-brand-500 hover:bg-brand-50 rounded-xl transition-all shadow-sm bg-white border border-gray-100">
                        <Eye size={18} />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all shadow-sm bg-white border border-gray-100">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {properties.length === 0 && !loading && (
          <div className="text-center py-20 bg-gray-50/30">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
              <Home size={32} className="text-gray-200" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Aucun bien à afficher</h3>
            <p className="text-gray-500 mt-1">Le parc immobilier est actuellement vide.</p>
          </div>
        )}
      </Card>
    </div>
  );
};
                        

export default PropertiesAdmin;