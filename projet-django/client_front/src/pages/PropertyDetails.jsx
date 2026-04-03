import Header from "../components/Header";
import {
  Calendar, Wifi, Car, Waves, ArrowLeft, Check, Star,
  Share, Heart, ShieldCheck, MapPin, Info, ChevronRight,
  DoorOpen, Utensils, Tv, Wind, Scale, Maximize2, X, Smartphone,
  ChevronLeft, User, ExternalLink, Copy, AlertCircle, Loader2
} from "lucide-react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { submitCandidature } from "../store/userSlice";
import { motion, AnimatePresence } from "framer-motion";
import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import CalendarPicker from "../components/CalendarPicker";

// Fix Leaflet icon issue with Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom brand marker
const brandIcon = L.divIcon({
  className: '',
  html: `<div style="
    background: #FF385C;
    width: 40px; height: 40px;
    border-radius: 50% 50% 50% 0;
    transform: rotate(-45deg);
    border: 3px solid white;
    box-shadow: 0 4px 20px rgba(255,56,92,0.5);
    display: flex; align-items: center; justify-content: center;
  "></div>`,
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -45],
});

/* ── MOCK DATA ── */
const allProperties = {
  "1": {
    id: 1, title: "Appartement T2 Moderne – Tokoin", location: "Tokoin, Lomé, Togo",
    lat: 6.1375, lng: 1.2123,
    price: "150 000", period: "/ mois", rating: 4.85, reviews: 24,
    host: { name: "M. Yao", role: "Agent certifié Amétô", image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop", joined: "Membre depuis 2022", responseTime: "Répond en < 1h" },
    specs: [{ label: "2 chambres" }, { label: "65 m²" }, { label: "Sécurisé 24h/24" }],
    amenities: [
      { icon: Wifi, label: "Wifi haut débit" },
      { icon: Wind, label: "Climatisation" },
      { icon: Utensils, label: "Cuisine équipée" },
      { icon: Car, label: "Parking gratuit" },
      { icon: Tv, label: "Télévision" },
      { icon: Waves, label: "Piscine commune" },
    ],
    images: [
      "/outils/img1.png",
      "/outils/img2.png",
      "/outils/img3.png",
      "/outils/img4.png",
      "/outils/img5.png",
    ],
    description: "Bienvenue dans ce superbe appartement T2 situé au cœur de Tokoin. Entièrement rénové avec des matériaux de qualité, cet espace offre tout le confort moderne dans un quartier dynamique et sécurisé de Lomé. Idéal pour les jeunes professionnels ou les couples cherchant la proximité avec le centre-ville et toutes ses commodités.",
    caution: "450 000",
    nearbyPlaces: ["Marché de Tokoin (5 min)", "CHU Sylvanus Olympio (10 min)", "École Française (8 min)", "Supermarché Score (3 min)"],
  },
};

/* ── GALLERY IMAGE MODAL ── */
function GalleryModal({ images, startIndex, onClose }) {
  const [current, setCurrent] = useState(startIndex);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'ArrowRight') setCurrent(i => Math.min(images.length - 1, i + 1));
      if (e.key === 'ArrowLeft')  setCurrent(i => Math.max(0, i - 1));
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [images.length, onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] bg-black flex flex-col"
    >
      {/* Top bar */}
      <div className="flex justify-between items-center px-8 py-5 text-white">
        <span className="font-bold text-lg">{current + 1} / {images.length}</span>
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-2 px-4 py-2 border border-white/30 rounded-full text-sm font-semibold hover:bg-white/10 transition-colors">
            <Share size={16} /> Partager
          </button>
          <button
            onClick={onClose}
            className="p-2.5 hover:bg-white/10 rounded-full transition-colors"
          >
            <X size={22} />
          </button>
        </div>
      </div>

      {/* Main image */}
      <div className="flex-1 flex items-center justify-center relative px-16">
        {current > 0 && (
          <button
            onClick={() => setCurrent(i => i - 1)}
            className="absolute left-4 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all"
          >
            <ChevronLeft size={24} />
          </button>
        )}
        <AnimatePresence mode="wait">
          <motion.img
            key={current}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            src={images[current]}
            className="max-h-[75vh] max-w-full object-contain rounded-2xl shadow-2xl"
          />
        </AnimatePresence>
        {current < images.length - 1 && (
          <button
            onClick={() => setCurrent(i => i + 1)}
            className="absolute right-4 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all"
          >
            <ChevronRight size={24} />
          </button>
        )}
      </div>

      {/* Thumbnails */}
      <div className="flex justify-center gap-2 px-8 py-4 overflow-x-auto no-scrollbar">
        {images.map((img, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`flex-shrink-0 transition-all rounded-xl overflow-hidden border-2 ${
              i === current ? 'border-white scale-105' : 'border-transparent opacity-40 hover:opacity-70'
            }`}
          >
            <img src={img} className="w-20 h-14 object-cover" />
          </button>
        ))}
      </div>
    </motion.div>
  );
}

