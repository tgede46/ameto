import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchCategories, fetchTypesAppartement, createProperty, uploadPropertyPhoto } from '../../store/slices/propertySlice';
import Card, { CardBody, CardHeader } from '../../components/common/Card';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Upload, Plus, X, MapPin, Home, DollarSign, Ruler, Info } from 'lucide-react';
import toast from 'react-hot-toast';

const AddPropertyOwner = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { categories, typesAppartement, loading } = useSelector((state) => state.properties);
  
  const [formData, setFormData] = useState({
    adresse: '',
    description: '',
    loyer_hc: '',
    charges: '',
    categorie_id: '',
    type_appartement_id: '',
    latitude: '',
    longitude: '',
    equipements: [],
  });
  
  const [feature, setFeature] = useState('');
  const [selectedPhotos, setSelectedPhotos] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchTypesAppartement());
  }, [dispatch]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePhotoChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedPhotos(prev => [...prev, ...files]);
  };

  const removePhoto = (index) => {
    setSelectedPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const addFeature = () => {
    if (feature.trim() && !formData.equipements.includes(feature.trim())) {
      setFormData(prev => ({ ...prev, equipements: [...prev.equipements, feature.trim()] }));
      setFeature('');
    }
  };

  const removeFeature = (index) => {
    setFormData(prev => ({ ...prev, equipements: prev.equipements.filter((_, i) => i !== index) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.categorie_id) {
      toast.error('Veuillez sélectionner une catégorie');
      return;
    }

    const payload = { ...formData };
    if (!payload.type_appartement_id) delete payload.type_appartement_id;
    if (!payload.charges) delete payload.charges;
    if (!payload.latitude) delete payload.latitude;
    if (!payload.longitude) delete payload.longitude;

    setIsSubmitting(true);
    try {
      // 1. Créer le bien
      const resultAction = await dispatch(createProperty(payload));
      
      if (createProperty.fulfilled.match(resultAction)) {
        const newProperty = resultAction.payload;
        
        // 2. Uploader les photos si présentes
        if (selectedPhotos.length > 0) {
          toast.loading('Upload des photos...', { id: 'upload' });
          let failedUploads = 0;
          let firstUploadError = null;
          for (let i = 0; i < selectedPhotos.length; i++) {
            const photoFormData = new FormData();
            photoFormData.append('image', selectedPhotos[i]);
            const uploadAction = await dispatch(uploadPropertyPhoto({ 
              propertyId: newProperty.id, 
              photoData: photoFormData 
            }));

            if (uploadPropertyPhoto.rejected.match(uploadAction)) {
              failedUploads += 1;
              if (!firstUploadError) {
                firstUploadError = uploadAction.payload;
              }
            }
          }
          toast.dismiss('upload');

          if (failedUploads > 0) {
            const detail =
              firstUploadError?.detail ||
              firstUploadError?.image?.[0] ||
              firstUploadError?.non_field_errors?.[0] ||
              null;
            toast.error(
              detail
                ? `${failedUploads} photo(s) non envoyee(s): ${detail}`
                : `${failedUploads} photo(s) n'ont pas pu etre envoyees.`
            );
          }
        }
        
        toast.success('Bien créé avec succès !');
        navigate('/owner/properties');
      } else {
        toast.error(resultAction.payload?.detail || 'Une erreur est survenue');
      }
    } catch (err) {
      toast.error('Erreur lors de la création');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading && categories.length === 0) return <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>;

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl mx-auto pb-12">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900">Publier un bien immobilier</h1>
        <p className="text-gray-500 mt-2">Mettez en valeur votre patrimoine immobilier sur Amétô.</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Informations de base */}
            <Card className="border-0 shadow-sm overflow-hidden">
              <CardHeader className="bg-gray-50/50 border-b border-gray-100 p-6">
                <div className="flex items-center gap-2">
                  <Info size={20} className="text-brand-500" />
                  <h3 className="text-lg font-bold text-gray-900">Informations générales</h3>
                </div>
              </CardHeader>
              <CardBody className="p-8 space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-widest">Adresse précise *</label>
                  <div className="relative">
                    <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                      type="text" 
                      name="adresse"
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all"
                      placeholder="ex: Rue des Palmiers, Tokoin, Lomé" 
                      value={formData.adresse} 
                      onChange={handleChange} 
                      required 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-widest">Catégorie *</label>
                    <select 
                      name="categorie_id"
                      className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all appearance-none cursor-pointer"
                      value={formData.categorie_id} 
                      onChange={handleChange}
                      required
                    >
                      <option value="">Sélectionner une catégorie</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.libelle}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-widest">Type (optionnel)</label>
                    <select 
                      name="type_appartement_id"
                      className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all appearance-none cursor-pointer"
                      value={formData.type_appartement_id} 
                      onChange={handleChange}
                    >
                      <option value="">Type d'appartement (Studio, T1, etc.)</option>
                      {typesAppartement.map(t => <option key={t.id} value={t.id}>{t.libelle}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-widest">Loyer Hors Charges (CFA) *</label>
                    <div className="relative">
                      <DollarSign size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input 
                        type="number" 
                        name="loyer_hc"
                        className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all"
                        placeholder="150000" 
                        value={formData.loyer_hc} 
                        onChange={handleChange} 
                        required 
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-widest">Charges mensuelles (CFA)</label>
                    <div className="relative">
                      <Plus size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input 
                        type="number" 
                        name="charges"
                        className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all"
                        placeholder="10000" 
                        value={formData.charges} 
                        onChange={handleChange} 
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-widest">Description détaillée</label>
                  <textarea 
                    name="description"
                    rows="5" 
                    className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all resize-none"
                    placeholder="Décrivez les atouts de votre bien (proximité, calme, équipements...)" 
                    value={formData.description} 
                    onChange={handleChange} 
                  />
                </div>
              </CardBody>
            </Card>

            {/* Caractéristiques */}
            <Card className="border-0 shadow-sm overflow-hidden">
              <CardHeader className="bg-gray-50/50 border-b border-gray-100 p-6">
                <div className="flex items-center gap-2">
                  <Ruler size={20} className="text-brand-500" />
                  <h3 className="text-lg font-bold text-gray-900">Équipements & Caractéristiques</h3>
                </div>
              </CardHeader>
              <CardBody className="p-8">
                <div className="flex gap-3 mb-6">
                  <input 
                    type="text" 
                    placeholder="ex: Climatisation, Parking, Piscine..." 
                    className="flex-1 px-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all"
                    value={feature} 
                    onChange={(e) => setFeature(e.target.value)} 
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())} 
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={addFeature}
                    className="rounded-2xl px-6"
                  >
                    <Plus size={24} />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.equipements.map((f, i) => (
                    <span key={i} className="px-4 py-2 bg-brand-50 text-brand-500 rounded-xl text-sm font-bold flex items-center group transition-all hover:bg-brand-500 hover:text-white">
                      {f}
                      <button type="button" onClick={() => removeFeature(i)} className="ml-2 group-hover:scale-110">
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                  {formData.equipements.length === 0 && (
                    <p className="text-gray-400 text-sm italic">Ajoutez des équipements pour attirer plus de clients.</p>
                  )}
                </div>
              </CardBody>
            </Card>
          </div>

          <div className="space-y-8">
            {/* Photos */}
            <Card className="border-0 shadow-sm overflow-hidden">
              <CardHeader className="bg-gray-50/50 border-b border-gray-100 p-6">
                <div className="flex items-center gap-2">
                  <Upload size={20} className="text-brand-500" />
                  <h3 className="text-lg font-bold text-gray-900">Photos (max 20)</h3>
                </div>
              </CardHeader>
              <CardBody className="p-6">
                <label className="block group">
                  <div className="border-2 border-dashed border-gray-200 rounded-[32px] p-8 text-center group-hover:border-brand-500 group-hover:bg-brand-50/30 transition-all cursor-pointer">
                    <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                      <Upload size={32} className="text-gray-400 group-hover:text-brand-500" />
                    </div>
                    <p className="text-gray-900 font-bold">Sélectionner des photos</p>
                    <p className="text-gray-500 text-xs mt-1">Glissez vos fichiers ici ou cliquez pour parcourir</p>
                    <input 
                      type="file" 
                      multiple 
                      accept="image/*" 
                      className="hidden" 
                      onChange={handlePhotoChange}
                    />
                  </div>
                </label>
                
                <div className="mt-6 grid grid-cols-2 gap-3">
                  {selectedPhotos.map((file, i) => (
                    <div key={i} className="relative aspect-square bg-gray-100 rounded-2xl overflow-hidden group shadow-sm">
                      <img 
                        src={URL.createObjectURL(file)} 
                        className="w-full h-full object-cover" 
                        alt={`Aperçu ${i}`}
                      />
                      <button 
                        type="button"
                        onClick={() => removePhoto(i)}
                        className="absolute top-2 right-2 bg-white/90 backdrop-blur text-brand-500 rounded-xl p-1.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>

            {/* Actions */}
            <Card className="border-0 shadow-sm overflow-hidden bg-gray-900 text-white">
              <CardBody className="p-8 space-y-4">
                <div className="mb-6">
                  <h4 className="text-xl font-bold mb-2">Prêt à publier ?</h4>
                  <p className="text-gray-400 text-sm">Votre bien sera immédiatement visible par les clients potentiels après validation.</p>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-sm py-2 border-b border-white/10">
                    <span className="text-gray-400">Loyer mensuel</span>
                    <span className="font-bold">{(parseInt(formData.loyer_hc) || 0).toLocaleString()} CFA</span>
                  </div>
                  <div className="flex justify-between text-sm py-2">
                    <span className="text-gray-400">Photos sélectionnées</span>
                    <span className="font-bold">{selectedPhotos.length}</span>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  variant="primary" 
                  className="w-full py-4 rounded-2xl text-lg font-bold mt-6 shadow-xl shadow-brand-500/20" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <LoadingSpinner size="small" />
                      <span>Publication...</span>
                    </div>
                  ) : (
                    'Publier le bien'
                  )}
                </Button>
                <Button 
                  type="button" 
                  onClick={() => navigate('/owner/properties')}
                  className="w-full py-4 bg-white/10 text-white rounded-2xl font-bold hover:bg-white/20 transition-all border-0"
                >
                  Annuler
                </Button>
              </CardBody>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddPropertyOwner;
