import {
  Home, CreditCard, FileText, MessageSquare, Settings,
  FileDown, CheckCircle, LogOut, Bell, Heart, MapPin,
  Search, Calendar, ArrowUpRight, TrendingUp, AlertCircle,
  ChevronRight, X, Plus, Shield, Wrench, Loader2
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { logout, fetchUserPayments, fetchUserCandidatures } from "../store/userSlice";
import logo from '../assets/logo_ameto.png';
import DashboardEmptyState from "../components/DashboardEmptyState";
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement,
  LineElement, BarElement, Title, Tooltip, Legend, Filler
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale, LinearScale, PointElement,
  LineElement, BarElement, Title, Tooltip, Legend, Filler
);

/* ── DATA ── */
const defaultUser = {
  location: "Lomé, Togo",
  image: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=200&h=200&fit=crop",
  score: 95,
};

const navItems = [
  { id: 'home',        label: 'Mon Foyer',      icon: Home,           to: '/dashboard' },
  { id: 'payment',     label: 'Paiements',      icon: CreditCard,     to: '/payment' },
  { id: 'dossier',     label: 'Mon Dossier',    icon: FileText,       to: '/dossier' },
  { id: 'maintenance', label: 'Maintenance',    icon: Wrench,         to: '/maintenance' },
  { id: 'messages',    label: 'Messages',       icon: MessageSquare,  to: '/messages' },
  { id: 'favorites',   label: 'Favoris',        icon: Heart,          to: '/favorites' },
];

const docs = [
  { name: "Quittance_Mars_2026.pdf",    size: "1.2 MB", date: "05 Mars" },
  { name: "Bail_Amétô_Afi.pdf",      size: "4.5 MB", date: "01 Avr 2024" },
  { name: "Etat_Lieux_Entree.pdf",      size: "3.1 MB", date: "01 Avr 2024" },
];

const barData = {
  labels: ['Charges', 'Eau', 'Électricité', 'Autres'],
  datasets: [{
    data: [15000, 8000, 25000, 5000],
    backgroundColor: ['#FF385C', '#F59E0B', '#3B82F6', '#10B981'],
    borderRadius: 8,
    borderSkipped: false,
  }],
};

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: 'rgba(255, 255, 255, 0.8)',
      titleColor: '#1F2937',
      bodyColor: '#6B7280',
      borderColor: 'rgba(255, 255, 255, 0.5)',
      borderWidth: 1,
      padding: 12,
      displayColors: false,
      callbacks: { label: (ctx) => `${ctx.parsed.y.toLocaleString('fr-FR')} FCFA` }
    }
  },
  scales: {
    y: { display: false },
    x: { grid: { display: false }, ticks: { font: { family: 'Inter', size: 11 }, color: '#6B7280' } }
  }
};

/* ── SIDEBAR ITEM ── */
function NavItem({ item, active }) {
  return (
    <Link
      to={item.to}
      className={`flex items-center gap-3.5 px-4 py-3.5 rounded-2xl font-bold text-[15px] transition-all duration-300 relative overflow-hidden group ${
        active 
          ? 'text-[#222222] shadow-[0_4px_16px_rgba(0,0,0,0.06)] backdrop-blur-md'
          : 'text-[#717171] hover:text-[#222222] hover:bg-white/40'
      }`}
    >
      <item.icon size={20} strokeWidth={active ? 2.5 : 2} className="flex-shrink-0 relative z-10" />
      <span className="relative z-10">{item.label}</span>
      {active && (
        <motion.div
          layoutId="activeNavDashboard"
          className="absolute inset-0 bg-white/70 border border-white/60 rounded-2xl z-0"
          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
        />
      )}
    </Link>
  );
}