/* ── CANDIDATURE MODAL ── */
function CandidatureModal({ property, onClose }) {
  const dispatch = useDispatch();
  const { profile, loading } = useSelector((state) => state.user);
  const [step, setStep] = useState(1);
  const [message, setMessage] = useState('');
  const [error, setError] = useState(null);

  const handleConfirm = async () => {
    if (!profile?.cni || !profile?.fiche_paie) {
      setError("Votre dossier est incomplet. Veuillez uploader votre CNI et vos fiches de paie dans 'Mon Dossier'.");
      return;
    }

    const formData = new FormData();
    formData.append('bien', property.id);
    formData.append('message', message);

    const result = await dispatch(submitCandidature(formData));
    if (submitCandidature.fulfilled.match(result)) {
      setStep(2);
    } else {
      setError("Une erreur est survenue lors de l'envoi. Veuillez réessayer.");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 z-[150] flex items-end sm:items-center justify-center p-0 sm:p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%', opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        onClick={e => e.stopPropagation()}
        className="bg-white w-full sm:max-w-lg rounded-t-[32px] sm:rounded-[32px] overflow-hidden shadow-2xl"
      >
        {/* Handle bar (mobile) */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 bg-gray-200 rounded-full" />
        </div>

        {step === 1 && (
          <>
            <div className="p-7">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-[#222222]">Candidature numérique</h3>
                <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-[#717171]">
                  <X size={20} />
                </button>
              </div>

              {/* Property summary */}
              <div className="flex gap-4 items-center bg-[#F9FAFB] p-4 rounded-2xl mb-6 border border-[#EBEBEB]">
                <img src={property.images[0]} className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
                <div className="min-w-0">
                  <p className="font-bold text-[#222222] truncate">{property.title}</p>
                  <p className="text-[#FF385C] font-bold">{property.price} FCFA <span className="text-[#717171] font-normal text-sm">{property.period}</span></p>
                </div>
              </div>

              {error && (
                <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-xs font-bold flex items-center gap-3 mb-6">
                  <AlertCircle size={18} />
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-[#222222] mb-2">Message pour le propriétaire</label>
                  <textarea
                    rows={4}
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    placeholder="Présentez-vous et précisez vos dates souhaitées..."
                    className="ameto-input resize-none"
                  />
                </div>

                <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-2xl border border-blue-100">
                  <Info size={18} className="text-blue-500 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-blue-700 leading-relaxed">
                    Votre profil (CNI, fiches de paie) sera automatiquement joint à cette demande. Assurez-vous qu'il est à jour dans votre <Link to="/dossier" onClick={onClose} className="font-bold underline">espace client</Link>.
                  </p>
                </div>
              </div>
            </div>

            <div className="px-7 pb-7 space-y-3">
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleConfirm}
                disabled={loading}
                className="btn-primary w-full py-4 text-base flex items-center justify-center gap-2"
              >
                {loading && <Loader2 size={20} className="animate-spin" />}
                Confirmer l'envoi
              </motion.button>
              <button onClick={onClose} className="w-full py-3 text-[#717171] font-semibold hover:text-[#222222] transition-colors text-sm">
                Plus tard
              </button>
            </div>
          </>
        )}

        {step === 2 && (
          <div className="p-12 flex flex-col items-center text-center">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', damping: 12, stiffness: 200 }}
              className="w-24 h-24 bg-[#10B981] rounded-full flex items-center justify-center text-white mb-6 shadow-xl"
            >
              <Check size={44} strokeWidth={3} />
            </motion.div>
            <h2 className="text-3xl font-extrabold text-[#222222] mb-3">Candidature Envoyée !</h2>
            <p className="text-[#717171] text-base mb-8 max-w-xs">
              Le propriétaire reviendra vers vous sous 24h à 48h ouvrées.
            </p>
            <Link
              to="/dashboard"
              className="btn-secondary w-full max-w-xs py-4 mb-3 block text-center"
              onClick={onClose}
            >
              Aller au tableau de bord
            </Link>
            <button
              onClick={() => { onClose(); setStep(1); }}
              className="text-[#717171] font-semibold hover:text-[#222222] transition-colors text-sm"
            >
              Fermer
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

/* ── MAIN COMPONENT ── */
export default function PropertyDetails() {
  const { id } = useParams();
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryStart, setGalleryStart] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [isFav, setIsFav] = useState(false);
  const [showAllAmenities, setShowAllAmenities] = useState(false);
  const [showFullDesc, setShowFullDesc] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isSticky, setIsSticky] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);

  const property = allProperties[id] || allProperties["1"];

  useEffect(() => {
    const handler = () => setIsSticky(window.scrollY > 500);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const openGallery = (idx) => { setGalleryStart(idx); setGalleryOpen(true); };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const handleWhatsApp = () => {
    const text = encodeURIComponent(`Je suis intéressé(e) par : ${property.title} – ${property.price} FCFA ${property.period}\n${window.location.href}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const visibleAmenities = showAllAmenities ? property.amenities : property.amenities.slice(0, 6);

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Modals */}
      <AnimatePresence>
        {galleryOpen && (
          <GalleryModal images={property.images} startIndex={galleryStart} onClose={() => setGalleryOpen(false)} />
        )}
        {showModal && (
          <CandidatureModal property={property} onClose={() => setShowModal(false)} />
        )}
      </AnimatePresence>

      <main className="max-w-[1200px] mx-auto px-6 py-8">

        {/* ── Title Row ── */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-5">
          <h1 className="text-2xl md:text-3xl font-bold text-[#222222] mb-3">{property.title}</h1>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center flex-wrap gap-3 text-sm font-semibold">
              <span className="flex items-center gap-1">
                <Star size={15} className="star" />{property.rating}
              </span>
              <span className="text-[#b0b0b0]">·</span>
              <button className="underline hover:text-[#222222] cursor-pointer transition-colors">
                {property.reviews} avis
              </button>
              <span className="text-[#b0b0b0]">·</span>
              <button className="flex items-center gap-1 underline hover:text-[#222222] transition-colors">
                <MapPin size={14} className="text-[#FF385C]" />{property.location}
              </button>
            </div>
            <div className="flex items-center gap-2">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleShare}
                className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gray-100 transition-colors text-sm font-semibold"
              >
                {copied ? <Check size={16} className="text-[#10B981]" /> : <Share size={16} />}
                {copied ? 'Copié !' : 'Partager'}
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsFav(!isFav)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gray-100 transition-colors text-sm font-semibold"
              >
                <Heart size={16} className={isFav ? 'fill-[#FF385C] text-[#FF385C]' : ''} />
                {isFav ? 'Enregistré' : 'Enregistrer'}
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleWhatsApp}
                className="hidden md:flex items-center gap-2 bg-green-50 text-[#10B981] border border-green-200 px-4 py-2 rounded-xl font-bold text-sm hover:bg-green-100 transition-colors"
              >
                <Smartphone size={15} /> WhatsApp
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* ── Photo Gallery (Airbnb 3D grid) ── */}
        <div className="grid grid-cols-4 grid-rows-2 gap-3 h-[320px] md:h-[520px] mb-12 relative animate-fade-in" style={{ perspective: "1500px" }}>
          {/* Main large image */}
          <div className="col-span-2 row-span-2 rounded-3xl overflow-hidden cursor-pointer card-3d shadow-xl" onClick={() => openGallery(0)}>
            <motion.img
              whileHover={{ scale: 1.08 }}
              transition={{ duration: 0.6, ease: [0.25, 1, 0.5, 1] }}
              src={property.images[0]}
              alt={property.title}
              className="w-full h-full object-cover"
            />
          </div>
          {/* Smaller images */}
          {property.images.slice(1, 5).map((img, i) => (
            <div key={i} className="col-span-1 row-span-1 rounded-3xl overflow-hidden cursor-pointer relative card-3d shadow-lg" onClick={() => openGallery(i + 1)}>
              <motion.img
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.6, ease: [0.25, 1, 0.5, 1] }}
                src={img}
                className="w-full h-full object-cover"
              />
              {/* Show all photos button on last */}
              {i === 3 && (
                <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-end justify-end p-4">
                  <button
                    onClick={(e) => { e.stopPropagation(); openGallery(0); }}
                    className="glass border-white/40 text-[#222222] font-bold px-4 py-2 rounded-xl shadow-lg text-sm flex items-center gap-1.5 hover:bg-white/60 transition-colors active:scale-95"
                  >
                    <Maximize2 size={15} /> Découvrir (3D)
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* ── Main Content ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          {/* Left: Details */}
          <div className="lg:col-span-2 space-y-10">

            {/* Host */}
            <div className="flex justify-between items-center pb-8 border-b border-[#EBEBEB]">
              <div>
                <h2 className="text-xl font-bold text-[#222222] mb-1">Géré par {property.host.name}</h2>
                <div className="flex flex-wrap gap-x-2 text-[#717171] text-sm">
                  {property.specs.map((s, i) => (
                    <span key={i}>{i > 0 && <span className="mx-1">·</span>}{s.label}</span>
                  ))}
                </div>
                <p className="text-xs text-[#b0b0b0] mt-2 font-medium">{property.host.responseTime}</p>
              </div>
              <div className="relative flex-shrink-0">
                <img src={property.host.image} className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-md" />
                <div className="absolute -bottom-1 -right-1 bg-[#FF385C] text-white p-1 rounded-full border-2 border-white shadow-sm">
                  <ShieldCheck size={10} strokeWidth={3} />
                </div>
              </div>
            </div>

            {/* Key Features */}
            <div className="space-y-6 pb-10 border-b border-[#EBEBEB]">
              {[
                { icon: DoorOpen,   title: "Arrivée autonome",              desc: "Vous pouvez entrer dans les lieux avec une boîte à clé sécurisée." },
                { icon: MapPin,     title: "Emplacement idéal",             desc: "95 % des visiteurs ont attribué 5 étoiles à l'emplacement." },
                { icon: Calendar,   title: "Annulation gratuite avant le 1er Avril", desc: "Bénéficiez d'un remboursement intégral si vous changez d'avis." },
              ].map((feat, i) => (
                <div key={i} className="flex gap-5 group">
                  <div className="w-10 h-10 rounded-2xl bg-[#F9FAFB] flex items-center justify-center flex-shrink-0 group-hover:bg-[#fff0f1] transition-colors">
                    <feat.icon size={22} className="text-gray-700 group-hover:text-[#FF385C] transition-colors" strokeWidth={1.8} />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#222222]">{feat.title}</h3>
                    <p className="text-[#717171] text-sm mt-0.5 leading-relaxed">{feat.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Description */}
            <div className="pb-10 border-b border-[#EBEBEB]">
              <h2 className="text-xl font-bold text-[#222222] mb-4">À propos du logement</h2>
              <div className={`text-gray-600 leading-relaxed text-[15px] ${!showFullDesc ? 'line-clamp-4' : ''}`}>
                {property.description}
              </div>
              <button
                onClick={() => setShowFullDesc(!showFullDesc)}
                className="mt-3 font-bold underline flex items-center gap-1 text-[#222222] hover:text-[#FF385C] transition-colors text-sm"
              >
                {showFullDesc ? 'Voir moins' : 'En savoir plus'} <ChevronRight size={16} className={showFullDesc ? 'rotate-90' : ''} />
              </button>
            </div>

            {/* Amenities */}
            <div className="pb-10 border-b border-[#EBEBEB]">
              <h2 className="text-xl font-bold text-[#222222] mb-6">Ce que propose ce logement</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {visibleAmenities.map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center gap-4 p-3 rounded-xl hover:bg-[#F9FAFB] transition-colors"
                  >
                    <div className="w-9 h-9 rounded-xl bg-[#F9FAFB] flex items-center justify-center flex-shrink-0">
                      <item.icon size={20} className="text-gray-600" strokeWidth={1.8} />
                    </div>
                    <span className="text-gray-700 font-medium text-sm">{item.label}</span>
                  </motion.div>
                ))}
              </div>
              <button
                onClick={() => setShowAllAmenities(!showAllAmenities)}
                className="mt-6 btn-outline w-full sm:w-auto"
              >
                {showAllAmenities ? 'Voir moins' : `Afficher les ${property.amenities.length} équipements`}
              </button>
            </div>

            {/* ── MAP SECTION (Leaflet OpenStreetMap) ── */}
            <div className="pb-10">
              <h2 className="text-xl font-bold text-[#222222] mb-2">Où se situe le logement</h2>
              <p className="text-[#717171] text-sm mb-6 flex items-center gap-1.5">
                <MapPin size={14} className="text-[#FF385C]" /> {property.location}
              </p>

              <div className="w-full h-[420px] rounded-3xl overflow-hidden border border-[#EBEBEB] shadow-sm">
                <MapContainer
                  center={[property.lat, property.lng]}
                  zoom={15}
                  style={{ width: '100%', height: '100%' }}
                  zoomControl={true}
                  scrollWheelZoom={false}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  />

                  {/* Radius circle */}
                  <Circle
                    center={[property.lat, property.lng]}
                    radius={300}
                    pathOptions={{ color: '#FF385C', fillColor: '#FF385C', fillOpacity: 0.08, weight: 2 }}
                  />

                  <Marker position={[property.lat, property.lng]}>
                    <Popup className="custom-popup">
                      <div className="p-2 min-w-[180px]">
                        <p className="font-bold text-[#222222] text-sm mb-1">{property.title}</p>
                        <p className="text-[#FF385C] font-bold text-sm">{property.price} FCFA {property.period}</p>
                        <p className="text-[#717171] text-xs mt-1.5 flex items-center gap-1">
                          <Star size={10} className="star" /> {property.rating} · {property.reviews} avis
                        </p>
                      </div>
                    </Popup>
                  </Marker>
                </MapContainer>
              </div>

              {/* Nearby places */}
              <div className="mt-6">
                <h3 className="font-bold text-[#222222] mb-3 text-sm">À proximité</h3>
                <div className="flex flex-wrap gap-2">
                  {property.nearbyPlaces.map((place, i) => (
                    <span key={i} className="inline-flex items-center gap-1.5 bg-[#F9FAFB] border border-[#EBEBEB] text-gray-600 text-xs font-medium px-3 py-1.5 rounded-full">
                      <MapPin size={12} className="text-[#b0b0b0]" /> {place}
                    </span>
                  ))}
                </div>
              </div>

              <button
                onClick={() => window.open(`https://www.openstreetmap.org/?mlat=${property.lat}&mlon=${property.lng}#map=16/${property.lat}/${property.lng}`, '_blank')}
                className="mt-5 flex items-center gap-2 text-[#222222] font-bold underline text-sm hover:text-[#FF385C] transition-colors"
              >
                <ExternalLink size={15} /> Ouvrir dans OpenStreetMap
              </button>
            </div>
          </div>

          {/* Right: Booking card */}
          <div className="lg:col-span-1 relative">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="sticky top-28 booking-card-shadow border border-white/50 rounded-3xl p-7 space-y-5 glass card-3d"
            >
              <div className="flex justify-between items-baseline">
                <div>
                  <span className="text-2xl font-extrabold text-[#222222]">{property.price} FCFA</span>
                  <span className="text-[#717171] text-sm ml-1">{property.period}</span>
                </div>
                <div className="flex items-center gap-1 text-sm font-semibold">
                  <Star size={13} className="star" />
                  <span>{property.rating}</span>
                  <span className="text-[#b0b0b0] font-normal">· {property.reviews}</span>
                </div>
              </div>

              {/* Date inputs */}
              <div className="relative border border-white/40 bg-white/40 rounded-2xl overflow-hidden backdrop-blur-md">
                <div 
                  onClick={() => setShowCalendar(true)}
                  className="grid grid-cols-2 divide-x divide-white/40 border-b border-white/40"
                >
                  <div className="p-3 cursor-pointer hover:bg-white/60 transition-colors">
                    <label className="block text-[10px] font-bold text-[#222222] uppercase mb-1">Arrivée</label>
                    <p className="text-sm font-medium text-[#222222]">01 Apr 2026</p>
                  </div>
                  <div className="p-3 cursor-pointer hover:bg-white/60 transition-colors">
                    <label className="block text-[10px] font-bold text-[#222222] uppercase mb-1">Départ</label>
                    <p className="text-sm font-medium text-[#222222]">01 Apr 2028</p>
                  </div>
                </div>
                <div className="p-3 flex justify-between items-center hover:bg-white/60 transition-colors cursor-pointer">
                  <div>
                    <label className="block text-[10px] font-bold text-[#222222] uppercase mb-1">Locataires</label>
                    <span className="text-sm font-medium text-[#222222]">1 personne</span>
                  </div>
                  <ChevronRight size={18} className="text-[#b0b0b0] rotate-90" />
                </div>

                <AnimatePresence>
                  {showCalendar && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                      className="absolute right-0 top-full mt-2 w-[340px] md:w-[700px] z-[100]"
                    >
                      <CalendarPicker isDouble={window.innerWidth > 768} onClose={() => setShowCalendar(false)} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* CTA */}
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => setShowModal(true)}
                className="btn-primary w-full py-4 text-[15px] shadow-[0_8px_20px_rgba(255,56,92,0.25)]"
              >
                Réserver / Postuler
              </motion.button>
              <p className="text-center text-xs text-[#717171] font-medium">Aucun montant ne sera débité</p>

              {/* Price breakdown */}
              <div className="pt-4 border-t border-[#EBEBEB]/50 space-y-3 text-sm">
                <div className="flex justify-between text-gray-700">
                  <span className="underline cursor-pointer">Loyer mensuel</span>
                  <span className="font-medium">{property.price} FCFA</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span className="underline cursor-pointer">Caution (3 mois)</span>
                  <span className="font-medium">{property.caution} FCFA</span>
                </div>
                <div className="flex justify-between font-bold text-[#222222] pt-3 border-t border-[#EBEBEB]/50 text-base">
                  <span>Total caution dû</span>
                  <span>{property.caution} FCFA</span>
                </div>
              </div>
            </motion.div>

            {/* WhatsApp & Report */}
            <div className="mt-8 space-y-4">
              <button
                onClick={handleWhatsApp}
                className="w-full flex items-center justify-center gap-2 bg-[#10B981] text-white font-bold py-3.5 rounded-2xl hover:bg-green-600 transition-all active:scale-95 shadow-lg shadow-green-500/20 card-3d"
              >
                <Smartphone size={18} /> Contacter via WhatsApp
              </button>
              <div className="flex items-center justify-center gap-2 text-[#b0b0b0] text-sm cursor-pointer hover:text-gray-600 transition-colors">
                <ShieldCheck size={16} /> Signaler cette annonce
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Mobile sticky footer */}
      <div className="md:hidden mobile-bottom-nav flex justify-between items-center">
        <div>
          <span className="font-bold text-lg text-[#222222]">{property.price} FCFA</span>
          <span className="text-[#717171] text-sm">{property.period}</span>
          <div className="flex items-center gap-1 text-xs font-semibold mt-0.5">
            <Star size={10} className="star" />{property.rating}
          </div>
        </div>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowModal(true)}
          className="btn-primary py-3.5 px-8"
        >
          Réserver
        </motion.button>
      </div>
    </div>
  );
}
