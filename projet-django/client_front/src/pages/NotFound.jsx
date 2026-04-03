import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Home, ArrowRight, Search } from "lucide-react";
import logo from "../assets/logo_ameto.png";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center font-sans">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        <Link to="/" className="inline-block mb-12">
            <img src={logo} alt="Amétô" className="h-12 w-auto object-contain" />
        </Link>

        <div className="relative mb-12">
            <h1 className="text-[12rem] font-black text-gray-50 leading-none select-none">404</h1>
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-white p-8 rounded-[40px] shadow-2xl border border-[#EBEBEB]">
                    <Search size={64} className="text-[#FF385C] mb-4 mx-auto" strokeWidth={3} />
                    <h2 className="text-2xl font-extrabold text-[#222222]">Page introuvable</h2>
                </div>
            </div>
        </div>

        <p className="text-[#717171] text-lg mb-10 leading-relaxed">
            Oups ! Il semble que le logement ou la page que vous cherchez n'existe pas ou a été déplacé.
        </p>

        <div className="flex flex-col gap-4">
            <Link 
                to="/" 
                className="w-full bg-[#222222] text-white font-bold py-5 rounded-3xl shadow-xl shadow-gray-900/10 flex items-center justify-center gap-3 text-lg hover:bg-black transition-all active:scale-[0.98]"
            >
                <Home size={20} /> Retour à l'accueil
            </Link>
            <button 
                onClick={() => window.history.back()}
                className="w-full text-[#717171] font-bold py-4 hover:text-[#222222] transition-colors"
            >
                Page précédente
            </button>
        </div>
      </motion.div>

      <div className="fixed bottom-10 left-0 right-0 text-xs text-[#b0b0b0] font-bold uppercase tracking-[0.2em]">
        Amétô © 2026 · Système de gestion immobilière
      </div>
    </div>
  );
}
