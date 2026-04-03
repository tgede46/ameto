import { motion, AnimatePresence } from "framer-motion";
import { 
  User, 
  Mail, 
  Phone, 
  Briefcase, 
  FileText, 
  UploadCloud, 
  CheckCircle, 
  AlertCircle,
  ArrowLeft,
  ChevronRight,
  ShieldCheck,
  Calendar,
  Globe,
  Loader2,
  FileCheck
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { submitCandidature, fetchUserCandidatures, updateProfile } from "../store/userSlice";
import Header from "../components/Header";

export default function Dossier() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { profile, candidatures, loading, error } = useSelector((state) => state.user);
  const [activeTab, setActiveTab] = useState('personal');
  const [files, setFiles] = useState({ cni: null, fiche_paie: null });
  const [uploadStatus, setUploadStatus] = useState(null);

  useEffect(() => {
    dispatch(fetchUserCandidatures());
  }, [dispatch]);

  const handleFileChange = (e, type) => {
    setFiles(prev => ({ ...prev, [type]: e.target.files[0] }));
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!files.cni && !files.fiche_paie) {
      setUploadStatus({ type: 'error', message: 'Veuillez sélectionner au moins un document.' });
      return;
    }

    const formData = new FormData();
    if (files.cni) formData.append('cni', files.cni);
    if (files.fiche_paie) formData.append('fiche_paie', files.fiche_paie);

    const result = await dispatch(updateProfile(formData));
    if (updateProfile.fulfilled.match(result)) {
      setUploadStatus({ type: 'success', message: 'Documents enregistrés dans votre profil !' });
      setFiles({ cni: null, fiche_paie: null });
    } else {
      setUploadStatus({ type: 'error', message: 'Erreur lors de l\'enregistrement.' });
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB]/50">
      <Header />
      
      <main className="max-w-5xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row gap-12">
            
            {/* Sidebar Tabs */}
            <aside className="md:w-64 space-y-2">
                <h1 className="text-2xl font-extrabold text-[#222222] mb-8">Mon Dossier</h1>
                {[
                    { id: 'personal', label: 'Infos personnelles', icon: User },
                    { id: 'documents', label: 'Documents', icon: FileText },
                    { id: 'guarantor', label: 'Garant', icon: ShieldCheck },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold transition-all ${
                            activeTab === tab.id 
                            ? 'bg-[#222222] text-white shadow-lg shadow-gray-900/10' 
                            : 'text-[#717171] hover:bg-white hover:text-[#222222]'
                        }`}
                    >
                        <tab.icon size={20} />
                        {tab.label}
                    </button>
                ))}
            </aside>

            {/* Content Area */}
            <div className="flex-1">
                <AnimatePresence mode="wait">
                    {activeTab === 'personal' && (
                        <motion.div 
                            key="personal"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="bg-white rounded-[32px] border border-[#EBEBEB] shadow-xl p-8 md:p-10 space-y-10"
                        >
                            <div className="flex justify-between items-center">
                                <h2 className="text-2xl font-bold text-[#222222]">Informations personnelles</h2>
                                <button className="text-[#FF385C] font-bold hover:underline text-sm">Modifier</button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-[#b0b0b0] uppercase tracking-widest">Nom complet</p>
                                    <p className="font-bold text-[#222222]">{profile?.first_name} {profile?.last_name}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-[#b0b0b0] uppercase tracking-widest">Email</p>
                                    <p className="font-bold text-[#222222]">{profile?.email}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-[#b0b0b0] uppercase tracking-widest">Téléphone</p>
                                    <p className="font-bold text-[#222222]">{profile?.telephone || 'Non renseigné'}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-[#b0b0b0] uppercase tracking-widest">Rôle</p>
                                    <p className="font-bold text-[#222222]">{profile?.role}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-[#b0b0b0] uppercase tracking-widest">Revenus mensuels</p>
                                    <p className="font-bold text-[#222222] text-[#FF385C]">{profile?.revenus ? `${new Intl.NumberFormat('fr-FR').format(profile.revenus)} FCFA` : 'Non renseigné'}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-[#b0b0b0] uppercase tracking-widest">Nationalité</p>
                                    <p className="font-bold text-[#222222]">{profile?.nationalite || 'Togolaise'}</p>
                                </div>
                            </div>

                            <div className="p-6 bg-blue-50/50 border border-blue-100 rounded-3xl flex items-start gap-4">
                                <ShieldCheck className="text-blue-500 shrink-0" size={24} />
                                <p className="text-sm text-blue-700 leading-relaxed">
                                    Vos informations sont protégées par le chiffrement AES-256 et ne sont partagées qu'avec les propriétaires des biens pour lesquels vous postulez.
                                </p>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'documents' && (
                        <motion.div 
                            key="documents"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6"
                        >
                            <div className="bg-white rounded-[32px] border border-[#EBEBEB] shadow-xl p-8 md:p-10">
                                <h2 className="text-2xl font-bold text-[#222222] mb-8">Mes justificatifs</h2>
                                
                                <form onSubmit={handleUpload} className="space-y-6">
                                    {uploadStatus && (
                                        <div className={`p-4 rounded-2xl text-sm font-bold flex items-center gap-3 ${
                                            uploadStatus.type === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                                        }`}>
                                            {uploadStatus.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                                            {uploadStatus.message}
                                        </div>
                                    )}

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* CNI Upload */}
                                        <div className="space-y-3">
                                            <label className="block text-[11px] font-bold text-[#b0b0b0] uppercase tracking-widest ml-1">Pièce d'identité (CNI / Passeport)</label>
                                            <div className="relative group">
                                                <input 
                                                    type="file" 
                                                    onChange={(e) => handleFileChange(e, 'cni')}
                                                    className="hidden" 
                                                    id="cni-upload"
                                                    accept="image/*,.pdf"
                                                />
                                                <label 
                                                    htmlFor="cni-upload"
                                                    className={`flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-[24px] cursor-pointer transition-all ${
                                                        files.cni ? 'border-green-500 bg-green-50/30' : 'border-[#EBEBEB] hover:border-[#FF385C] hover:bg-[#F9FAFB]'
                                                    }`}
                                                >
                                                    {files.cni ? (
                                                        <>
                                                            <FileCheck size={32} className="text-green-500 mb-2" />
                                                            <p className="text-xs font-bold text-green-600 truncate max-w-full px-4">{files.cni.name}</p>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <UploadCloud size={32} className="text-[#b0b0b0] mb-2 group-hover:text-[#FF385C]" />
                                                            <p className="text-xs font-bold text-[#717171]">Cliquez pour téléverser</p>
                                                        </>
                                                    )}
                                                </label>
                                            </div>
                                        </div>

                                        {/* Fiche de Paie Upload */}
                                        <div className="space-y-3">
                                            <label className="block text-[11px] font-bold text-[#b0b0b0] uppercase tracking-widest ml-1">Fiches de paie (3 derniers mois)</label>
                                            <div className="relative group">
                                                <input 
                                                    type="file" 
                                                    onChange={(e) => handleFileChange(e, 'fiche_paie')}
                                                    className="hidden" 
                                                    id="paie-upload"
                                                    accept="image/*,.pdf"
                                                />
                                                <label 
                                                    htmlFor="paie-upload"
                                                    className={`flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-[24px] cursor-pointer transition-all ${
                                                        files.fiche_paie ? 'border-green-500 bg-green-50/30' : 'border-[#EBEBEB] hover:border-[#FF385C] hover:bg-[#F9FAFB]'
                                                    }`}
                                                >
                                                    {files.fiche_paie ? (
                                                        <>
                                                            <FileCheck size={32} className="text-green-500 mb-2" />
                                                            <p className="text-xs font-bold text-green-600 truncate max-w-full px-4">{files.fiche_paie.name}</p>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <UploadCloud size={32} className="text-[#b0b0b0] mb-2 group-hover:text-[#FF385C]" />
                                                            <p className="text-xs font-bold text-[#717171]">Cliquez pour téléverser</p>
                                                        </>
                                                    )}
                                                </label>
                                            </div>
                                        </div>
                                    </div>

                                    <button 
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-[#222222] text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-black transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {loading ? <Loader2 className="animate-spin" size={20} /> : <UploadCloud size={20} />}
                                        Mettre à jour mes documents
                                    </button>
                                </form>

                                <div className="mt-12 space-y-4">
                                    <h3 className="text-lg font-bold text-[#222222]">Mes candidatures en cours</h3>
                                    {candidatures.length === 0 ? (
                                        <p className="text-sm text-[#717171]">Aucune candidature envoyée pour le moment.</p>
                                    ) : (
                                        candidatures.map((cand) => (
                                            <div key={cand.id} className="flex items-center justify-between p-5 bg-[#F9FAFB] rounded-2xl border border-[#EBEBEB]">
                                                <div className="flex items-center gap-4">
                                                    <div className={`p-2 rounded-xl ${
                                                        cand.statut === 'ACCEPTE' ? 'bg-green-100 text-green-600' :
                                                        cand.statut === 'REFUSE' ? 'bg-red-100 text-red-600' :
                                                        'bg-orange-100 text-orange-600'
                                                    }`}>
                                                        {cand.statut === 'ACCEPTE' ? <CheckCircle size={18} /> :
                                                         cand.statut === 'REFUSE' ? <AlertCircle size={18} /> :
                                                         <Loader2 className="animate-spin" size={18} />}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-[#222222]">Candidature #{cand.id}</p>
                                                        <p className="text-[10px] font-bold text-[#b0b0b0] uppercase tracking-widest">{cand.statut}</p>
                                                    </div>
                                                </div>
                                                <p className="text-[11px] font-bold text-[#717171]">{new Date(cand.date_creation).toLocaleDateString()}</p>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            <div className="bg-[#222222] rounded-[32px] p-8 md:p-10 text-white relative overflow-hidden group">
                                <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000"></div>
                                <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                                    <div className="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center shrink-0">
                                        <UploadCloud size={40} />
                                    </div>
                                    <div className="flex-1 text-center md:text-left">
                                        <h3 className="text-xl font-bold mb-2">Dépôt rapide par QR Code</h3>
                                        <p className="text-[#b0b0b0] text-sm">Scannez vos documents avec votre téléphone pour les ajouter instantanément.</p>
                                    </div>
                                    <button className="bg-white text-[#222222] font-bold px-8 py-4 rounded-2xl hover:bg-[#F9FAFB] transition-all active:scale-95">
                                        Générer QR
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'guarantor' && (
                        <motion.div 
                            key="guarantor"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="bg-white rounded-[32px] border border-[#EBEBEB] shadow-xl p-8 md:p-10 space-y-10"
                        >
                            <div className="flex justify-between items-center">
                                <h2 className="text-2xl font-bold text-[#222222]">Informations du Garant</h2>
                                <button className="text-[#FF385C] font-bold hover:underline text-sm">Modifier</button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-[#b0b0b0] uppercase tracking-widest">Nom complet</p>
                                    <p className="font-bold text-[#222222]">{profile?.garant?.nom || 'Non renseigné'}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-[#b0b0b0] uppercase tracking-widest">Lien de parenté</p>
                                    <p className="font-bold text-[#222222]">{profile?.garant?.lien || 'Non renseigné'}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-[#b0b0b0] uppercase tracking-widest">Téléphone</p>
                                    <p className="font-bold text-[#222222]">{profile?.garant?.telephone || 'Non renseigné'}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-[#b0b0b0] uppercase tracking-widest">Email</p>
                                    <p className="font-bold text-[#222222]">{profile?.garant?.email || 'Non renseigné'}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-[#b0b0b0] uppercase tracking-widest">Profession</p>
                                    <p className="font-bold text-[#222222]">{profile?.garant?.profession || 'Non renseigné'}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-[#b0b0b0] uppercase tracking-widest">Revenus mensuels</p>
                                    <p className="font-bold text-[#FF385C]">{profile?.garant?.revenus ? `${new Intl.NumberFormat('fr-FR').format(profile.garant.revenus)} FCFA` : 'Non renseigné'}</p>
                                </div>
                            </div>

                            <div className="border-t border-[#EBEBEB] pt-8">
                                <h3 className="text-lg font-bold text-[#222222] mb-4">Pièces justificatives du garant</h3>
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-[#F9FAFB]/50 rounded-2xl border border-gray-50 hover:bg-[#F9FAFB] transition-colors group mb-4">
                                    <div className="flex items-center gap-4 mb-3 sm:mb-0">
                                        <div className="p-3 rounded-xl shadow-sm bg-green-100 text-[#10B981]">
                                            <CheckCircle size={20} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-[#222222] text-sm">Pièce d'identité (CNI / Passeport)</p>
                                            <p className="text-[10px] font-bold text-[#b0b0b0] uppercase tracking-widest">Dernière mise à jour: 12/03/2026</p>
                                        </div>
                                    </div>
                                    <button className="bg-white text-[#222222] border border-[#EBEBEB] hover:bg-[#F9FAFB] px-5 py-2 rounded-xl text-xs font-bold transition-all">
                                        Remplacer
                                    </button>
                                </div>
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-[#F9FAFB]/50 rounded-2xl border border-gray-50 hover:bg-[#F9FAFB] transition-colors group">
                                    <div className="flex items-center gap-4 mb-3 sm:mb-0">
                                        <div className="p-3 rounded-xl shadow-sm bg-red-100 text-red-600">
                                            <AlertCircle size={20} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-[#222222] text-sm">Fiches de paie (3 derniers mois)</p>
                                            <p className="text-[10px] font-bold text-[#b0b0b0] uppercase tracking-widest">Dernière mise à jour: -</p>
                                        </div>
                                    </div>
                                    <button className="bg-[#FF385C] text-white shadow-lg shadow-[#FF385C]/20 hover:bg-[#e8152e] px-5 py-2 rounded-xl text-xs font-bold transition-all">
                                        Téléverser
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
      </main>
    </div>
  );
}
