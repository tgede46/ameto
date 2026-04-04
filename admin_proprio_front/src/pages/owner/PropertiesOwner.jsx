import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchProperties } from '../../store/slices/propertySlice';
import Card, { CardBody } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Search, Plus, Edit, Eye, Filter, MapPin, Users, TrendingUp, Home } from 'lucide-react';
import { toApiMediaUrl } from '../../services/api';

const PropertiesOwner = () => {
  const dispatch = useDispatch();
  const { properties, loading, error } = useSelector((state) => state.properties);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    dispatch(fetchProperties('owner'));
  }, [dispatch]);



  const getStatusBadge = (status) => {
    switch (status?.toUpperCase()) {
      case 'LOUE': return <Badge variant="success">Loué</Badge>;
      case 'VACANT': return <Badge variant="info">Vacant</Badge>;
      case 'VENDRE': return <Badge variant="warning">À vendre</Badge>;
      case 'EN_TRAVAUX': return <Badge variant="danger">En travaux</Badge>;
      default: return <Badge>{status || 'Inconnu'}</Badge>;
    }
  };


  const filteredProperties = properties?.filter(prop =>
    prop.adresse?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prop.description?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const getPropertyImageUrl = (property) => {
    const firstPhoto = property.photos_bien?.[0] || property.photo_principale;
    if (!firstPhoto) return null;
    const rawUrl = firstPhoto.image_url || firstPhoto.image;
    return toApiMediaUrl(rawUrl);
  };


  if (loading && properties.length === 0) return <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>;
  if (error) return <div className="p-6 bg-red-50 text-red-600 rounded-2xl">{error}</div>;

  return (
    <div className="space-y-6 animate-fade-in">

      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary">Mes biens immobiliers</h1>
          <p className="text-secondary mt-2">Gerez et suivez la performance de vos biens à Lomé</p>
        </div>
        <a href="/owner/properties/add" className="inline-flex items-center justify-center bg-brand-500 text-white px-6 py-3 rounded-xl font-semibold transition-all hover:bg-brand-600 active:scale-95 shadow-lg shadow-brand-500/20">
          <Plus size={20} className="mr-2" />
          Ajouter un bien
        </a>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="hover:shadow-md transition-shadow"><CardBody className="flex items-center justify-between"><div><p className="text-secondary text-sm font-medium uppercase tracking-wider">Total biens</p><p className="text-2xl font-bold text-primary">{properties?.length || 0}</p></div><Home size={32} className="text-brand-500" /></CardBody></Card>
        <Card className="hover:shadow-md transition-shadow"><CardBody className="flex items-center justify-between"><div><p className="text-secondary text-sm font-medium uppercase tracking-wider">Biens loues</p><p className="text-2xl font-bold text-primary">{properties?.filter(p => p.statut === 'LOUE').length || 0}</p></div><Users size={32} className="text-brand-500" /></CardBody></Card>
        <Card className="hover:shadow-md transition-shadow"><CardBody className="flex items-center justify-between"><div><p className="text-secondary text-sm font-medium uppercase tracking-wider">Vacants</p><p className="text-2xl font-bold text-primary">{properties?.filter(p => p.statut === 'VACANT').length || 0}</p></div><TrendingUp size={32} className="text-brand-500" /></CardBody></Card>
      </div>


      <Card><CardBody><div className="flex flex-col md:flex-row gap-4"><div className="flex-1 relative"><Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary" /><input type="text" placeholder="Rechercher par adresse ou description..." className="input-field pl-10 bg-gray-50 border-gray-200 focus:bg-white transition-all rounded-xl w-full p-3 outline-none border focus:border-brand-500" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div><Button variant="outline" className="rounded-xl"><Filter size={20} className="mr-2" />Filtres</Button></div></CardBody></Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProperties.map((property) => (
          <Card key={property.id} className="hover:shadow-xl transition-all group overflow-hidden border-0 shadow-sm bg-white">
            <div className="relative h-56 overflow-hidden bg-gray-100">
              {getPropertyImageUrl(property) ? (
                <img
                  src={getPropertyImageUrl(property)}
                  alt={property.adresse}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300">
                  <Home size={64} strokeWidth={1} />
                </div>
              )}
              <div className="absolute top-4 right-4 z-10">{getStatusBadge(property.statut)}</div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>

            <CardBody className="p-5">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1 pr-2">
                  <h3 className="text-lg font-bold text-gray-900 line-clamp-1">{property.adresse}</h3>
                  <div className="flex items-center text-gray-500 text-sm mt-1">
                    <MapPin size={14} className="mr-1 text-brand-500" />
                    Lomé, Togo
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-extrabold text-brand-500">{(property.loyer_hc || 0).toLocaleString()} <span className="text-xs">CFA</span></p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">/ mois</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                <span className="px-2 py-1 bg-gray-100 rounded-lg text-xs font-semibold text-gray-600">
                  {property.categorie?.libelle || 'Bien'}
                </span>
                {property.type_appartement && (
                  <span className="px-2 py-1 bg-gray-100 rounded-lg text-xs font-semibold text-gray-600">
                    {property.type_appartement.libelle}
                  </span>
                )}
              </div>

              <div className="flex space-x-2 pt-4 border-t border-gray-50">
                <Link to={"/owner/properties/" + property.id} className="flex-1 inline-flex justify-center items-center px-4 py-3 bg-gray-50 text-gray-900 rounded-xl font-bold hover:bg-gray-100 transition-colors text-sm"><Eye size={16} className="mr-2" />Détails</Link>
                <Link to={"/owner/properties/edit/" + property.id} className="inline-flex justify-center items-center p-3 bg-brand-50 text-brand-500 rounded-xl font-bold hover:bg-brand-500 hover:text-white transition-all"><Edit size={18} /></Link>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {filteredProperties.length === 0 && !loading && (
        <div className="text-center py-20 bg-gray-50 rounded-[40px] border-2 border-dashed border-gray-200">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
            <Search size={32} className="text-gray-300" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">Aucun bien trouvé</h3>
          <p className="text-gray-500 mt-1">Essayez de modifier vos critères de recherche</p>
        </div>
      )}
    </div>
  );
};


export default PropertiesOwner;
