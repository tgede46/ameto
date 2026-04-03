import { Home, ChevronRight, UploadCloud, AlertTriangle, ArrowLeft, Check, Wrench, Zap, Lock, Info, Camera, PenTool as Tool } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Maintenance() {
  const navigate = useNavigate();
  const [urgency, setUrgency] = useState("Urgent");
  const [step, setStep] = useState(1);
  const [category, setCategory] = useState("Plomberie");

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

  const urgencyLevels = [
    { id: "Normal", color: "bg-gray-100 text-gray-600", active: "bg-[#222222] text-white", desc: "Sous 48h" },
    { id: "Urgent", color: "bg-orange-50 text-orange-600", active: "bg-[#E9A319] text-white", desc: "Sous 24h" },
    { id: "Critique", color: "bg-red-50 text-red-600", active: "bg-red-600 text-white", desc: "Immédiat" }
  ];

  const [activeTab, setActiveTab] = useState("new");
  const [showReceiptModal, setShowReceiptModal] = useState(false);

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
            <span>Appartement 4B</span>
            <ChevronRight size={14} className="text-gray-300" />
            <span className="text-[#717171] font-medium">Résidence Les Palmiers</span>
            <ChevronRight size={14} className="text-gray-300" />
            <span className="text-[#717171] font-medium">Lomé, Togo</span>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="w-full max-w-3xl flex bg-[#F9FAFB] p-1.5 rounded-2xl mb-12 shadow-inner border border-[#EBEBEB]">
          <button
              onClick={() => setActiveTab("new")}
              className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${
                  activeTab === "new" ? "bg-white text-[#222222] shadow-sm" : "text-[#717171] hover:text-[#222222]"
              }`}
          >
              Nouveau signalement
          </button>
          <button
              onClick={() => setActiveTab("history")}
              className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${
                  activeTab === "history" ? "bg-white text-[#222222] shadow-sm" : "text-[#717171] hover:text-[#222222]"
              }`}
          >
              Mes demandes en cours (1)
          </button>
      </div>

      {activeTab === "new" ? (
        <>
          {/* Stepper - Modern Airbnb Style */}
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
                            {s === 1 ? "Détails" : s === 2 ? "Photos" : "Terminé"}
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
                                className={`flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition-all active:scale-95 ${
                                    category === cat.id 
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
                        <label className="text-sm font-bold text-[#222222] uppercase tracking-widest ml-1">Description détaillée</label>
                        <textarea 
                            rows={6} 
                            placeholder="Ex: Le robinet de la cuisine fuit abondamment depuis ce matin..." 
                            className="w-full bg-[#F9FAFB]/50 border-2 border-gray-50 rounded-3xl px-6 py-5 focus:border-[#FF385C] outline-none text-base transition-colors resize-none shadow-inner"
                        ></textarea>
                    </div>

                    <button 
                        onClick={() => setStep(2)}
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
                        <h1 className="text-3xl font-extrabold text-[#222222] mb-2">Ajoutez des preuves</h1>
                        <p className="text-[#717171]">Les photos aident le propriétaire à comprendre l'urgence.</p>
                    </div>

                    <div className="space-y-4">
                        <label className="text-sm font-bold text-[#222222] uppercase tracking-widest ml-1">Photos de l'incident</label>
                        <div className="border-4 border-dashed border-gray-50 rounded-[32px] p-12 flex flex-col items-center justify-center text-center hover:bg-[#F9FAFB] hover:border-[#FF385C] cursor-pointer transition-all group active:scale-95">
                            <div className="w-20 h-20 bg-[#F9FAFB] rounded-3xl flex items-center justify-center mb-6 group-hover:bg-[#fff0f1] transition-colors shadow-sm">
                                <Camera size={32} className="text-[#b0b0b0] group-hover:text-[#FF385C] transition-colors" />
                            </div>
                            <p className="text-lg font-bold text-[#222222] mb-1">Prendre ou choisir des photos</p>
                            <p className="text-sm text-[#b0b0b0] font-medium">Jusqu'à 5 photos haute définition</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-center gap-2 ml-1">
                            <AlertTriangle size={18} className="text-[#FF385C]" />
                            <label className="text-sm font-bold text-[#222222] uppercase tracking-widest">Niveau d'urgence</label>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {urgencyLevels.map((level) => (
                                <button
                                    key={level.id}
                                    type="button"
                                    onClick={() => setUrgency(level.id)}
                                    className={`p-4 rounded-2xl flex flex-col gap-1 text-left transition-all active:scale-95 border-2 ${
                                        urgency === level.id ? 'border-[#222222] bg-[#222222] text-white shadow-lg' : 'border-gray-50 bg-[#F9FAFB]/50 text-gray-600'
                                    }`}
                                >
                                    <span className="font-bold">{level.id}</span>
                                    <span className={`text-[10px] font-bold uppercase tracking-wider opacity-70`}>{level.desc}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button 
                            onClick={() => setStep(1)}
                            className="flex-1 bg-gray-100 text-[#222222] font-bold py-5 rounded-3xl hover:bg-gray-200 transition-all active:scale-[0.98]"
                        >
                            Précédent
                        </button>
                        <button 
                            onClick={() => setStep(3)}
                            className="flex-[2] bg-[#FF385C] text-white font-bold py-5 rounded-3xl hover:bg-[#e8152e] transition-all active:scale-[0.98] shadow-xl shadow-[#FF385C]/20 text-lg"
                        >
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
                            onClick={() => setActiveTab("history")}
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
            
            {/* Ticket Card */}
            <div className="bg-white rounded-[32px] border border-[#EBEBEB] shadow-xl p-8">
                <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-4">
                        <div className="p-4 bg-blue-50 text-blue-500 rounded-2xl">
                            <Wrench size={24} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-[#222222]">Fuite douche (Plomberie)</h3>
                            <p className="text-sm text-[#717171]">Signalé le 15 Mars 2026</p>
                        </div>
                    </div>
                    <span className="px-4 py-1.5 bg-[#10B981]/10 text-[#10B981] rounded-full text-xs font-bold uppercase tracking-widest border border-[#10B981]/20">
                        Terminé
                    </span>
                </div>
                
                <p className="text-[#717171] text-sm mb-8 bg-[#F9FAFB] p-4 rounded-2xl">
                    Le plombier est intervenu ce matin. Veuillez fournir les photos après travaux et la facture pour le remboursement.
                </p>

                <button 
                    onClick={() => setShowReceiptModal(true)}
                    className="w-full bg-[#FF385C] text-white font-bold py-4 rounded-2xl hover:bg-[#e8152e] transition-all active:scale-[0.98] shadow-lg shadow-[#FF385C]/20"
                >
                    Clôturer & Demander remboursement
                </button>
            </div>
        </motion.div>
      )}

      {/* Receipt & Photo Modal */}
      <AnimatePresence>
        {showReceiptModal && (
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 z-[150] flex items-center justify-center p-4 backdrop-blur-sm"
                onClick={() => setShowReceiptModal(false)}
            >
                <motion.div 
                    initial={{ scale: 0.95, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.95, y: 20 }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-white w-full max-w-lg rounded-[32px] overflow-hidden shadow-2xl p-8"
                >
                    <h3 className="text-2xl font-bold text-[#222222] mb-6">Finaliser l'intervention</h3>
                    
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-[#222222] uppercase tracking-widest">Montant de la facture (FCFA)</label>
                            <input 
                                type="number" 
                                placeholder="Ex: 50000"
                                className="w-full bg-[#F9FAFB] border border-[#EBEBEB] rounded-2xl px-5 py-4 focus:border-[#FF385C] outline-none transition-colors"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-[#222222] uppercase tracking-widest">Photos après travaux & Facture</label>
                            <div className="border-2 border-dashed border-[#EBEBEB] rounded-2xl p-8 flex flex-col items-center justify-center text-center hover:bg-[#F9FAFB] cursor-pointer transition-colors">
                                <UploadCloud size={28} className="text-[#b0b0b0] mb-3" />
                                <p className="text-sm font-bold text-[#222222]">Téléverser les fichiers</p>
                            </div>
                        </div>

                        <button 
                            onClick={() => {
                                setShowReceiptModal(false);
                                alert("Demande de remboursement envoyée au propriétaire !");
                            }}
                            className="w-full bg-[#222222] text-white font-bold py-4 rounded-2xl hover:bg-black transition-all active:scale-[0.98]"
                        >
                            Envoyer au propriétaire
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-12 flex items-center gap-3 p-4 bg-blue-50/50 rounded-2xl border border-blue-100 max-w-lg">
          <Info size={20} className="text-blue-500 flex-shrink-0" />
          <p className="text-xs text-blue-700 leading-relaxed font-medium">
              Besoin d'aide immédiate ? Contactez le service d'urgence de l'agence Amétô au <span className="font-bold underline">+228 90 00 00 00</span>.
          </p>
      </div>
    </div>
  );
}
                 