import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { Heart, ArrowLeft, Star, Search, Trash2 } from "lucide-react";
import Header from "../components/Header";
import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";

export default function Favorites() {
  const { profile } = useSelector((state) => state.user);
  const [favorites, setFavorites] = useState(profile?.favorites || []);

  useEffect(() => {
    if (profile?.favorites) {
      setFavorites(profile.favorites);
    }
  }, [profile]);

  const remove = (id) => {
    // Ici on devrait appeler une action Redux pour mettre à jour le backend
    setFavorites(prev => prev.filter(f => f.id !== id));
  };
  
  const clearAll = () => setFavorites([]);

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="max-w-[1400px] mx-auto px-6 py-12">
        {/* Header row */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-10">
          <div>
            <Link to="/" className="flex items-center gap-2 text-sm font-semibold text-[#b0b0b0] hover:text-[#222222] transition-colors mb-3">
              <ArrowLeft size={16} /> Retour aux recherches
            </Link>
            <h1 className="text-3xl font-extrabold text-[#222222] tracking-tight">
              Mes Favoris
              <span className="ml-3 text-lg font-bold text-gray-300">({favorites.length})</span>
            </h1>
          </div>
          {favorites.length > 0 && (
            <button
              onClick={clearAll}
              className="flex items-center gap-2 text-sm font-semibold text-red-400 hover:text-red-600 hover:bg-red-50 px-4 py-2 rounded-xl transition-all"
            >
              <Trash2 size={15} /> Tout supprimer
            </button>
          )}
        </div>

        {favorites.length > 0 ? (
          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10"
          >
            <AnimatePresence>
              {favorites.map((property) => (
                <motion.div
                  key={property.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.2 } }}
                  className="property-card relative"
                >
                  <Link to={`/property/${property.id}`} className="flex flex-col gap-3 block">
                    {/* Image */}
                    <div className="card-image">
                      <img src={property.image} alt={property.title} />
                      {/* Saved badge */}
                      <div className="absolute top-3 left-3 z-10 glass px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-[#222222]">
                        Enregistré
                      </div>
                      {/* Remove button */}
                      <button
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); remove(property.id); }}
                        className="absolute top-3 right-3 z-10 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-sm hover:bg-white transition-all active:scale-90"
                      >
                        <Heart size={20} className="fill-[#FF385C] text-[#FF385C]" />
                      </button>
                    </div>

                    {/* Info */}
                    <div className="flex flex-col gap-1 px-0.5">
                      <div className="flex justify-between items-start">
                        <div className="min-w-0">
                          <p className="font-semibold text-[#222222] text-[15px] truncate">{property.location}</p>
                          <p className="text-[#717171] text-[14px] truncate">{property.title}</p>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                          <Star size={13} className="star" />
                          <span className="text-sm font-semibold">{property.rating}</span>
                        </div>
                      </div>
                      <p className="mt-1 text-[#222222] font-semibold text-[15px]">
                        {property.price} FCFA{' '}
                        <span className="font-normal text-[#717171]">{property.period}</span>
                      </p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-36 text-center"
          >
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 2.5 }}
              className="w-24 h-24 bg-[#fff0f1] rounded-full flex items-center justify-center mb-6"
            >
              <Heart size={40} className="text-brand-300" />
            </motion.div>
            <h2 className="text-2xl font-bold text-[#222222] mb-3">Aucun favori pour le moment</h2>
            <p className="text-[#b0b0b0] max-w-xs mb-8 leading-relaxed">
              Explorez les annonces et cliquez sur le cœur pour enregistrer les biens qui vous intéressent.
            </p>
            <Link to="/" className="btn-secondary px-8 py-4 inline-flex items-center gap-2">
              <Search size={18} /> Découvrir les logements
            </Link>
          </motion.div>
        )}
      </main>
    </div>
  );
}
