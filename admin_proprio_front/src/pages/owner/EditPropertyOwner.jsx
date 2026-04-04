import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchCategories, fetchTypesAppartement, fetchPropertyById, editProperty, uploadPropertyPhoto } from '../../store/slices/propertySlice';
import Card, { CardBody, CardHeader } from '../../components/common/Card';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Upload, Plus, X, MapPin, Home, DollarSign, Ruler, Info, Save } from 'lucide-react';
import toast from 'react-hot-toast';

const EditPropertyOwner = () => {
    const { id } = useParams();
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
    const [existingPhotos, setExistingPhotos] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isFetching, setIsFetching] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            await dispatch(fetchCategories());
            await dispatch(fetchTypesAppartement());

            const result = await dispatch(fetchPropertyById(id));
            if (fetchPropertyById.fulfilled.match(result)) {
                const prop = result.payload;
                setFormData({
                    adresse: prop.adresse || '',
                    description: prop.description || '',
                    loyer_hc: prop.loyer_hc || '',
                    charges: prop.charges || '',
                    categorie_id: prop.categorie?.id || '',
                    type_appartement_id: prop.type_appartement?.id || '',
                    latitude: prop.latitude || '',
                    longitude: prop.longitude || '',
                    equipements: prop.equipements || [],
                });
                setExistingPhotos(prop.photos_bien || []);
            } else {
                toast.error("Impossible de charger le bien");
                navigate('/owner/properties');
            }
            setIsFetching(false);
        };

        loadData();
    }, [dispatch, id, navigate]);

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
        // Nettoyage des champs vides pour éviter les erreurs 400 (DecimalField / ForeignKey)
        if (!payload.type_appartement_id) delete payload.type_appartement_id;
        if (!payload.charges) delete payload.charges;
        if (!payload.latitude) delete payload.latitude;
        if (!payload.longitude) delete payload.longitude;

        setIsSubmitting(true);
        try {
            const resultAction = await dispatch(editProperty({ id, propertyData: payload }));

            if (editProperty.fulfilled.match(resultAction)) {
                // Uploader les nouvelles photos si présentes
                if (selectedPhotos.length > 0) {
                    toast.loading('Upload des nouvelles photos...', { id: 'upload' });
                    for (let i = 0; i < selectedPhotos.length; i++) {
                        const photoFormData = new FormData();
                        photoFormData.append('image', selectedPhotos[i]);
                        await dispatch(uploadPropertyPhoto({
                            propertyId: id,
                            photoData: photoFormData
                        }));
                    }
                    toast.dismiss('upload');
                }

                toast.success('Bien mis à jour avec succès !');
                navigate('/owner/properties');
            } else {
                toast.error(resultAction.payload?.detail || 'Une erreur est survenue');
            }
        } catch (err) {
            toast.error('Erreur lors de la modification');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isFetching) return <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>;

    return (
        <div className="space-y-6 animate-fade-in max-w-6xl mx-auto pb-12">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900">Modifier le bien</h1>
                    <p className="text-gray-500 mt-2">Mettez à jour les informations de votre annonce.</p>
                </div>
                <Button variant="outline" onClick={() => navigate('/owner/properties')} className="rounded-xl">
                    Retour
                </Button>
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
                                </div>
                            </CardBody>
                        </Card>
                    </div>

                    <div className="space-y-8">
                        {/* Photos existantes */}
                        <Card className="border-0 shadow-sm overflow-hidden">
                            <CardHeader className="bg-gray-50/50 border-b border-gray-100 p-6">
                                <div className="flex items-center gap-2">
                                    <Home size={20} className="text-brand-500" />
                                    <h3 className="text-lg font-bold text-gray-900">Photos actuelles</h3>
                                </div>
                            </CardHeader>
                            <CardBody className="p-6 grid grid-cols-2 gap-3">
                                {existingPhotos.map((photo, i) => (
                                    <div key={i} className="relative aspect-square bg-gray-100 rounded-2xl overflow-hidden shadow-sm">
                                        <img
                                            src={photo.image_url || photo.image}
                                            className="w-full h-full object-cover"
                                            alt=""
                                        />
                                    </div>
                                ))}
                            </CardBody>
                        </Card>

                        {/* Ajouter des Photos */}
                        <Card className="border-0 shadow-sm overflow-hidden">
                            <CardHeader className="bg-gray-50/50 border-b border-gray-100 p-6">
                                <div className="flex items-center gap-2">
                                    <Upload size={20} className="text-brand-500" />
                                    <h3 className="text-lg font-bold text-gray-900">Ajouter des photos</h3>
                                </div>
                            </CardHeader>
                            <CardBody className="p-6">
                                <label className="block group">
                                    <div className="border-2 border-dashed border-gray-200 rounded-[32px] p-8 text-center group-hover:border-brand-500 group-hover:bg-brand-50/30 transition-all cursor-pointer">
                                        <Upload size={32} className="text-gray-400 mx-auto mb-2" />
                                        <p className="text-gray-900 font-bold text-sm">Nouveaux fichiers</p>
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
                                        <div key={i} className="relative aspect-square bg-gray-100 rounded-2xl overflow-hidden group">
                                            <img
                                                src={URL.createObjectURL(file)}
                                                className="w-full h-full object-cover"
                                                alt=""
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removePhoto(i)}
                                                className="absolute top-2 right-2 bg-white/90 text-brand-500 rounded-xl p-1"
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </CardBody>
                        </Card>

                        {/* Actions */}
                        <Card className="border-0 shadow-sm overflow-hidden bg-gray-900 text-white">
                            <CardBody className="p-8 space-y-4">
                                <Button
                                    type="submit"
                                    variant="primary"
                                    className="w-full py-4 rounded-2xl text-lg font-bold shadow-xl shadow-brand-500/20"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? 'Enregistrement...' : (
                                        <div className="flex items-center justify-center gap-2">
                                            <Save size={20} />
                                            <span>Enregistrer les modifications</span>
                                        </div>
                                    )}
                                </Button>
                                <Button
                                    type="button"
                                    onClick={() => navigate('/owner/properties')}
                                    className="w-full py-4 bg-white/10 text-white rounded-2xl font-bold border-0"
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

export default EditPropertyOwner;
