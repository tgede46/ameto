import React, { useState } from 'react';
import Card, { CardBody, CardHeader } from '../../components/common/Card';
import Button from '../../components/common/Button';
import { Upload, Plus, X, MapPin, Home, DollarSign, Ruler } from 'lucide-react';

const AddPropertyOwner = () => {
  const [formData, setFormData] = useState({
    name: '', type: 'Appartement', price: '', surface: '', location: '', description: '', features: [], images: []
  });
  const [feature, setFeature] = useState('');
  const [loading, setLoading] = useState(false);
  const propertyTypes = ['Appartement', 'Studio', 'Villa', 'Maison', 'Local Commercial', 'Terrain', 'Bureau', 'Entrepôt'];
  
  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => { setLoading(false); window.location.href = '/owner/properties'; }, 1000);
  };
  
  const addFeature = () => { if (feature.trim()) { setFormData({ ...formData, features: [...formData.features, feature] }); setFeature(''); } };
  const removeFeature = (index) => { setFormData({ ...formData, features: formData.features.filter((_, i) => i !== index) }); };
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div><h1 className="text-3xl font-bold text-primary">Ajouter un bien immobilier</h1><p className="text-secondary mt-2">Remplissez toutes les informations ci-dessous</p></div>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card><CardHeader><h3 className="text-lg font-bold">Informations générales</h3></CardHeader>
            <CardBody className="space-y-4">
              <div><label className="block text-sm font-medium mb-2">Nom du bien *</label><input type="text" className="input-field" placeholder="ex: Appartement de luxe Tokoin" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required /></div>
              <div className="grid grid-cols-2 gap-4"><div><label className="block text-sm font-medium mb-2">Type de bien *</label><select className="input-field" value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })}>{propertyTypes.map(t => <option key={t}>{t}</option>)}</select></div>
              <div><label className="block text-sm font-medium mb-2">Prix (CFA) *</label><input type="number" className="input-field" placeholder="150000" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} required /></div></div>
              <div className="grid grid-cols-2 gap-4"><div><label className="block text-sm font-medium mb-2">Surface (m²) *</label><input type="number" className="input-field" placeholder="65" value={formData.surface} onChange={(e) => setFormData({ ...formData, surface: e.target.value })} required /></div>
              <div><label className="block text-sm font-medium mb-2">Localisation *</label><input type="text" className="input-field" placeholder="Lomé, Tokoin" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} required /></div></div>
              <div><label className="block text-sm font-medium mb-2">Description détaillée</label><textarea rows="4" className="input-field" placeholder="Décrivez votre bien..." value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} /></div>
            </CardBody></Card>
            <Card><CardHeader><h3 className="text-lg font-bold">Caractéristiques</h3></CardHeader><CardBody><div className="flex space-x-2 mb-4"><input type="text" placeholder="ex: Climatisation, Parking, Piscine..." className="flex-1 input-field" value={feature} onChange={(e) => setFeature(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && addFeature()} /><Button type="button" variant="outline" onClick={addFeature}><Plus size={18} /></Button></div><div className="flex flex-wrap gap-2">{formData.features.map((f, i) => (<span key={i} className="px-3 py-1 bg-brand-50 text-brand-500 rounded-full text-sm flex items-center">{f}<button type="button" onClick={() => removeFeature(i)} className="ml-2"><X size={14} /></button></span>))}</div></CardBody></Card>
          </div>
          <div className="space-y-6">
            <Card><CardHeader><h3 className="text-lg font-bold">Photos du bien</h3></CardHeader><CardBody><div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-brand-500 transition-colors cursor-pointer"><Upload size={48} className="mx-auto text-secondary mb-3" /><p className="text-secondary">Cliquez ou glissez des photos</p><p className="text-secondary text-xs mt-1">PNG, JPG jusqu'à 5MB</p><Button type="button" variant="outline" size="sm" className="mt-4">Choisir des fichiers</Button></div><div className="mt-4 grid grid-cols-3 gap-2">{formData.images.map((img, i) => (<div key={i} className="relative h-20 bg-gray-100 rounded-lg"><img src={img} className="w-full h-full object-cover rounded-lg" /><button className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5"><X size={12} /></button></div>))}</div></CardBody></Card>
            <Card><CardHeader><h3 className="text-lg font-bold">Récapitulatif</h3></CardHeader><CardBody className="space-y-3"><div className="flex justify-between py-2 border-b border-border"><span className="text-secondary">Type:</span><span className="font-medium">{formData.type || '-'}</span></div><div className="flex justify-between py-2 border-b border-border"><span className="text-secondary">Prix:</span><span className="font-medium text-brand-500">{formData.price ? formData.price.toLocaleString() + ' CFA' : '-'}</span></div><div className="flex justify-between py-2 border-b border-border"><span className="text-secondary">Surface:</span><span className="font-medium">{formData.surface ? formData.surface + ' m²' : '-'}</span></div><div className="flex justify-between py-2"><span className="text-secondary">Localisation:</span><span className="font-medium truncate w-32 text-right">{formData.location || '-'}</span></div></CardBody></Card>
            <Card><CardHeader><h3 className="text-lg font-bold">Actions</h3></CardHeader><CardBody className="space-y-3"><Button type="submit" variant="primary" className="w-full" loading={loading}>Publier le bien</Button><a href="/owner/properties" className="w-full inline-flex justify-center items-center px-6 py-3 border-2 border-border rounded-xl font-semibold hover:border-primary transition-colors">Annuler</a></CardBody></Card>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddPropertyOwner;
