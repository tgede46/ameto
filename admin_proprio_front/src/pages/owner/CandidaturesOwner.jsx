import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import api from '../../services/api';
import Card, { CardBody } from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Check, X, User, Home, FileText, CheckCircle, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

const CandidaturesOwner = () => {
    const [candidatures, setCandidatures] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchCandidatures = async () => {
        try {
            // Pour l'instant on utilise un appel API direct local pour récupérer les candidatures du proprio
            const res = await api.get('biens/candidatures/');
            setCandidatures(res.data.results || res.data || []);
        } catch (error) {
            toast.error('Erreur lors du chargement des candidatures');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCandidatures();
    }, []);

    const handleAction = async (id, actionStr) => {
        try {
            // Supposons une route d'acceptation / refus `PATCH biens/candidatures/{id}/` avec { statut: actionStr } 
            // ou POST biens/candidatures/{id}/accepter/ . Nous allons tester un simple PATCH.
            await api.patch(`biens/candidatures/${id}/`, { statut: actionStr });
            toast.success(actionStr === 'ACCEPTE' ? 'Candidature acceptée !' : 'Candidature refusée.');
            fetchCandidatures();
        } catch (error) {
            toast.error("Erreur lors du traitement de la candidature.");
        }
    };

    if (loading) return <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>;

    return (
        <div className="space-y-6 animate-fade-in">
            <div>
                <h1 className="text-3xl font-bold text-primary">Candidatures</h1>
                <p className="text-secondary mt-2">Gérez les demandes de location pour vos biens</p>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {candidatures.length === 0 ? (
                    <div className="text-center py-20 bg-gray-50 rounded-[40px] border-2 border-dashed border-gray-200">
                        <FileText size={48} className="text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-900">Aucune candidature</h3>
                        <p className="text-gray-500 mt-1">Vous n'avez pas encore reçu de demande de location.</p>
                    </div>
                ) : (
                    candidatures.map((c) => (
                        <Card key={c.id} className="hover:shadow-md transition-shadow">
                            <CardBody className="p-6">
                                <div className="flex flex-col md:flex-row justify-between gap-6">
                                    <div className="flex-1 space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-lg font-bold flex items-center gap-2">
                                                <User size={20} className="text-brand-500" />
                                                {c.locataire_nom || 'Candidat'}
                                            </h3>
                                            <Badge variant={c.statut === 'EN_ATTENTE' ? 'warning' : c.statut === 'ACCEPTE' ? 'success' : 'danger'}>
                                                {c.statut === 'EN_ATTENTE' ? 'En attente' : c.statut === 'ACCEPTE' ? 'Acceptée' : 'Refusée'}
                                            </Badge>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm bg-gray-50 p-4 rounded-2xl">
                                            <div>
                                                <p className="text-gray-500 mb-1 flex items-center gap-2"><Home size={14} /> Bien demandé</p>
                                                <p className="font-semibold text-gray-900">{c.bien_adresse || (typeof c.bien === 'object' ? c.bien.adresse : `Bien ID: ${c.bien}`)}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-500 mb-1 flex items-center gap-2"><Clock size={14} /> Date de la demande</p>
                                                <p className="font-semibold text-gray-900">{new Date(c.created_at || c.date_candidature).toLocaleDateString('fr-FR')}</p>
                                            </div>
                                        </div>

                                        {c.message && (
                                            <div className="text-sm text-gray-600 bg-white p-4 rounded-xl border border-gray-100 italic">
                                                "{c.message}"
                                            </div>
                                        )}
                                    </div>

                                    {c.statut === 'EN_ATTENTE' && (
                                        <div className="flex md:flex-col gap-3 justify-center">
                                            <Button variant="primary" className="flex-1" onClick={() => handleAction(c.id, 'ACCEPTE')}>
                                                <Check size={18} className="mr-2" /> Accepter
                                            </Button>
                                            <Button variant="outline" className="flex-1 text-red-500 border-red-200 hover:bg-red-50 hover:border-red-500" onClick={() => handleAction(c.id, 'REFUSE')}>
                                                <X size={18} className="mr-2" /> Refuser
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </CardBody>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
};

export default CandidaturesOwner;
