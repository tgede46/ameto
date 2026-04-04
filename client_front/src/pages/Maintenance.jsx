import { Home, ChevronRight, UploadCloud, AlertTriangle, ArrowLeft, Check, Wrench, Zap, Lock, Info, Camera, PenTool as Tool, Loader2, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { createMaintenance, fetchMaintenances, sendMaintenanceJustificatif } from "../store/userSlice";
import { toast } from "react-hot-toast";


export default function Maintenance() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { loading, error: reduxError, maintenanceRequests, profile } = useSelector((state) => state.user);

    const [urgency, setUrgency] = useState("MOYENNE");
    const [step, setStep] = useState(1);
    const [category, setCategory] = useState("Plomberie");
    const [titre, setTitre] = useState("");
    const [description, setDescription] = useState("");
    const [localError, setLocalError] = useState(null);

    // Fetch existing maintenance requests on mount
    useEffect(() => {
        if (profile) {
            dispatch(fetchMaintenances());
        }
    }, [dispatch, profile]);

    const categories = [
        { id: "Plomberie", icon: Wrench, color: "text-blue-500", bg: "bg-blue-50" },
        { id: "Électricité", icon: Zap, color: "text-yellow-500", bg: "bg-yellow-50" },
        { id: "Climatisation", icon: WindIcon, color: "text-cyan-500", bg: "bg-cyan-50" },
        { id: "Serrurerie", icon: Lock, color: "text-purple-500", bg: "bg-purple-50" },
        { id: "Autre", icon: Tool, color: "text-[#717171]", bg: "bg-[#F9FAFB]" }
    ];

    function WindIcon(props) {
        return (
            <svg
                {...props}
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2" />
                <path d="M9.6 4.6A2 2 0 1 1 11 8H2" />
                <path d="M12.6 19.4A2 2 0 1 0 14 16H2" />
            </svg>
        );
    }

    // Map to swagger priorite enum: BASSE, MOYENNE, HAUTE, URGENT
    const urgencyLevels = [
        { id: "BASSE", label: "Normal", color: "bg-gray-100 text-gray-600", active: "bg-[#222222] text-white", desc: "Sous 72h" },
        { id: "MOYENNE", label: "Moyen", color: "bg-blue-50 text-blue-600", active: "bg-blue-600 text-white", desc: "Sous 48h" },
        { id: "HAUTE", label: "Urgent", color: "bg-orange-50 text-orange-600", active: "bg-[#E9A319] text-white", desc: "Sous 24h" },
        { id: "URGENT", label: "Critique", color: "bg-red-50 text-red-600", active: "bg-red-600 text-white", desc: "Immédiat" }
    ];

    const [activeTab, setActiveTab] = useState("new");
    const [showReceiptModal, setShowReceiptModal] = useState(false);
    const [selectedMaintenance, setSelectedMaintenance] = useState(null);
    const [justificatifFile, setJustificatifFile] = useState(null);
    const [justificatifComment, setJustificatifComment] = useState("");

    // Map statut to display
    const getStatutBadge = (statut) => {
        const map = {
            'EN_ATTENTE': { label: 'En attente', color: 'bg-yellow-100/80 text-yellow-700 border-yellow-200' },
            'APPROUVE': { label: 'Approuvé', color: 'bg-blue-100/80 text-blue-700 border-blue-200' },
            'EN_COURS': { label: 'En cours', color: 'bg-orange-100/80 text-orange-700 border-orange-200' },
            'TERMINE': { label: 'Terminé', color: 'bg-[#10B981]/10 text-[#10B981] border-[#10B981]/20' },
            'REFUSE': { label: 'Refusé', color: 'bg-red-100/80 text-red-700 border-red-200' },
        };
        return map[statut] || { label: statut, color: 'bg-gray-100 text-gray-600 border-gray-200' };
    };

    const getPrioriteBadge = (priorite) => {
        const map = {
            'BASSE': { label: 'Basse', color: 'text-gray-500' },
            'MOYENNE': { label: 'Moyenne', color: 'text-blue-500' },
            'HAUTE': { label: 'Haute', color: 'text-orange-500' },
            'URGENT': { label: 'Urgent', color: 'text-red-500' },
        };
        return map[priorite] || { label: priorite, color: 'text-gray-500' };
    };

    const handleSubmitMaintenance = async () => {
        if (!description.trim()) {
            setLocalError("Veuillez décrire le problème.");
            return;
        }

        const maintenanceTitle = titre.trim() || `${category} - Demande de maintenance`;

        // POST /api/maintenances/ — Body matches swagger: { titre, description, bien, priorite }
        const data = {
            titre: maintenanceTitle,
            description: description.trim(),
            bien: profile?.bail_actif?.bien?.id || 1,  // Passing ID instead of object
            priorite: urgency,
        };

        setLocalError(null);
        const result = await dispatch(createMaintenance(data));

        if (createMaintenance.fulfilled.match(result)) {
            setStep(3);
        } else {
            setLocalError(typeof result.payload === 'string' ? result.payload : "Une erreur est survenue lors de l'envoi.");
        }
    };

    return (
        <div className="min-h-screen bg-white md:bg-[#F9FAFB]/30 flex flex-col items-center py-8 md:py-16 px-4 font-sans">

            {/* Navigation */}
            <div className="w-full max-w-3xl mb-12 flex items-center justify-between">
                <button
                    onClick={() => navigate(-1)}
                    className="group flex items-center gap-3 text-[#717171] hover:text-[#222222] font-bold transition-all active:scale-95"
                >
                    <div className="p-2 bg-white rounded-xl shadow-sm border border-[#EBEBEB] group-hover:shadow-md transition-shadow">
                        <ArrowLeft size={18} />
                    </div>
                    Retour au tableau de bord
                </button>
            </div>

            {/* Property Context */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-3xl mb-8 flex flex-col md:flex-row items-center gap-4 text-sm bg-white px-8 py-5 rounded-3xl border border-[#EBEBEB] shadow-xl shadow-gray-200/50"
            >
                <div className="p-3 bg-[#fff0f1] rounded-2xl text-[#FF385C]">
                    <Home size={20} strokeWidth={2.5} />
                </div>
                <div className="flex flex-wrap items-center gap-2 font-bold text-[#222222]">
                    <span>{profile?.bail_actif?.bien_adresse || 'Mon logement'}</span>
                    <ChevronRight size={14} className="text-gray-300" />
                    <span className="text-[#717171] font-medium">Lomé, Togo</span>
                </div>
            </motion.div>

            {/* Tabs */}
            <div className="w-full max-w-3xl flex bg-[#F9FAFB] p-1.5 rounded-2xl mb-12 shadow-inner border border-[#EBEBEB]">
                <button
                    onClick={() => setActiveTab("new")}
                    className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${activeTab === "new" ? "bg-white text-[#222222] shadow-sm" : "text-[#717171] hover:text-[#222222]"
                        }`}
                >
                    Nouveau signalement
                </button>
                <button
                    onClick={() => setActiveTab("history")}
                    className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${activeTab === "history" ? "bg-white text-[#222222] shadow-sm" : "text-[#717171] hover:text-[#222222]"
                        }`}
                >
                    Mes demandes ({maintenanceRequests.length})
                </button>
            </div>

            {activeTab === "new" ? (
                <>
                    {/* Stepper */}
                    <div className="w-full max-w-2xl mb-16 relative">
                        <div className="absolute top-5 left-0 right-0 h-1 bg-gray-100 -z-10 rounded-full mx-10">
                            <motion.div
                                initial={{ width: "0%" }}
                                animate={{ width: step === 1 ? "0%" : step === 2 ? "50%" : "100%" }}
                                className="h-full bg-[#FF385C] rounded-full transition-all duration-500"
                            />
                        </div>
                        <div className="flex justify-between">
                            {[1, 2, 3].map((s) => (
                                <div key={s} className="flex flex-col items-center gap-3 w-20">
                                    <motion.div
                                        animate={{
                                            scale: step === s ? 1.2 : 1,
                                            backgroundColor: step >= s ? "#FF4B5C" : "#FFFFFF",
                                            color: step >= s ? "#FFFFFF" : "#D1D5DB",
                                            borderColor: step >= s ? "#FF4B5C" : "#F3F4F6"
                                        }}
                                        className="w-10 h-10 rounded-full border-4 flex items-center justify-center font-extrabold shadow-sm z-10"
                                    >
                                        {step > s ? <Check size={20} strokeWidth={3} /> : s}
                                    </motion.div>
                                    <span className={`text-[10px] font-bold uppercase tracking-widest text-center ${step === s ? 'text-[#222222]' : 'text-[#b0b0b0]'}`}>
                                        {s === 1 ? "Détails" : s === 2 ? "Urgence" : "Terminé"}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Form Content */}
                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="w-full max-w-2xl bg-white rounded-[40px] border border-[#EBEBEB] shadow-2xl p-8 md:p-12 space-y-10"
                            >
                                <div>
                                    <h1 className="text-3xl font-extrabold text-[#222222] mb-2">Quel est le problème ?</h1>
                                    <p className="text-[#717171]">Sélectionnez une catégorie et décrivez la situation.</p>
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                                    {categories.map((cat) => (
                                        <button
                                            key={cat.id}
                                            type="button"
                                            onClick={() => setCategory(cat.id)}
                                            className={`flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition-all active:scale-95 ${category === cat.id
                                                ? 'border-[#FF385C] bg-[#fff0f1]/30'
                                                : 'border-gray-50 bg-[#F9FAFB]/50 hover:border-[#EBEBEB]'
                                                }`}
                                        >
                                            <div className={`p-3 rounded-xl ${cat.bg} ${cat.color}`}>
                                                <cat.icon size={20} />
                                            </div>
                                            <span className="text-xs font-bold text-[#222222]">{cat.id}</span>
                                        </button>
                                    ))}
                                </div>

                                <div className="space-y-4">
                                    <label className="text-sm font-bold text-[#222222] uppercase tracking-widest ml-1">Titre (optionnel)</label>
                                    <input
                                        type="text"
                                        value={titre}
                                        onChange={(e) => setTitre(e.target.value)}
                                        placeholder={`Ex: Fuite ${category.toLowerCase()}`}
                                        className="w-full bg-[#F9FAFB]/50 border-2 border-gray-50 rounded-2xl px-6 py-4 focus:border-[#FF385C] outline-none text-base transition-colors"
                                    />
                                </div>

                                <div className="space-y-4">
                                    <label className="text-sm font-bold text-[#222222] uppercase tracking-widest ml-1">Description détaillée</label>
                                    <textarea
                                        rows={6}
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Ex: Le robinet de la cuisine fuit abondamment depuis ce matin..."
                                        className="w-full bg-[#F9FAFB]/50 border-2 border-gray-50 rounded-3xl px-6 py-5 focus:border-[#FF385C] outline-none text-base transition-colors resize-none shadow-inner"
                                    ></textarea>
                                </div>

                                {localError && (
                                    <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-bold flex items-center gap-3 border border-red-100">
                                        <AlertTriangle size={18} />
                                        {localError}
                                    </div>
                                )}

                                <button
                                    onClick={() => {
                                        if (!description.trim()) {
                                            setLocalError("Veuillez décrire le problème.");
                                            return;
                                        }
                                        setLocalError(null);
                                        setStep(2);
                                    }}
                                    className="w-full bg-[#222222] text-white font-bold py-5 rounded-3xl hover:bg-black transition-all active:scale-[0.98] shadow-xl shadow-gray-900/10 text-lg"
                                >
                                    Continuer
                                </button>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="w-full max-w-2xl bg-white rounded-[40px] border border-[#EBEBEB] shadow-2xl p-8 md:p-12 space-y-10"
                            >
                                <div>
                                    <h1 className="text-3xl font-extrabold text-[#222222] mb-2">Niveau d'urgence</h1>
                                    <p className="text-[#717171]">Indiquez l'urgence pour que le propriétaire puisse prioriser.</p>
                                </div>

                                <div className="space-y-6">
                                    <div className="flex items-center gap-2 ml-1">
                                        <AlertTriangle size={18} className="text-[#FF385C]" />
                                        <label className="text-sm font-bold text-[#222222] uppercase tracking-widest">Priorité</label>
                                    </div>

                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                        {urgencyLevels.map((level) => (
                                            <button
                                                key={level.id}
                                                type="button"
                                                onClick={() => setUrgency(level.id)}
                                                className={`p-4 rounded-2xl flex flex-col gap-1 text-left transition-all active:scale-95 border-2 ${urgency === level.id ? 'border-[#222222] bg-[#222222] text-white shadow-lg' : 'border-gray-50 bg-[#F9FAFB]/50 text-gray-600'
                                                    }`}
                                            >
                                                <span className="font-bold">{level.label}</span>
                                                <span className={`text-[10px] font-bold uppercase tracking-wider opacity-70`}>{level.desc}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Summary */}
                                <div className="bg-[#F9FAFB] rounded-3xl p-6 border border-[#EBEBEB]">
                                    <h3 className="text-sm font-bold text-[#222222] uppercase tracking-widest mb-4">Résumé</h3>
                                    <div className="space-y-3 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-[#717171]">Catégorie</span>
                                            <span className="font-bold text-[#222222]">{category}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-[#717171]">Titre</span>
                                            <span className="font-bold text-[#222222]">{titre || `${category} - Maintenance`}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-[#717171]">Priorité</span>
                                            <span className="font-bold text-[#222222]">{urgencyLevels.find(l => l.id === urgency)?.label}</span>
                                        </div>
                                    </div>
                                </div>

                                {localError && (
                                    <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-bold flex items-center gap-3 border border-red-100">
                                        <AlertTriangle size={18} />
                                        {localError}
                                    </div>
                                )}

                                <div className="flex gap-4 pt-4">
                                    <button
                                        onClick={() => setStep(1)}
                                        disabled={loading}
                                        className="flex-1 bg-gray-100 text-[#222222] font-bold py-5 rounded-3xl hover:bg-gray-200 transition-all active:scale-[0.98] disabled:opacity-50"
                                    >
                                        Précédent
                                    </button>
                                    <button
                                        onClick={handleSubmitMaintenance}
                                        disabled={loading}
                                        className="flex-[2] bg-[#FF385C] text-white font-bold py-5 rounded-3xl hover:bg-[#e8152e] transition-all active:scale-[0.98] shadow-xl shadow-[#FF385C]/20 text-lg disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {loading ? <Loader2 className="animate-spin" size={20} /> : null}
                                        Envoyer le signalement
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {step === 3 && (
                            <motion.div
                                key="step3"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="w-full max-w-2xl bg-white rounded-[40px] border border-[#EBEBEB] shadow-2xl p-12 md:p-16 flex flex-col items-center text-center"
                            >
                                <div className="w-32 h-32 bg-[#10B981] rounded-full flex items-center justify-center text-white mb-10 shadow-2xl shadow-[#10B981]/30">
                                    <Check size={64} strokeWidth={3} />
                                </div>
                                <h1 className="text-4xl font-extrabold text-[#222222] mb-4">Signalement reçu !</h1>
                                <p className="text-[#717171] text-lg mb-12 max-w-sm">
                                    Votre demande de maintenance pour <span className="font-bold text-[#222222]">"{category}"</span> a été transmise au propriétaire.
                                </p>

                                <div className="flex flex-col gap-4 w-full">
                                    <button
                                        onClick={() => navigate('/dashboard')}
                                        className="w-full bg-[#222222] text-white font-bold py-5 rounded-3xl hover:bg-black transition-all active:scale-[0.98] shadow-xl shadow-gray-900/10 text-lg"
                                    >
                                        Suivre l'intervention
                                    </button>
                                    <button
                                        onClick={() => {
                                            setActiveTab("history");
                                            setStep(1);
                                            setDescription("");
                                            setTitre("");
                                        }}
                                        className="w-full text-[#717171] font-bold py-4 hover:text-[#222222] transition-colors"
                                    >
                                        Voir mes demandes
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </>
            ) : (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-3xl space-y-6"
                >
                    <h2 className="text-2xl font-extrabold text-[#222222]">Suivi des interventions</h2>

                    {maintenanceRequests.length === 0 ? (
                        <div className="bg-white rounded-[32px] border border-[#EBEBEB] shadow-xl p-12 flex flex-col items-center text-center">
                            <Wrench size={48} className="text-gray-200 mb-4" />
                            <h3 className="text-lg font-bold text-gray-800 mb-2">Aucune demande</h3>
                            <p className="text-gray-500 text-sm">Vous n'avez pas encore soumis de demande de maintenance.</p>
                        </div>
                    ) : (
                        maintenanceRequests.map((req) => {
                            const statutBadge = getStatutBadge(req.statut);
                            const prioriteBadge = getPrioriteBadge(req.priorite);
                            return (
                                <div key={req.id} className="bg-white rounded-[32px] border border-[#EBEBEB] shadow-xl p-8">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="flex items-center gap-4">
                                            <div className="p-4 bg-blue-50 text-blue-500 rounded-2xl">
                                                <Wrench size={24} />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold text-[#222222]">{req.titre}</h3>
                                                <p className="text-sm text-[#717171]">
                                                    {req.bien_adresse && `${req.bien_adresse} · `}
                                                    Signalé le {new Date(req.date_signalement || req.created_at).toLocaleDateString('fr-FR', {
                                                        day: 'numeric',
                                                        month: 'long',
                                                        year: 'numeric'
                                                    })}
                                                </p>
                                            </div>
                                        </div>
                                        <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border ${statutBadge.color}`}>
                                            {statutBadge.label}
                                        </span>
                                    </div>

                                    <p className="text-[#717171] text-sm mb-4 bg-[#F9FAFB] p-4 rounded-2xl">
                                        {req.description}
                                    </p>

                                    <div className="flex items-center justify-between gap-4">
                                        <div className="flex items-center gap-4 text-xs">
                                            <span className={`font-bold ${prioriteBadge.color}`}>⚡ Priorité : {prioriteBadge.label}</span>
                                            {req.cout_estime && (
                                                <span className="text-[#717171]">Coût estimé : {new Intl.NumberFormat('fr-FR').format(req.cout_estime)} FCFA</span>
                                            )}
                                        </div>
                                        {(req.statut === 'APPROUVE' || req.statut === 'EN_COURS') && (
                                            <button
                                                onClick={() => {
                                                    setSelectedMaintenance(req);
                                                    setJustificatifFile(null);
                                                    setJustificatifComment("");
                                                    setShowReceiptModal(true);
                                                }}
                                                className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-xs font-bold text-gray-600 rounded-xl hover:bg-brand-50 hover:text-brand-500 transition-all border border-gray-100"
                                            >
                                                <Camera size={14} /> Envoyer Justificatif
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </motion.div>
            )}

            <div className="mt-12 flex items-center gap-3 p-4 bg-blue-50/50 rounded-2xl border border-blue-100 max-w-lg">
                <Info size={20} className="text-blue-500 flex-shrink-0" />
                <p className="text-xs text-blue-700 leading-relaxed font-medium">
                    Besoin d'aide immédiate ? Contactez le service d'urgence de l'agence Amétô au <span className="font-bold underline">+228 90 00 00 00</span>.
                </p>
            </div>
            <AnimatePresence>
                {showReceiptModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#222222]/60 backdrop-blur-md">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-white w-full max-w-md rounded-[40px] shadow-2xl p-10 relative overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#FF385C] to-[#E22B4C]" />

                            <div className="flex justify-between items-center mb-8">
                                <h3 className="text-2xl font-black text-[#222222] tracking-tight">Justificatif</h3>
                                <button onClick={() => setShowReceiptModal(false)} className="p-2 text-gray-400 hover:text-[#222222] hover:bg-gray-100 rounded-full transition-all active:scale-90"><X size={24} /></button>
                            </div>

                            <p className="text-[#717171] text-sm mb-10 leading-relaxed font-medium">
                                Veuillez uploader la photo des travaux finis ou le reçu du technicien pour validation par le propriétaire.
                            </p>

                            <label className="border-3 border-dashed border-gray-100 rounded-[32px] p-12 flex flex-col items-center justify-center gap-6 bg-[#F9FAFB] hover:bg-gray-50 hover:border-brand-100 transition-all cursor-pointer group mb-6 border-spacing-4">
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => setJustificatifFile(e.target.files?.[0] || null)}
                                />
                                <div className="p-5 bg-white rounded-2xl shadow-lg shadow-gray-200/50 group-hover:scale-110 group-hover:shadow-brand-500/10 transition-all duration-300">
                                    <Camera size={36} className="text-[#FF385C]" />
                                </div>
                                <div className="text-center">
                                    <span className="text-xs font-black text-[#222222] block mb-1">Prendre une photo</span>
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">ou parcourir</span>
                                    {justificatifFile && (
                                        <span className="block mt-3 text-[11px] text-[#222222] font-bold">{justificatifFile.name}</span>
                                    )}
                                </div>
                            </label>

                            <textarea
                                value={justificatifComment}
                                onChange={(e) => setJustificatifComment(e.target.value)}
                                placeholder="Commentaire optionnel pour le propriétaire"
                                rows={3}
                                className="w-full mb-6 bg-[#F9FAFB]/50 border-2 border-gray-50 rounded-2xl px-4 py-3 focus:border-[#FF385C] outline-none text-sm transition-colors resize-none"
                            />

                            <button
                                onClick={async () => {
                                    if (!selectedMaintenance?.id) {
                                        toast.error("Demande de maintenance introuvable.");
                                        return;
                                    }
                                    if (!justificatifFile) {
                                        toast.error("Veuillez sélectionner une photo justificative.");
                                        return;
                                    }

                                    const formData = new FormData();
                                    formData.append('justificatif', justificatifFile);
                                    if (justificatifComment.trim()) {
                                        formData.append('justificatif_commentaire', justificatifComment.trim());
                                    }

                                    const result = await dispatch(sendMaintenanceJustificatif({
                                        id: selectedMaintenance.id,
                                        data: formData,
                                    }));

                                    if (sendMaintenanceJustificatif.fulfilled.match(result)) {
                                        toast.success("Justificatif envoyé au propriétaire.");
                                        setShowReceiptModal(false);
                                        setSelectedMaintenance(null);
                                        setJustificatifFile(null);
                                        setJustificatifComment("");
                                    } else {
                                        const message =
                                            typeof result.payload === 'string'
                                                ? result.payload
                                                : result.payload?.detail || "Erreur lors de l'envoi du justificatif.";
                                        toast.error(message);
                                    }
                                }}
                                className="w-full py-5 bg-[#FF385C] text-white text-sm font-black rounded-2xl shadow-2xl shadow-[#FF385C]/30 hover:bg-[#E22B4C] hover:scale-[1.02] active:scale-95 transition-all duration-300"
                            >
                                CONFIRMER L'ENVOI
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>

    );
}