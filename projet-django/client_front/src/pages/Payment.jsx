import { motion, AnimatePresence } from "framer-motion";
import { 
  CreditCard, 
  ArrowLeft, 
  CheckCircle, 
  Smartphone, 
  UploadCloud, 
  FileText, 
  X, 
  Info, 
  ChevronRight,
  ShieldCheck,
  Calendar,
  DollarSign,
  Loader2,
  AlertCircle
} from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { submitPayment } from "../store/userSlice";
import Header from "../components/Header";

export default function Payment() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { loading, error: reduxError, profile } = useSelector((state) => state.user);
  
  // Récupérer les données passées via l'état de navigation ou utiliser des valeurs par défaut
  const initialData = location.state || { amount: 150000, propertyId: 1, propertyTitle: "Mon Foyer" };

  const [step, setStep] = useState(1);
  const [method, setMethod] = useState('MixByYas');
  const [preuve, setPreuve] = useState(null);
  const [amount] = useState(initialData.amount);
  const [localError, setLocalError] = useState(null);

  const paymentMethods = [
    { 
      id: 'MixByYas', 
      label: 'MixByYas', 
      image: "/outils/MixByYas.png", 
      instructions: "Envoyez le montant via MixByYas au numéro : +228 90 00 00 00",
      bg: 'bg-red-50', 
      color: 'text-red-500' 
    },
    { 
      id: 'MoovMoney', 
      label: 'MoovMoney', 
      image: "/outils/MoovMoney.png", 
      instructions: "Composez le *155# et envoyez le montant au numéro : +228 99 00 00 00",
      bg: 'bg-orange-50', 
      color: 'text-orange-500' 
    },
    { 
      id: 'Visa', 
      label: 'Visa', 
      image: "/outils/Visa.png", 
      instructions: "Veuillez effectuer un virement bancaire sur le compte : TG001 01001 000000123456 78",
      bg: 'bg-blue-50', 
      color: 'text-blue-500' 
    },
  ];

  const currentMethod = paymentMethods.find(m => m.id === method) || paymentMethods[0];

  const handlePreuveChange = (e) => {
    const file = e.target.files[0];
    if (file && file.size > 5 * 1024 * 1024) {
      setLocalError("Le fichier est trop volumineux (max 5 Mo).");
      return;
    }
    setPreuve(file);
    setLocalError(null);
  };

  const handleFinalSubmit = async () => {
    if (!preuve) {
      setLocalError("Veuillez uploader une preuve de paiement (screenshot).");
      return;
    }

    const formData = new FormData();
    formData.append('montant', amount);
    formData.append('methode', method);
    formData.append('preuve', preuve);
    formData.append('bien', initialData.propertyId);

    const result = await dispatch(submitPayment(formData));
    if (submitPayment.fulfilled.match(result)) {
      setStep(3);
    } else {
      setLocalError("Une erreur est survenue lors de l'envoi du paiement.");
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB]/50">
      <Header />
      
      <main className="max-w-3xl mx-auto px-6 py-12">
        <button 
            onClick={() => navigate(-1)} 
            className="group flex items-center gap-3 text-[#717171] hover:text-[#222222] font-bold mb-10 transition-all active:scale-95"
        >
            <div className="p-2 bg-white rounded-xl shadow-sm border border-[#EBEBEB] group-hover:shadow-md transition-shadow">
                <ArrowLeft size={18} />
            </div>
            Retour
        </button>

        {/* Stepper */}
        <div className="mb-16 relative">
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
                            {step > s ? <CheckCircle size={20} strokeWidth={3} /> : s}
                        </motion.div>
                        <span className={`text-[10px] font-bold uppercase tracking-widest text-center ${step === s ? 'text-[#222222]' : 'text-[#b0b0b0]'}`}>
                            {s === 1 ? "Méthode" : s === 2 ? "Preuve" : "Terminé"}
                        </span>
                    </div>
                ))}
            </div>
        </div>

        <AnimatePresence mode="wait">
            {step === 1 && (
                <motion.div 
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="bg-white rounded-[40px] border border-[#EBEBEB] shadow-2xl p-8 md:p-12 space-y-10"
                >
                    <div>
                        <h2 className="text-3xl font-extrabold text-[#222222] mb-2">Paiement</h2>
                        <p className="text-[#717171]">Règlement pour : <span className="font-bold text-[#222222]">{initialData.propertyTitle}</span></p>
                    </div>

                    <div className="p-6 bg-[#F9FAFB] rounded-3xl border border-[#EBEBEB] flex justify-between items-center mb-10">
                        <div>
                            <p className="text-[10px] font-bold text-[#b0b0b0] uppercase tracking-widest mb-1">Montant à régler</p>
                            <p className="text-3xl font-extrabold text-[#222222]">{new Intl.NumberFormat('fr-FR').format(amount)} FCFA</p>
                        </div>
                        <div className="p-4 bg-white rounded-2xl shadow-sm">
                            <DollarSign size={24} className="text-[#FF385C]" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {paymentMethods.map((m) => (
                            <button
                                key={m.id}
                                onClick={() => setMethod(m.id)}
                                className={`flex flex-col items-center gap-4 p-5 rounded-[40px] border-2 transition-all active:scale-95 group ${
                                    method === m.id 
                                    ? 'border-[#FF385C] bg-[#fff0f1]/40 shadow-xl shadow-[#FF385C]/10' 
                                    : 'border-gray-50 bg-[#F9FAFB]/50 hover:border-[#EBEBEB] hover:bg-white'
                                }`}
                            >
                                <div className={`w-full aspect-square rounded-[32px] flex items-center justify-center p-6 bg-white shadow-sm group-hover:shadow-md transition-all ${method === m.id ? 'ring-4 ring-[#FF385C]/10 scale-105' : ''}`}>
                                    <img 
                                        src={m.image} 
                                        alt={m.label} 
                                        className="max-h-full max-w-full object-contain transition-transform duration-500 group-hover:scale-110"
                                    />
                                </div>
                                <span className={`text-sm font-black tracking-tight transition-colors ${method === m.id ? 'text-[#FF385C]' : 'text-[#717171] group-hover:text-[#222222]'}`}>
                                    {m.label}
                                </span>
                            </button>
                        ))}
                    </div>

                    <div className="p-6 bg-blue-50/50 border border-blue-100 rounded-3xl flex items-start gap-4">
                        <Info className="text-blue-500 shrink-0 mt-1" size={20} />
                        <div>
                            <p className="text-sm font-bold text-blue-900 mb-1">Instructions de paiement</p>
                            <p className="text-xs text-blue-700 leading-relaxed">
                                {currentMethod.instructions}. Conservez la capture d'écran de la confirmation.
                            </p>
                        </div>
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
                    className="bg-white rounded-[40px] border border-[#EBEBEB] shadow-2xl p-8 md:p-12 space-y-10"
                >
                    <div>
                        <h2 className="text-3xl font-extrabold text-[#222222] mb-2">Preuve de paiement</h2>
                        <p className="text-[#717171]">Téléversez une capture d'écran du reçu de virement.</p>
                    </div>

                    {localError && (
                        <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-bold flex items-center gap-3 border border-red-100">
                            <AlertCircle size={18} />
                            {localError}
                        </div>
                    )}

                    <div className="space-y-4">
                        <label className="text-sm font-bold text-[#222222] uppercase tracking-widest ml-1">Screenshot du reçu</label>
                        <div className="relative group">
                            <input 
                                type="file" 
                                onChange={handlePreuveChange}
                                className="hidden" 
                                id="preuve-upload"
                                accept="image/*"
                            />
                            <label 
                                htmlFor="preuve-upload"
                                className={`border-4 border-dashed rounded-[32px] p-12 flex flex-col items-center justify-center text-center cursor-pointer transition-all active:scale-95 ${
                                    preuve ? 'border-green-500 bg-green-50/30' : 'border-gray-50 bg-[#F9FAFB] hover:border-[#FF385C] hover:bg-[#fff0f1]'
                                }`}
                            >
                                <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mb-6 shadow-sm transition-colors ${
                                    preuve ? 'bg-green-100 text-green-600' : 'bg-white text-[#b0b0b0] group-hover:text-[#FF385C]'
                                }`}>
                                    {preuve ? <CheckCircle size={32} /> : <UploadCloud size={32} />}
                                </div>
                                <p className="text-lg font-bold text-[#222222] mb-1">
                                    {preuve ? preuve.name : "Choisir une image"}
                                </p>
                                <p className="text-sm text-[#b0b0b0] font-medium">Capture d'écran (JPG, PNG)</p>
                            </label>
                        </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button 
                            onClick={() => setStep(1)}
                            disabled={loading}
                            className="flex-1 bg-gray-100 text-[#222222] font-bold py-5 rounded-3xl hover:bg-gray-200 transition-all active:scale-[0.98] disabled:opacity-50"
                        >
                            Précédent
                        </button>
                        <button 
                            onClick={handleFinalSubmit}
                            disabled={loading}
                            className="flex-[2] bg-[#FF385C] text-white font-bold py-5 rounded-3xl hover:bg-[#e8152e] transition-all active:scale-[0.98] shadow-xl shadow-[#FF385C]/20 text-lg disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader2 className="animate-spin" size={20} /> : null}
                            Déclarer le paiement
                        </button>
                    </div>
                </motion.div>
            )}

            {step === 3 && (
                <motion.div 
                    key="step3"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white rounded-[40px] border border-[#EBEBEB] shadow-2xl p-12 md:p-16 flex flex-col items-center text-center"
                >
                    <div className="w-32 h-32 bg-[#10B981] rounded-full flex items-center justify-center text-white mb-10 shadow-2xl shadow-green-500/30">
                        <CheckCircle size={64} strokeWidth={3} />
                    </div>
                    <h2 className="text-4xl font-extrabold text-[#222222] mb-4">Paiement déclaré !</h2>
                    <p className="text-[#717171] text-lg mb-12 max-w-sm">
                        Votre paiement est en cours de validation par l'agence. Vous recevrez une notification dès qu'il sera confirmé.
                    </p>

                    <div className="flex flex-col gap-4 w-full">
                        <button 
                            onClick={() => navigate('/dashboard')}
                            className="w-full bg-[#222222] text-white font-bold py-5 rounded-3xl hover:bg-black transition-all active:scale-[0.98] shadow-xl shadow-gray-900/10 text-lg"
                        >
                            Voir mon historique
                        </button>
                        <button 
                            onClick={() => navigate('/')}
                            className="w-full text-[#717171] font-bold py-4 hover:text-[#222222] transition-colors"
                        >
                            Retour à l'accueil
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
      </main>
    </div>
  );
}
