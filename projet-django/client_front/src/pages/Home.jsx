import Header from "../components/Header";
import CategoryBar from "../components/CategoryBar";
import { Link } from "react-router-dom";
import { Star, Map, List, Heart, ChevronLeft, ChevronRight, TrendingUp, Building2, Shield, Headphones, ArrowRight, MapPin, Search, SlidersHorizontal, Loader2 } from "lucide-react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { useState, useRef, useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProperties } from "../store/propertySlice";

/* ─────────────────────────────
   STATUS STYLE HELPER
───────────────────────────── */
const getStatusStyle = (status) => {
  switch (status) {
    case 'DISPONIBLE': return 'status-badge status-available';
    case 'RESERVE': return 'status-badge status-reserved';
    case 'VENDU': return 'status-badge status-sold';
    case 'LOUE': return 'status-badge status-rented';
    default: return 'status-badge bg-gray-100 text-gray-600';
  }
};

/* ─────────────────────────────
   PROPERTY CARD with 3D tilt + image carousel
───────────────────────────── */
function PropertyCard({ property, isFav, onToggleFav }) {
  const [imgIdx, setImgIdx] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const cardRef = useRef(null);

  const images = property.photos?.length > 0 
    ? property.photos.map(p => `http://localhost:8000${p.image}`) 
    : ["/outils/M1.png"];

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-0.5, 0.5], [12, -12]);
  const rotateY = useTransform(x, [-0.5, 0.5], [-12, 12]);

  const handleMouseMove = useCallback((e) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  }, [x, y]);

  const handleMouseLeave = () => {
    x.set(0); y.set(0); setIsHovering(false);
  };

  const nextImg = (e) => {
    e.preventDefault(); e.stopPropagation();
    setImgIdx(i => (i + 1) % images.length);
  };
  const prevImg = (e) => {
    e.preventDefault(); e.stopPropagation();
    setImgIdx(i => (i - 1 + images.length) % images.length);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR').format(price) + ' CFA';
  };

  return (
    <Link to={`/property/${property.id}`} className="block group">
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onMouseEnter={() => setIsHovering(true)}
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className="relative bg-white rounded-[32px] overflow-hidden border border-gray-100/80 shadow-sm hover:shadow-2xl transition-all duration-500 ease-out"
      >
        {/* ── Image Carousel ── */}
        <div className="relative aspect-[11/10] overflow-hidden bg-gray-100">
          <AnimatePresence initial={false} custom={imgIdx}>
            <motion.img
              key={imgIdx}
              src={images[imgIdx]}
              className="absolute inset-0 w-full h-full object-cover"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            />
          </AnimatePresence>

          {/* Badges Overlay */}
          <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-10">
            <span className={getStatusStyle(property.statut)}>
              {property.statut}
            </span>
            <button
              onClick={(e) => { e.preventDefault(); onToggleFav(property.id); }}
              className={`p-2.5 rounded-full backdrop-blur-md transition-all duration-300 ${isFav ? 'bg-[#FF385C] text-white' : 'bg-white/70 text-gray-900 hover:bg-white'}`}
            >
              <Heart size={18} fill={isFav ? "currentColor" : "none"} strokeWidth={2.5} />
            </button>
          </div>

          {/* Carousel Nav */}
          {images.length > 1 && isHovering && (
            <div className="absolute inset-0 flex items-center justify-between px-3 pointer-events-none">
              <button
                onClick={(e) => { e.preventDefault(); setImgIdx(prev => (prev === 0 ? images.length - 1 : prev - 1)); }}
                className="p-1.5 rounded-full bg-white/90 shadow-lg pointer-events-auto hover:scale-110 transition-transform"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={(e) => { e.preventDefault(); setImgIdx(prev => (prev === images.length - 1 ? 0 : prev + 1)); }}
                className="p-1.5 rounded-full bg-white/90 shadow-lg pointer-events-auto hover:scale-110 transition-transform"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}

          {/* Dots Indicator */}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 px-2 py-1 rounded-full bg-black/10 backdrop-blur-sm">
              {images.map((_, i) => (
                <div key={i} className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${i === imgIdx ? 'bg-white scale-125' : 'bg-white/50'}`} />
              ))}
            </div>
          )}
        </div>

        {/* ── Content ── */}
        <div className="p-5">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-bold text-gray-900 text-lg truncate group-hover:text-[#FF385C] transition-colors">
              {property.titre}
            </h3>
            <div className="flex items-center gap-1 shrink-0 bg-gray-50 px-2 py-1 rounded-lg">
              <Star size={14} className="text-yellow-400 fill-yellow-400" />
              <span className="text-sm font-bold text-gray-700">4.8</span>
            </div>
          </div>

          <p className="text-gray-500 text-sm flex items-center gap-1.5 mb-4">
            <MapPin size={14} className="text-gray-400" />
            {property.quartier}, {property.ville}
          </p>

          <div className="flex items-center gap-4 mb-4 text-gray-500 text-xs font-medium">
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
              {property.chambres} ch.
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
              {property.superficie} m²
            </div>
          </div>

          <div className="pt-4 border-t border-gray-50 flex justify-between items-center">
            <div className="flex flex-col">
              <span className="text-2xl font-black text-gray-900 leading-none">
                {formatPrice(property.prix)}
              </span>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                {property.type_bien}
              </span>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-[#FF385C] group-hover:text-white transition-all duration-300">
              <ArrowRight size={20} />
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}

/* ─────────────────────────────
   HOME PAGE
───────────────────────────── */
export default function Home() {
  const [view, setView] = useState('grid'); // 'grid' or 'map'
  const [activeFilter, setActiveFilter] = useState('all');
  const [favorites, setFavorites] = useState([]);
  const [searchQuartier, setSearchQuartier] = useState('');
  const [priceRange, setPriceRange] = useState([0, 5000000]);
  
  const dispatch = useDispatch();
  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR').format(price) + ' CFA';
  };

  const properties = useSelector(state => state.properties.list) || [];
  const loading = useSelector(state => state.properties.loading);
  const error = useSelector(state => state.properties.error);

  const filtered = properties || [];

  if (error) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="flex flex-col items-center justify-center py-20 px-6">
          <div className="bg-red-50 text-red-600 p-6 rounded-[32px] border border-red-100 max-w-md text-center">
            <AlertCircle size={48} className="mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Oups ! Une erreur est survenue</h2>
            <p className="text-sm opacity-80 mb-6">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="btn-primary w-full"
            >
              Réessayer
            </button>
          </div>
        </div>
      </div>
    );
  }

  const stats = [
    {
      value: "5 000+",
      label: "Biens disponibles",
      image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=400",
    },
    {
      value: "10 000+",
      label: "Utilisateurs actifs",
      image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=400",
    },
    {
      value: "98%",
      label: "Clients satisfaits",
      image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=400",
    },
    {
      value: "24/7",
      label: "Support client",
      image: "https://images.unsplash.com/photo-1556912167-f556f1f39fdf?auto=format&fit=crop&q=80&w=400",
    },
  ];

  const duplicatedStats = [...stats, ...stats, ...stats];

  useEffect(() => {
    const filters = {};
    if (activeFilter !== 'all') filters.type_bien = activeFilter;
    if (searchQuartier) filters.quartier = searchQuartier;
    if (priceRange[0] > 0) filters.min_price = priceRange[0];
    if (priceRange[1] < 5000000) filters.max_price = priceRange[1];
    
    dispatch(fetchProperties(filters));
  }, [dispatch, activeFilter, searchQuartier, priceRange]);

  const toggleFav = (id) => {
    setFavorites(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* ── Hero Video Section ── */}
      <section className="relative w-full h-[65vh] md:h-[80vh] overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/outils/video2.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"></div>

        <div className="absolute inset-0 flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center max-w-3xl glass-dark rounded-[40px] p-8 md:p-14 shadow-2xl"
          >
            <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 leading-tight drop-shadow-lg">
              Une nouvelle vision <br />
              <span className="text-brand-400">de l'immobilier</span>
            </h1>
            <p className="text-lg text-gray-200 mb-8 max-w-xl mx-auto drop-shadow-md">
              Découvrez des lieux uniques au Togo. Transactions fluides, visites immersives et transparence absolue.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/register" className="btn-primary py-4 px-8 text-lg rounded-2xl shadow-[0_0_30px_rgba(255,56,92,0.4)] hover:shadow-[0_0_40px_rgba(255,56,92,0.6)] border border-brand-400/50">
                Explorer
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <main className="max-w-[1400px] mx-auto px-6 relative">

        {/* ── Search & Filter Bar ──
        <div className="flex flex-col md:flex-row items-center gap-4 bg-white p-4 rounded-3xl shadow-xl border border-gray-100 -mt-12 relative z-50 mb-8 max-w-4xl mx-auto">
          <div className="flex-1 flex items-center gap-3 px-4 border-r border-gray-100">
            <Search size={20} className="text-[#FF385C]" />
            <input 
              type="text" 
              placeholder="Rechercher par quartier (ex: Tokoin, Agoè...)"
              className="w-full py-2 outline-none text-gray-700 font-medium"
              value={searchQuartier}
              onChange={(e) => setSearchQuartier(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3 px-4">
            <SlidersHorizontal size={20} className="text-gray-400" />
            <span className="text-gray-700 font-semibold whitespace-nowrap">Max: {formatPrice(priceRange[1])}</span>
            <input 
              type="range" 
              min="0" 
              max="5000000" 
              step="50000"
              value={priceRange[1]}
              onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
              className="accent-[#FF385C] w-32"
            />
          </div>
        </div> */}

        {/* ── Category Bar (Sticky) ── */}
        <div className="sticky top-[80px] z-40 w-full backdrop-blur-xl flex justify-center mb-4">
          <CategoryBar onFilterChange={setActiveFilter} />
        </div>

        {/* ── Title row ── */}
        <div className="flex justify-between items-center py-8">
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xl font-bold text-gray-900"
          >
            {loading ? 'Chargement...' : `${filtered.length} logements disponibles`}
          </motion.h2>

          <div className="flex items-center gap-3">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setView(view === 'grid' ? 'list' : 'grid')}
              className="btn-outline text-sm py-2 px-4"
            >
              {view === 'grid' ? <><List size={16} /> Liste</> : <><Map size={16} /> Grille</>}
            </motion.button>
          </div>
        </div>

        {/* ── Properties Grid or Map ── */}
        <AnimatePresence mode="wait">
          {view === 'grid' ? (
            <motion.div
              key="grid"
              variants={{ hidden: {}, show: { transition: { staggerChildren: 0.07 } } }}
              initial="hidden"
              animate="show"
              exit={{ opacity: 0, y: 20 }}
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10 pb-20"
            >
              {filtered.map((property, index) => (
                <motion.div
                  key={property.id}
                  variants={{
                    hidden: { opacity: 0, y: 24 },
                    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] } }
                  }}
                >
                  <PropertyCard
                    property={property}
                    isFav={favorites.includes(property.id)}
                    onToggleFav={toggleFav}
                  />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="map"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4 }}
              className="w-full h-[600px] mb-20 rounded-[32px] overflow-hidden shadow-2xl border border-gray-100 relative z-0"
            >
              <MapContainer
                center={[6.1366, 1.2222]} // Lomé coordinates
                zoom={12}
                scrollWheelZoom={true}
                className="w-full h-full z-0"
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                />

                {filtered.map(property => {
                  // Generate spread coordinates around Lomé for demo
                  const lat = 6.1366 + (Math.random() - 0.5) * 0.05;
                  const lng = 1.2222 + (Math.random() - 0.5) * 0.05;

                  const customIcon = L.divIcon({
                    className: 'custom-div-icon',
                    html: `<div style="background-color: white; border: 2px solid #FF385C; color: #111; font-weight: bold; border-radius: 20px; padding: 4px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); font-size: 13px; cursor: pointer; white-space: nowrap;">${formatPrice(property.prix)}</div>`,
                    iconSize: [100, 40],
                    iconAnchor: [50, 20]
                  });

                  return (
                    <Marker key={property.id} position={[lat, lng]} icon={customIcon}>
                      <Popup className="premium-popup !p-0 !rounded-3xl overflow-hidden">
                        <Link to={`/property/${property.id}`} className="block w-64">
                          <img 
                            src={property.photos?.length > 0 ? `http://localhost:8000${property.photos[0].image}` : "/outils/M1.png"} 
                            alt={property.titre} 
                            className="w-full h-32 object-cover" 
                          />
                          <div className="p-4">
                            <p className="font-bold text-gray-900 truncate mb-1">{property.titre}</p>
                            <p className="text-xs text-gray-500 truncate mb-2"><MapPin size={10} className="inline mr-1" />{property.quartier}, {property.ville}</p>
                            <p className="font-bold text-brand-500">{formatPrice(property.prix)}</p>
                          </div>
                        </Link>
                      </Popup>
                    </Marker>
                  );
                })}
              </MapContainer>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Stats Section ── */}
        <section className="py-20 relative overflow-hidden">

          {/* En-tête de la section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14 px-4 relative z-10"
          >
            <h2 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight drop-shadow-sm">
              La référence immobilière au Togo : Amétô
            </h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              Amétô connecte locataires, acheteurs et propriétaires dans un écosystème sécurisé et transparent.
            </p>
          </motion.div>

          {/* Conteneur du carrousel avec masque sur les bords pour fondre le texte */}
          <div className="relative w-full overflow-hidden flex [mask-image:_linear-gradient(to_right,transparent_0,_black_10%,_black_90%,transparent_100%)]">

            {/* Piste animée (défilement gauche -> droite) */}
            <motion.div
              className="flex gap-8 px-4 w-max"
              // On part de -50% (gauche) pour aller vers 0% (droite) pour l'effet demandé
              animate={{ x: ["-33.33%", "0%"] }}
              transition={{
                repeat: Infinity,
                ease: "linear",
                duration: 35, // Augmentez pour ralentir, diminuez pour accélérer
              }}
            >
              {duplicatedStats.map((s, i) => (
                <motion.div
                  key={i}
                  whileHover={{ scale: 1.05, y: -10, rotateY: 5 }} // Effet 3D au survol
                  style={{ perspective: 1000 }}
                  className="w-72 flex-shrink-0 relative group"
                >
                  {/* Carte Glassmorphism "Liquide" */}
                  <div className="h-full bg-white/40 backdrop-blur-xl border border-white/60 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] rounded-[2rem] p-4 flex flex-col gap-4 transition-all duration-300 group-hover:shadow-[0_20px_40px_0_rgba(31,38,135,0.15)] group-hover:bg-white/60">

                    {/* Image */}
                    <div className="w-full h-40 rounded-2xl overflow-hidden shadow-inner relative">
                      <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-300 z-10" />
                      <img
                        src={s.image}
                        alt={s.label}
                        className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-110"
                        loading="lazy"
                      />
                    </div>

                    {/* Textes */}
                    <div className="px-2 pb-2 text-center">
                      <p className="text-3xl font-black text-gray-800 tracking-tight drop-shadow-sm">
                        {s.value}
                      </p>
                      <p className="text-sm font-semibold text-gray-500 mt-1 uppercase tracking-wider">
                        {s.label}
                      </p>
                    </div>

                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
        {/* ── CTA Banner ── */}
        <section className="mb-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative bg-gray-900 rounded-[32px] overflow-hidden card-3d"
          >
            {/* Background video */}
            <video
              autoPlay
              loop
              muted
              playsInline
              className="absolute inset-0 w-full h-full object-cover opacity-60"
            >
              <source src="/outils/video1.mp4" type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent" />

            <div className="relative z-10 p-14 md:p-20 max-w-2xl">
              <div className="inline-flex items-center gap-2 glass text-white rounded-full px-4 py-2 text-sm font-bold mb-6">
                N°1 de l'immobilier au Togo : Amétô
              </div>
              <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6 leading-tight">
                Trouvez votre prochain chez-vous
              </h2>
              <p className="text-lg text-gray-300 mb-10 max-w-lg leading-relaxed glass-dark p-4 rounded-xl border border-white/10">
                Des milliers de biens à Lomé et dans toutes les régions du Togo. Location ou achat — nous simplifions chaque étape.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/register" className="btn-primary">
                  Commencer gratuitement <ArrowRight size={18} />
                </Link>
                <button onClick={() => window.scrollTo(0, 0)} className="btn-outline !text-white !border-white/30 glass hover:!bg-white/20">
                  Explorer le catalogue
                </button>
              </div>
            </div>
          </motion.div>
        </section>
      </main>

      {/* ── Floating Map Toggle Button ── */}
      {/* <motion.button
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8, type: 'spring', stiffness: 200 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setView(view === 'grid' ? 'map' : 'grid')}
        className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-6 py-3.5 rounded-full flex items-center gap-2.5 font-bold shadow-2xl z-50 hover:bg-black transition-colors"
      >
        {view === 'grid' ? (
          <><Map size={18} /> Afficher la carte</>
        ) : (
          <><List size={18} /> Afficher la liste</>
        )}
      </motion.button> */}

      {/* ── Footer ── */}
      <footer className="bg-gray-50 border-t border-gray-200 py-12 px-6">
        <div className="max-w-[1400px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-gray-200">
            <div>
              <h4 className="font-bold text-gray-900 mb-4">Amétô</h4>
              <p className="text-sm text-gray-500 leading-relaxed">
                La plateforme immobilière de référence au Togo. Transparence et sécurité garanties.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-4">Explorer</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><Link to="/" className="hover:text-gray-900 transition-colors">Toutes les offres</Link></li>
                <li><a href="#" className="hover:text-gray-900 transition-colors">Locations</a></li>
                <li><a href="#" className="hover:text-gray-900 transition-colors">Ventes</a></li>
                <li><a href="#" className="hover:text-gray-900 transition-colors">Carte interactive</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-4">Compte</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><Link to="/login" className="hover:text-gray-900 transition-colors">Se connecter</Link></li>
                <li><Link to="/register" className="hover:text-gray-900 transition-colors">S'inscrire</Link></li>
                <li><Link to="/dashboard" className="hover:text-gray-900 transition-colors">Mon tableau de bord</Link></li>
                <li><Link to="/favorites" className="hover:text-gray-900 transition-colors">Mes favoris</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><a href="#" className="hover:text-gray-900 transition-colors">Centre d'aide</a></li>
                <li><Link to="/maintenance" className="hover:text-gray-900 transition-colors">Signalement</Link></li>
                <li><a href="#" className="hover:text-gray-900 transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-gray-900 transition-colors">WhatsApp</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
            <div className="flex flex-wrap gap-x-6 gap-y-2 items-center">
              <span>© 2026 Amétô, Lomé, Togo</span>
              <Link to="/privacy" className="hover:underline hover:text-gray-900 transition-colors">Confidentialité</Link>
              <Link to="/terms" className="hover:underline hover:text-gray-900 transition-colors">Conditions</Link>
              <Link to="/sitemap" className="hover:underline hover:text-gray-900 transition-colors">Plan du site</Link>
            </div>
            <div className="flex items-center gap-4 font-semibold">
              <span className="flex items-center gap-1.5 cursor-pointer hover:text-gray-900 transition-colors">
                Français (FR)
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
