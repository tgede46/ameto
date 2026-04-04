import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { fetchPropertyById } from '../../store/slices/propertySlice';
import Card, { CardBody } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { MapPin, Home, DollarSign, Ruler, Edit, ArrowLeft, Calendar, Users, Info, CheckCircle, Clock } from 'lucide-react';
import { toApiMediaUrl } from '../../services/api';

const PropertyDetailsOwner = () => {
    const { id } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [property, setProperty] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadProperty = async () => {
            const result = await dispatch(fetchPropertyById(id));
            if (fetchPropertyById.fulfilled.match(result)) {
                setProperty(result.payload);
            }
            setLoading(false);
        };
        loadProperty();
    }, [dispatch, id]);

    const getStatusBadge = (status) => {
        switch (status?.toUpperCase()) {
            case 'LOUE': return <Badge variant="success" className="px-4 py-2 text-sm rounded-xl">Loué</Badge>;
            case 'VACANT': return <Badge variant="info" className="px-4 py-2 text-sm rounded-xl">Vacant</Badge>;
            case 'VENDRE': return <Badge variant="warning" className="px-4 py-2 text-sm rounded-xl">À vendre</Badge>;
            case 'EN_TRAVAUX': return <Badge variant="danger" className="px-4 py-2 text-sm rounded-xl">En travaux</Badge>;
            default: return <Badge className="px-4 py-2 text-sm rounded-xl">{status || 'Inconnu'}</Badge>;
        }
    };

    if (loading) return <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>;
    if (!property) return <div className="p-6 bg-red-50 text-red-600 rounded-2xl">Propriété introuvable</div>;

    return (
        <div className="space-y-8 animate-fade-in pb-20">
            {/* Header avec bouton retour */}
            <div className="flex justify-between items-center bg-white/40 backdrop-blur-md p-6 rounded-[32px] border border-white/60 shadow-sm">
                <div className="flex items-center gap-6">
                    <button onClick={() => navigate('/owner/properties')} className="p-3 bg-white rounded-2xl hover:bg-gray-50 transition-all shadow-sm border border-gray-100">
                        <ArrowLeft size={24} className="text-gray-900" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-900 leading-tight">{property.adresse}</h1>
                        <div className="flex items-center text-gray-500 font-medium mt-1">
                            <MapPin size={16} className="mr-2 text-brand-500" />
                            Lomé, Togo · {property.categorie?.libelle}
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {getStatusBadge(property.statut)}
                    <Link
                        to={`/owner/properties/edit/${id}`}
                        className="flex items-center gap-2 bg-brand-500 text-white px-6 py-3.5 rounded-2xl font-bold shadow-xl shadow-brand-500/20 hover:bg-brand-600 transition-all active:scale-95"
                    >
                        <Edit size={20} />
                        <span>Modifier</span>
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Colonne Gauche: Photos et Description */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Galerie Photo */}
                    <Card className="border-0 shadow-lg shadow-gray-200/50 rounded-[40px] overflow-hidden">
                        <div className="p-2 grid grid-cols-2 md:grid-cols-3 gap-2">
                            {property.photos_bien?.length > 0 ? (
                                property.photos_bien.map((photo, i) => (
                                    <div key={i} className={`relative overflow-hidden rounded-[24px] ${i === 0 ? 'md:col-span-2 md:row-span-2 aspect-video' : 'aspect-square'}`}>
                                        <img
                                            src={toApiMediaUrl(photo.image_url || photo.image)}
                                            className="w-full h-full object-cover hover:scale-110 transition-transform duration-700"
                                            alt=""
                                        />
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-3 aspect-video bg-gray-100 flex items-center justify-center text-gray-300 rounded-[30px]">
                                    <Home size={80} strokeWidth={1} />
                                </div>
                            )}
                        </div>
                    </Card>

                    {/* Description et équipements */}
                    <Card className="border-0 shadow-sm rounded-[32px] overflow-hidden bg-white">
                        <CardBody className="p-10 space-y-10">
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                                    <Info size={24} className="text-brand-500" />
                                    Description du bien
                                </h3>
                                <p className="text-gray-600 text-lg leading-relaxed whitespace-pre-wrap">
                                    {property.description || "Aucune description fournie pour ce bien."}
                                </p>
                            </div>

                            <div className="border-t border-gray-50 pt-10">
                                <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                                    <CheckCircle size={24} className="text-brand-500" />
                                    Équipements inclus
                                </h3>
                                <div className="flex flex-wrap gap-3">
                                    {property.equipements?.map((eq, i) => (
                                        <span key={i} className="px-6 py-3 bg-gray-50 text-gray-700 rounded-2xl text-sm font-bold border border-gray-100">
                                            {eq}
                                        </span>
                                    )) || <p className="text-gray-400 italic">Aucun équipement renseigné.</p>}
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                </div>

                {/* Colonne Droite: Stats et Finance */}
                <div className="space-y-8">
                    {/* Carte Financière */}
                    <Card className="border-0 bg-gray-900 text-white rounded-[40px] shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-brand-500/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl group-hover:scale-150 transition-transform duration-1000" />
                        <CardBody className="p-10 relative z-10">
                            <div className="flex items-center gap-3 mb-8 bg-white/5 w-max px-4 py-2 rounded-2xl border border-white/10 backdrop-blur-md">
                                <DollarSign size={18} className="text-brand-500" />
                                <span className="text-[11px] font-black uppercase tracking-widest text-[#FF385C]">Revenus mensuels</span>
                            </div>

                            <div className="space-y-1 mb-8">
                                <p className="text-5xl font-black tracking-tight">{(property.loyer_hc || 0).toLocaleString()} <span className="text-2xl font-bold text-brand-500">F</span></p>
                                <p className="text-gray-400 font-bold text-sm">Loyer Hors Charges</p>
                            </div>

                            <div className="space-y-4 border-t border-white/10 pt-8 mt-8">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-400 font-medium">Charges estimées</span>
                                    <span className="font-bold">{(property.charges || 0).toLocaleString()} F</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-400 font-medium">Commission Amétô (10%)</span>
                                    <span className="text-red-400 font-bold">- {((property.loyer_hc || 0) * 0.1).toLocaleString()} F</span>
                                </div>
                                <div className="flex justify-between items-center pt-4 border-t border-white/5">
                                    <span className="text-brand-500 font-black uppercase tracking-widest text-xs">Revenu Net Estimé</span>
                                    <span className="text-2xl font-black text-white">{((property.loyer_hc || 0) * 0.9).toLocaleString()} F</span>
                                </div>
                            </div>
                        </CardBody>
                    </Card>

                    {/* État du bien */}
                    <Card className="border-0 shadow-sm rounded-[32px] overflow-hidden bg-white">
                        <CardBody className="p-8 space-y-6">
                            <h4 className="font-bold text-gray-900 border-b border-gray-50 pb-4">Résumé technique</h4>

                            <div className="flex items-center gap-4 group">
                                <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center border border-blue-100 group-hover:scale-110 transition-transform">
                                    <Ruler size={20} />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Type</p>
                                    <p className="font-bold text-gray-900">{property.type_appartement?.libelle || 'Standard'}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 group">
                                <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center border border-emerald-100 group-hover:scale-110 transition-transform">
                                    <Clock size={20} />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Dernière Mise à jour</p>
                                    <p className="font-bold text-gray-900">{new Date(property.updated_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 group">
                                <div className="w-12 h-12 bg-orange-50 text-orange-500 rounded-2xl flex items-center justify-center border border-orange-100 group-hover:scale-110 transition-transform">
                                    <Calendar size={20} />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Date de publication</p>
                                    <p className="font-bold text-gray-900">{new Date(property.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                </div>
                            </div>
                        </CardBody>
                    </Card>

                    {/* Quick Action pour le proprio */}
                    <div className="p-8 bg-brand-50 rounded-[32px] border border-brand-100 space-y-4">
                        <h5 className="font-bold text-brand-900">Demandes en cours</h5>
                        <p className="text-sm text-brand-700">Il y a des candidats intéressés par ce bien.</p>
                        <Link to="/owner/candidatures" className="block w-full text-center py-4 bg-brand-500 text-white rounded-2xl font-bold shadow-lg shadow-brand-500/10 hover:shadow-brand-500/30 transition-all active:scale-[0.98]">
                            Gérer les candidatures
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PropertyDetailsOwner;