/* ── MAIN ── */
export default function Dashboard() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { profile, payments, candidatures, loading } = useSelector((state) => state.user);
  const [activeNav, setActiveNav] = useState('home');
  const [showNotif, setShowNotif] = useState(true);

  const bail = profile?.bail_actif;
  const isVerified = profile?.is_verified;

  const filteredNavItems = navItems.filter(item => {
    if (!isVerified && (item.id === 'payment' || item.id === 'maintenance')) return false;
    return true;
  });
  const lineData = {
    labels: payments.length > 0 ? payments.map(p => new Date(p.date_paiement).toLocaleDateString('fr-FR', { month: 'short' })).reverse() : ['Aucun'],
    datasets: [{
      fill: true,
      data: payments.length > 0 ? payments.map(p => parseFloat(p.montant)).reverse() : [0],
      borderColor: '#FF385C',
      backgroundColor: 'rgba(255,56,92,0.15)',
      tension: 0.4,
      pointRadius: 4,
      pointBackgroundColor: '#FF385C',
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
    }],
  };

  useEffect(() => {
    dispatch(fetchUserPayments());
    dispatch(fetchUserCandidatures());
  }, [dispatch]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const userStats = [
    { label: "Paiements à jour", value: payments.filter(p => p.statut === 'CONFIRME').length > 0 ? "100%" : "0%", icon: CheckCircle, color: "text-[#10B981]", bg: "bg-[#10B981]/10" },
    { label: "Candidatures", value: candidatures.length, icon: FileText, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Paiements envoyés", value: payments.length, icon: CreditCard, color: "text-[#FF385C]", bg: "bg-[#FF385C]/10" },
    { label: "Alertes actives", value: "0", icon: AlertCircle, color: "text-[#E9A319]", bg: "bg-[#E9A319]/10" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#eef1f6]">
        <Loader2 className="w-12 h-12 text-brand-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-screen w-full relative bg-[#eef1f6] flex flex-col md:flex-row text-[#222222] font-sans overflow-hidden">
      
      {/* ── Liquid Glass Animated Background blobs ── */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-brand-400/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob pointer-events-none z-0" />
      <div className="absolute top-[20%] right-[-10%] w-[500px] h-[500px] bg-blue-400/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000 pointer-events-none z-0" />
      <div className="absolute bottom-[-10%] left-[20%] w-[600px] h-[600px] bg-emerald-400/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000 pointer-events-none z-0" />

      {/* ════════════════════════════
          SIDEBAR
      ════════════════════════════ */}
      <aside className="w-full md:w-80 bg-white/40 backdrop-blur-[20px] border-r border-white/60 flex flex-col h-auto md:h-full z-20 shadow-[8px_0_32px_rgba(0,0,0,0.02)] flex-shrink-0">
        {/* Logo */}
        <div className="px-8 pt-10 pb-6 flex-shrink-0">
          <Link to="/">
            <img src={logo} alt="Amétô" className="h-10 w-auto object-contain drop-shadow-sm" />
          </Link>
        </div>

        {/* User card (Glassy) */}
        <div className="px-6 py-5 mb-2 flex-shrink-0">
          <motion.div 
            whileHover={{ scale: 1.02 }} 
            transition={{ duration: 0.3 }}
            className="flex items-center gap-4 p-4 bg-white/50 backdrop-blur-md rounded-[24px] border border-white/60 shadow-[0_8px_24px_rgba(0,0,0,0.04)]"
          >
            <div className="relative flex-shrink-0">
              <div className="w-12 h-12 rounded-full bg-[#FF385C] flex items-center justify-center text-white font-black text-xl shadow-lg">
                {profile?.username?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-[#10B981] rounded-full border-2 border-white/80" />
            </div>
            <div className="min-w-0">
              <p className="font-extrabold text-[#222222] text-[15px] truncate drop-shadow-sm">{profile?.first_name} {profile?.last_name}</p>
              <p className="text-sm font-medium text-[#717171] truncate">{profile?.email}</p>
            </div>
          </motion.div>

          {/* Trust score */}
          <div className="mt-4 px-5 py-4 bg-white/40 backdrop-blur-md border border-white/60 rounded-[20px] shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-gray-700">Score de confiance</span>
              <span className="text-xs font-extrabold text-[#10B981] bg-emerald-100 px-2 py-0.5 rounded-md shadow-inner">{profile?.trust_score || 0}%</span>
            </div>
            <div className="w-full bg-black/5 rounded-full h-2 overflow-hidden shadow-inner">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${profile?.trust_score || 0}%` }}
                transition={{ duration: 1.2, delay: 0.5, ease: 'easeOut' }}
                className="h-full bg-[#10B981] rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]"
              />
            </div>
          </div>
        </div>

        {/* Navigation - NON SCROLLABLE content */}
        <nav className="flex-1 px-4 space-y-1.5 mt-2 overflow-y-auto no-scrollbar">
          {filteredNavItems.map(item => (
            <div key={item.id} onClick={() => setActiveNav(item.id)}>
              <NavItem item={item} active={activeNav === item.id} />
            </div>
          ))}
        </nav>

        {/* Bottom actions */}
        <div className="px-6 py-8 mt-auto flex-shrink-0">
          <div className="space-y-2">
            <Link
              to="/dashboard"
              className="flex items-center gap-3.5 px-4 py-3 rounded-2xl text-[14px] font-bold text-gray-600 hover:text-[#222222] hover:bg-white/40 backdrop-blur-sm transition-all duration-300 border border-transparent hover:border-white/50"
            >
              <Settings size={18} className="drop-shadow-sm" /> Paramètres
            </Link>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-[14px] font-bold text-red-500 hover:text-red-700 hover:bg-white/40 backdrop-blur-sm transition-all duration-300 border border-transparent hover:border-red-100/50"
            >
              <LogOut size={18} className="drop-shadow-sm" /> Déconnexion
            </button>
          </div>
        </div>
      </aside>

      {/* ════════════════════════════
          MAIN CONTENT
      ════════════════════════════ */}
      <main className="flex-1 p-6 md:p-12 overflow-y-auto relative z-10">
        <div className="max-w-6xl mx-auto space-y-8">

          {/* Header */}
          <div className="flex justify-between items-end mb-4">
            <div>
              <motion.h1
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="text-3xl md:text-5xl font-black text-[#222222] tracking-tight drop-shadow-md"
              >
                Tableau de bord
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.1 }}
                className="text-gray-600 mt-2 font-medium text-lg"
              >
                Ravi de vous revoir, <span className="font-bold">{profile?.first_name || 'Utilisateur'}</span>
              </motion.p>
            </div>
            <div className="flex items-center gap-3">
              <motion.button 
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                className="relative p-3.5 bg-white/60 backdrop-blur-md rounded-[20px] border border-white/60 shadow-[0_8px_32px_rgba(0,0,0,0.06)] transition-all"
              >
                <Bell size={20} className="text-[#222222]" />
                <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-[#FF385C] rounded-full border-[2.5px] border-[#eef1f6] shadow-sm" />
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                className="p-3.5 bg-white/60 backdrop-blur-md rounded-[20px] border border-white/60 shadow-[0_8px_32px_rgba(0,0,0,0.06)] transition-all"
              >
                <Search size={20} className="text-[#222222]" />
              </motion.button>
            </div>
          </div>

          {/* Conditional Rendering: Empty State or Tenant Dashboard */}
          {!bail ? (
            <DashboardEmptyState />
          ) : (
            <>
              {/* Notification Alert */}
              <AnimatePresence>
                {showNotif && (
                  <motion.div
                    initial={{ opacity: 0, y: -20, rotateX: 60 }}
                    animate={{ opacity: 1, y: 0, rotateX: 0 }}
                    exit={{ opacity: 0, scale: 0.95, height: 0, marginTop: -24 }}
                    transition={{ duration: 0.4, type: "spring" }}
                    style={{ transformStyle: "preserve-3d" }}
                    className="flex flex-col sm:flex-row items-center gap-4 bg-white/60 backdrop-blur-xl border border-white/80 shadow-[0_8px_32px_rgba(255,56,92,0.15)] rounded-[24px] px-6 py-5"
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-[0_4px_16px_rgba(245,158,11,0.3)]">
                      <AlertCircle size={24} className="text-white" />
                    </div>
                    <div className="flex-1 text-center sm:text-left">
                      <p className="text-[15px] text-[#222222] font-medium">
                        Votre prochain loyer de <span className="font-black text-lg text-[#E9A319]">{new Intl.NumberFormat('fr-FR').format(bail.bien.prix)} FCFA</span> est dû avant le <strong className="font-bold underline decoration-amber-300">{new Date(bail.date_fin).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}</strong>.
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Link to="/payment" state={{ amount: bail.bien.prix, propertyId: bail.bien.id, propertyTitle: bail.bien.titre }} className="bg-[#222222] text-white font-bold px-6 py-2.5 rounded-xl hover:bg-black transition-colors shadow-lg shadow-gray-900/20 active:scale-95 duration-200 text-sm">
                        Payer
                      </Link>
                      <button onClick={() => setShowNotif(false)} className="p-2.5 bg-black/5 hover:bg-black/10 rounded-xl transition-colors">
                        <X size={18} className="text-gray-600" />
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Stats Grid (3D tilt on hover) */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
                {userStats.map((stat, i) => (
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: i * 0.1 }}
                    whileHover={{ y: -8, scale: 1.02 }}
                    key={i}
                    className="bg-white/50 backdrop-blur-[20px] rounded-[32px] border border-white/60 p-6 flex items-center gap-4 shadow-[0_8px_32px_rgba(0,0,0,0.04)] hover:shadow-[0_16px_48px_rgba(0,0,0,0.08)] transition-all duration-300 group"
                  >
                    <div className={`w-14 h-14 rounded-[20px] ${stat.bg} flex items-center justify-center flex-shrink-0 ${stat.color} shadow-inner group-hover:scale-110 group-hover:rotate-3 transition-all duration-400`}>
                      <stat.icon size={26} strokeWidth={2.5} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] font-extrabold text-[#717171] uppercase tracking-widest truncate">{stat.label}</p>
                      <p className="text-3xl font-black text-[#222222] drop-shadow-sm tracking-tight">{stat.value}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Main grid */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

                {/* LEFT: 2/3 */}
                <div className="xl:col-span-2 space-y-6">

                  {/* Active property card (Liquid Glass & 3D) */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    whileHover={{ scale: 1.01 }}
                    className="bg-white/60 backdrop-blur-[24px] rounded-[32px] border border-white/70 overflow-hidden shadow-[0_12px_40px_rgba(0,0,0,0.05)] hover:shadow-[0_24px_60px_rgba(0,0,0,0.08)] transition-all duration-400"
                  >
                    <div className="flex flex-col md:flex-row relative">
                      <div className="md:w-5/12 h-[220px] md:h-auto overflow-hidden relative m-3 md:m-4 rounded-[24px]">
                        <img
                          src={bail.bien.photos.length > 0 ? `http://localhost:8000${bail.bien.photos[0].image}` : "/outils/M1.png"}
                          className="w-full h-full object-cover transform hover:scale-110 transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]"
                        />
                        <div className="absolute top-4 left-4">
                          <span className="bg-black/60 backdrop-blur-md border border-white/20 text-white text-[11px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider shadow-xl">Loué</span>
                        </div>
                      </div>
                      <div className="flex-1 p-6 md:p-8 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="text-2xl font-black text-[#222222] tracking-tight">{bail.bien.titre}</h3>
                              <p className="text-[#717171] font-bold flex items-center gap-1.5 text-sm mt-1">
                                <MapPin size={16} className="text-[#FF385C]" /> {bail.bien.quartier}, {bail.bien.ville}
                              </p>
                            </div>
                            <div className="text-right bg-[#FF385C]/10 px-4 py-2 rounded-2xl border border-[#FF385C]/20">
                              <p className="text-xl font-black text-[#e8152e]">{new Intl.NumberFormat('fr-FR').format(bail.bien.prix)} FCFA</p>
                              <p className="text-[11px] font-extrabold text-[#FF385C] uppercase tracking-wider">/ mois</p>
                            </div>
                          </div>
                          <p className="text-gray-600 text-[15px] font-medium leading-relaxed bg-white/40 p-4 rounded-[20px] border border-white/60 shadow-inner">
                              Bail en cours jusqu'au <strong className="text-[#222222] font-black">{new Date(bail.date_fin).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</strong>.
                              Vous bénéficiez de l'assurance Premium Amétô incluse.
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-3 mt-6">
                          <button className="bg-white border border-[#EBEBEB] text-[#222222] font-bold text-sm py-3 px-6 rounded-2xl shadow-sm hover:shadow-md hover:border-gray-300 transition-all active:scale-95">
                            Détails du bail
                          </button>
                          <Link to="/maintenance" className="bg-black/5 border border-black/5 text-[#222222] font-bold text-sm py-3 px-6 rounded-2xl hover:bg-black/10 transition-all active:scale-95">
                            <Wrench size={16} className="inline mr-2 opacity-70" />Maintenance
                          </Link>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Charts (Glassmorphism blocks) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.3 }}
                      className="bg-white/50 backdrop-blur-[24px] rounded-[32px] border border-white/60 p-7 shadow-[0_8px_32px_rgba(0,0,0,0.04)]"
                    >
                      <div className="flex justify-between items-start mb-6">
                        <div>
                          <h3 className="text-lg font-black text-[#222222] tracking-tight">Historique loyers</h3>
                          <p className="text-xs text-[#717171] font-bold uppercase tracking-wider mt-1">6 derniers mois</p>
                        </div>
                        <div className="flex items-center gap-1.5 bg-[#10B981]/10 text-[#10B981] px-3 py-1.5 rounded-xl border border-emerald-500/20">
                          <TrendingUp size={16} />
                          <span className="text-[11px] font-black uppercase">Stable</span>
                        </div>
                      </div>
                      <div className="h-44 w-full">
                        <Line data={lineData} options={chartOptions} />
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.4 }}
                      className="bg-white/50 backdrop-blur-[24px] rounded-[32px] border border-white/60 p-7 shadow-[0_8px_32px_rgba(0,0,0,0.04)]"
                    >
                      <div className="flex justify-between items-start mb-6">
                        <div>
                          <h3 className="text-lg font-black text-[#222222] tracking-tight">Dépenses annexes</h3>
                          <p className="text-xs text-[#717171] font-bold uppercase tracking-wider mt-1">Répartition actuelle</p>
                        </div>
                        <div className="flex items-center gap-1.5 bg-blue-500/10 text-blue-600 px-3 py-1.5 rounded-xl border border-blue-500/20">
                          <ArrowUpRight size={16} />
                          <span className="text-[11px] font-black uppercase">53 000 F</span>
                        </div>
                      </div>
                      <div className="h-44 w-full">
                        <Bar data={barData} options={chartOptions} />
                      </div>
                    </motion.div>
                  </div>

                  {/* Payment history */}
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                    className="bg-white/60 backdrop-blur-[24px] rounded-[32px] border border-white/60 p-8 shadow-[0_8px_32px_rgba(0,0,0,0.04)]"
                  >
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-black text-[#222222] tracking-tight">Historique des paiements</h3>
                      <Link to="/payment" className="text-[13px] font-black uppercase text-[#FF385C] hover:text-[#e8152e] flex items-center gap-1 bg-[#FF385C]/10 px-4 py-2 rounded-xl transition-colors shrink-0">
                        Voir tout <ChevronRight size={16} />
                      </Link>
                    </div>
                    <div className="space-y-4">
                      {payments.length === 0 ? (
                        <p className="text-sm text-[#717171] text-center py-10 font-bold">Aucun historique de paiement.</p>
                      ) : (
                        payments.map((pay, i) => (
                          <motion.div
                            whileHover={{ scale: 1.01, x: 5 }}
                            transition={{ duration: 0.2 }}
                            key={i}
                            className="flex items-center justify-between p-5 bg-white/60 backdrop-blur-md rounded-[20px] border border-white/80 shadow-sm hover:shadow-md cursor-pointer group"
                          >
                            <div className="flex items-center gap-4">
                              <div className={`w-12 h-12 ${pay.statut === 'CONFIRME' ? 'bg-[#10B981]/10' : 'bg-orange-100'} border rounded-2xl shadow-inner flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                                {pay.statut === 'CONFIRME' ? <CheckCircle size={24} className="text-[#10B981]" /> : <Loader2 className="animate-spin text-orange-600" size={24} />}
                              </div>
                              <div>
                                <p className="font-extrabold text-[#222222] text-[15px]">{pay.methode}</p>
                                <p className="text-xs font-bold text-[#717171]">{new Date(pay.date_paiement).toLocaleDateString()}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-black text-[#222222] text-[15px]">{new Intl.NumberFormat('fr-FR').format(pay.montant)} CFA</p>
                              <p className={`text-[10px] font-black uppercase tracking-widest ${pay.statut === 'CONFIRME' ? 'text-[#10B981]' : 'text-orange-600'}`}>{pay.statut}</p>
                            </div>
                          </motion.div>
                        ))
                      )}
                    </div>
                  </motion.div>
                </div>

                {/* RIGHT: 1/3 */}
                <div className="space-y-6">

                  {/* Next payment card (Deep 3D Gradient Glass) */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    whileHover={{ y: -5, shadow: "0 25px 50px -12px rgba(255, 56, 92, 0.5)" }}
                    className="relative bg-gradient-to-br from-[#FF385C] via-[#E61E4D] to-[#BD1E59] rounded-[32px] p-8 text-white overflow-hidden shadow-[0_20px_40px_rgba(255,56,92,0.3)] transform-gpu transition-all duration-400"
                  >
                    {/* Glass reflections */}
                    <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/20 rounded-full blur-[80px] -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
                    <div className="absolute bottom-[-10%] left-[-10%] w-[200px] h-[200px] bg-black/20 rounded-full blur-[40px] pointer-events-none" />
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />
                    
                    <div className="relative z-10">
                      <div className="flex items-center gap-2 mb-6 bg-black/20 w-max px-4 py-2 rounded-2xl backdrop-blur-md border border-white/10">
                        <Calendar size={16} className="text-white" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-white">Prochain loyer</p>
                      </div>
                      <p className="text-4xl font-black mb-2 tracking-tight drop-shadow-md">{new Intl.NumberFormat('fr-FR').format(bail.bien.prix)} <span className="text-2xl opacity-80 font-bold">F</span></p>
                      <p className="text-sm font-bold opacity-80 mb-8 flex items-center gap-2">
                        <span className="w-2 h-2 bg-white rounded-full shadow-[0_0_10px_white]" />
                        À régler avant le {new Date(bail.date_fin).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
                      </p>
                      <Link
                        to="/payment"
                        state={{ amount: bail.bien.prix, propertyId: bail.bien.id, propertyTitle: bail.bien.titre }}
                        className="block w-full bg-white/95 backdrop-blur-sm text-[#E61E4D] font-black py-4 rounded-[20px] text-center text-[15px] hover:bg-white hover:scale-[1.02] hover:shadow-[0_0_20px_white] active:scale-95 transition-all duration-300 shadow-xl"
                      >
                        Régler maintenant
                      </Link>
                    </div>
                  </motion.div>

                  {/* Quick actions (Glass) */}
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="bg-white/50 backdrop-blur-[24px] rounded-[32px] border border-white/60 p-7 shadow-[0_8px_32px_rgba(0,0,0,0.04)]"
                  >
                    <h3 className="font-black text-[#222222] tracking-tight mb-5 text-lg">Actions rapides</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { label: 'Payer loyer',    icon: CreditCard, to: '/payment', state: { amount: bail.bien.prix, propertyId: bail.bien.id, propertyTitle: bail.bien.titre }, bg: 'bg-[#FF385C]/10',  color: 'text-[#FF385C]', border: 'border-[#FF385C]/20' },
                        { label: 'Mon dossier',    icon: FileText,   to: '/dossier',     bg: 'bg-blue-500/10',   color: 'text-blue-500', border: 'border-blue-500/20' },
                        { label: 'Maintenance',    icon: Wrench,     to: '/maintenance', bg: 'bg-[#E9A319]/10',  color: 'text-[#E9A319]', border: 'border-amber-500/20' },
                        { label: 'Rechercher',     icon: Search,     to: '/',            bg: 'bg-[#10B981]/10',  color: 'text-[#10B981]', border: 'border-emerald-500/20' },
                      ].map((action, i) => (
                        <Link
                          key={i}
                          to={action.to}
                          state={action.state}
                          className="flex flex-col items-center gap-3 p-5 rounded-[24px] bg-white/60 hover:bg-white backdrop-blur-md transition-all duration-300 border border-white/80 shadow-sm hover:shadow-xl hover:-translate-y-1 active:scale-95 group"
                        >
                          <div className={`w-12 h-12 ${action.bg} ${action.border} border rounded-[18px] flex items-center justify-center ${action.color} group-hover:scale-110 group-hover:rotate-6 transition-all duration-400 shadow-inner`}>
                            <action.icon size={22} strokeWidth={2.5} />
                          </div>
                          <span className="text-[12px] font-extrabold text-[#222222] text-center tracking-wide">{action.label}</span>
                        </Link>
                      ))}
                    </div>
                  </motion.div>

                  {/* Upcoming Visits */}
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                    className="bg-white/50 backdrop-blur-[24px] rounded-[32px] border border-white/60 p-7 shadow-[0_8px_32px_rgba(0,0,0,0.04)]"
                  >
                    <h3 className="font-black text-[#222222] tracking-tight mb-5 text-lg">Visites planifiées</h3>
                    <div className="bg-white/80 rounded-2xl p-4 border border-[#EBEBEB] shadow-sm flex items-start gap-4 hover:shadow-md transition-shadow cursor-pointer group">
                      <div className="bg-[#fff0f1] p-3 rounded-xl text-[#FF385C] group-hover:scale-110 transition-transform">
                          <Calendar size={20} />
                      </div>
                      <div>
                          <p className="font-bold text-[#222222] text-sm">Villa avec Piscine</p>
                          <p className="text-xs text-[#717171] mt-1">Baguida, Lomé</p>
                          <div className="flex gap-3 mt-3 text-xs font-semibold">
                              <span className="bg-[#EBEBEB]/50 px-2 py-1 rounded-md text-[#222222]">12 Avril 2026</span>
                              <span className="bg-[#EBEBEB]/50 px-2 py-1 rounded-md text-[#222222]">14:30</span>
                          </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Documents (Glass) */}
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                    className="bg-white/50 backdrop-blur-[24px] rounded-[32px] border border-white/60 p-7 shadow-[0_8px_32px_rgba(0,0,0,0.04)] block"
                  >
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-lg font-black text-[#222222] tracking-tight">Documents</h3>
                      <button className="p-2.5 hover:bg-white/80 rounded-[14px] transition-colors border border-transparent hover:border-white shadow-sm hover:shadow-md">
                        <Plus size={20} className="text-gray-600" />
                      </button>
                    </div>
                    <div className="space-y-4">
                      {docs.map((doc, i) => (
                        <motion.div 
                          whileHover={{ scale: 1.02 }}
                          transition={{ duration: 0.2 }}
                          key={i} 
                          className="flex items-center justify-between p-4 bg-white/60 backdrop-blur-md rounded-[20px] group border border-white/80 hover:border-white shadow-sm hover:shadow-lg cursor-pointer"
                        >
                          <div className="flex items-center gap-4 min-w-0">
                            <div className="w-12 h-12 bg-gray-100 rounded-[16px] flex items-center justify-center flex-shrink-0 border border-white shadow-inner group-hover:bg-[#FF385C]/10 group-hover:text-[#FF385C] transition-colors duration-300">
                              <FileText size={20} className="text-[#717171] group-hover:text-[#FF385C] transition-colors" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-[13px] font-extrabold text-[#222222] truncate max-w-[130px]">{doc.name}</p>
                              <p className="text-[11px] font-bold text-[#b0b0b0] tracking-wide mt-0.5">{doc.size} · {doc.date}</p>
                            </div>
                          </div>
                          <button className="p-2.5 bg-[#F9FAFB] group-hover:bg-white text-[#b0b0b0] group-hover:text-[#FF385C] rounded-[14px] transition-all duration-300 shadow-sm border border-transparent group-hover:border-white">
                            <FileDown size={18} />
                          </button>
                        </motion.div>
                      ))}
                    </div>
                    <Link
                      to="/dossier"
                      className="mt-6 w-full flex items-center justify-center gap-2 text-[13px] font-black uppercase text-[#b0b0b0] hover:text-[#222222] transition-colors py-3 rounded-2xl hover:bg-white/60"
                    >
                      <Shield size={16} /> Coffre-fort numérique
                    </Link>
                  </motion.div>

                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}