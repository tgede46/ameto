import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, ArrowRight, Eye, EyeOff, Smartphone, Home, Loader2 } from "lucide-react";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { login } from "../store/userSlice";
import logo from "../assets/logo_ameto.png";

const slides = [
  {
    img: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=80",
    quote: "Amétô m'a permis de trouver mon appartement idéal en 3 jours.",
    author: "Mme. Afi Mensah, Lomé",
  },
  {
    img: "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=1200&q=80",
    quote: "La plateforme la plus transparente et sécurisée du Togo.",
    author: "M. Koffi Agbeko, propriétaire",
  },
];

// Animation variants based on your charter
const fadeUp = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

export default function Login() {
  const [showPass, setShowPass] = useState(false);
  const [slide] = useState(0);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.user);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(login({ username, password }));
    if (login.fulfilled.match(result)) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFFFF] flex flex-col md:flex-row font-sans">

      {/* ── Left Visual Panel (Hero 3D / Brand Identity) ── */}
      <div className="hidden md:flex md:w-[50%] lg:w-[55%] relative overflow-hidden bg-gray-900">
        <motion.img
          key={slide}
          initial={{ scale: 1.05, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          src={slides[slide].img}
          className="absolute inset-0 w-full h-full object-cover opacity-60"
        />

        {/* Gradient overlays for readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900/50 to-transparent" />

        <div className="relative z-10 flex flex-col justify-between p-12 lg:p-16 w-full">
          <Link to="/" className="inline-block hover:scale-[1.02] transition-transform duration-300">
            <img src={logo} alt="ImmoTech" className="h-10 w-auto object-contain brightness-0 invert" />
          </Link>

          <div>
            {/* Badge matching Brand 50 & Brand 500 guidelines */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.4 }}
              className="inline-flex items-center gap-3 bg-[#fff0f1]/10 backdrop-blur-md px-5 py-3 rounded-full mb-8 border border-white/10 shadow-sm"
            >
              <div className="w-10 h-10 bg-[#FF385C] rounded-full flex items-center justify-center shadow-lg shadow-[#FF385C]/30">
                <Home size={18} className="text-white" strokeWidth={2.5} />
              </div>
              <span className="text-white font-semibold text-sm tracking-wide">L'immobilier, repensé.</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="text-4xl lg:text-5xl xl:text-6xl font-extrabold text-white mb-6 leading-[1.15] tracking-tight"
            >
              Simplifiez votre<br />gestion immobilière<br />
              <span className="text-[#FF385C]">au Togo.</span>
            </motion.h1>
          </div>
        </div>
      </div>

      {/* ── Right Form Panel (Clean UI) ── */}
      <div className="flex-1 flex flex-col px-8 py-10 md:px-16 lg:px-24 justify-center bg-[#FFFFFF]">
        <div className="md:hidden mb-12">
          <Link to="/"><img src={logo} alt="ImmoTech" className="h-10 w-auto object-contain" /></Link>
        </div>

        <motion.div 
          className="w-full max-w-[420px] mx-auto"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={fadeUp} className="mb-10">
            <h2 className="text-3xl lg:text-[32px] font-extrabold text-gray-900 mb-3 tracking-tight">Bon retour !</h2>
            <p className="text-[16px] text-gray-500 font-normal">Connectez-vous pour accéder à votre espace.</p>
          </motion.div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium border border-red-100"
              >
                {error}
              </motion.div>
            )}
            
            {/* Username Field */}
            <motion.div variants={fadeUp} className="space-y-2">
              <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest ml-1">
                Nom d'utilisateur
              </label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#FF385C] transition-colors duration-300" size={20} strokeWidth={2} />
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="votre_nom"
                  required
                  className="w-full bg-[#F9FAFB] border border-gray-200 text-gray-900 text-[15px] rounded-2xl pl-12 pr-4 py-4 outline-none transition-all duration-300 focus:bg-white focus:border-[#FF385C] focus:shadow-[0_0_0_4px_rgba(255,56,92,0.1)] placeholder:text-gray-400"
                />
              </div>
            </motion.div>

            {/* Password Field */}
            <motion.div variants={fadeUp} className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest">
                  Mot de passe
                </label>
                <a href="#" className="text-[13px] font-bold text-[#FF385C] hover:text-[#e8152e] transition-colors">
                  Oublié ?
                </a>
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#FF385C] transition-colors duration-300" size={20} strokeWidth={2} />
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-[#F9FAFB] border border-gray-200 text-gray-900 text-[15px] rounded-2xl pl-12 pr-12 py-4 outline-none transition-all duration-300 focus:bg-white focus:border-[#FF385C] focus:shadow-[0_0_0_4px_rgba(255,56,92,0.1)] placeholder:text-gray-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors"
                >
                  {showPass ? <EyeOff size={20} strokeWidth={2} /> : <Eye size={20} strokeWidth={2} />}
                </button>
              </div>
            </motion.div>

            {/* Submit Button */}
            <motion.div variants={fadeUp} className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#FF385C] hover:bg-[#e8152e] text-white rounded-2xl py-4 text-[16px] font-bold transition-all duration-300 active:scale-95 shadow-lg shadow-[#FF385C]/25 disabled:opacity-70 disabled:active:scale-100 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Connexion en cours...
                  </span>
                ) : (
                  <><span>Se connecter</span><ArrowRight size={18} strokeWidth={2.5} /></>
                )}
              </button>
            </motion.div>
          </form>

          {/* Divider */}
          <motion.div variants={fadeUp} className="my-8 flex items-center gap-4">
            <div className="flex-1 h-[1px] bg-gray-200" />
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">ou</span>
            <div className="flex-1 h-[1px] bg-gray-200" />
          </motion.div>

          {/* Social Logins */}
          <motion.div variants={fadeUp} className="space-y-3">
            <button className="w-full flex items-center justify-center gap-3 py-3.5 bg-white border border-gray-200 rounded-2xl font-bold text-gray-900 text-[15px] hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 active:scale-95 shadow-sm">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continuer avec Google
            </button>
            <button className="w-full flex items-center justify-center gap-3 py-3.5 bg-white border border-gray-200 rounded-2xl font-bold text-gray-900 text-[15px] hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 active:scale-95 shadow-sm">
              <Smartphone size={20} className="text-[#10B981]" strokeWidth={2.5} />
              Continuer avec WhatsApp
            </button>
          </motion.div>

          <motion.p variants={fadeUp} className="mt-10 text-center text-gray-500 font-medium text-[15px]">
            Pas encore de compte ?{' '}
            <Link to="/register" className="text-[#FF385C] font-bold hover:text-[#e8152e] hover:underline transition-colors">
              S'inscrire gratuitement
            </Link>
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}