import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, Globe, Menu, UserCircle, X, MapPin, Calendar, Users, Heart, Bell } from 'lucide-react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import CalendarPicker from './CalendarPicker';
import logo from '../assets/logo_ameto.png';

export default function Header() {
  const { profile: user, isAuthenticated: isLoggedIn } = useSelector((state) => state.user);
  const { scrollY } = useScroll();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSearchTab, setActiveSearchTab] = useState('dates');
  const menuRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Glassmorphism dynamic background based on scroll
  const isHome = location.pathname === '/';
  // Liquid glass header: slightly see-through white at top, blurry white on scroll
  const headerBg = useTransform(
    scrollY,
    [0, 80],
    isHome ? ['rgba(255,255,255,0)', 'rgba(255,255,255,0.7)'] : ['rgba(255,255,255,0.7)', 'rgba(255,255,255,0.7)']
  );
  const headerShadow = useTransform(
    scrollY,
    [0, 80],
    isHome ? ['0 0 0 rgba(0,0,0,0)', '0 8px 32px rgba(0,0,0,0.06)'] : ['0 8px 32px rgba(0,0,0,0.06)', '0 8px 32px rgba(0,0,0,0.06)']
  );
  const borderOpacity = useTransform(
    scrollY,
    [0, 80],
    isHome ? [0, 1] : [1, 1]
  );
  const backdropBlur = useTransform(
    scrollY,
    [0, 80],
    isHome ? ['blur(0px)', 'blur(24px)'] : ['blur(24px)', 'blur(24px)']
  );

  useEffect(() => {
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setIsMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isSearchOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isSearchOpen]);

  const handleSearch = (e) => {
    e.preventDefault();
    setIsSearchOpen(false);
    navigate('/');
  };

  const searchTabs = [
    { id: 'location', label: 'Destination', placeholder: 'Où allez-vous ?', icon: MapPin },
    { id: 'dates', label: "Dates", placeholder: 'Quand commencez-vous ?', icon: Calendar },
    { id: 'guests', label: 'Voyageurs', placeholder: 'Combien de locataires ?', icon: Users },
  ];

  const borderColor = useTransform(borderOpacity, [0, 1], ['rgba(255,255,255,0)', 'rgba(255,255,255,0.5)']);

  return (
    <>
      {/* ======= SEARCH OVERLAY (LIQUID GLASS) ======= */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.25, 1, 0.5, 1] }}
            className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-[32px]"
            onClick={() => setIsSearchOpen(false)}
          >
            {/* 3D Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -40, rotateX: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20, rotateX: 10 }}
              transition={{ duration: 0.4, type: "spring", bounce: 0.3 }}
              style={{ transformStyle: 'preserve-3d' }}
              className="mx-auto mt-6 w-full max-w-4xl px-4"
              onClick={e => e.stopPropagation()}
            >
              <div className="bg-white/60 backdrop-blur-[24px] rounded-[40px] shadow-[0_32px_80px_rgba(0,0,0,0.15)] overflow-hidden border border-white/80">
                <div className="flex justify-between items-center border-b border-white/40 px-8 pt-8 pb-3 relative">
                  <div className="flex gap-10">
                    {searchTabs.map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveSearchTab(tab.id)}
                        className={`pb-4 text-[16px] font-black transition-all duration-300 relative ${activeSearchTab === tab.id ? 'text-gray-900 drop-shadow-sm' : 'text-gray-500 hover:text-gray-900'
                          }`}
                      >
                        {tab.label}
                        {activeSearchTab === tab.id && (
                          <motion.div
                            layoutId="searchTabIndicator"
                            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                            className="absolute -bottom-[1px] left-0 right-0 h-[3px] bg-gray-900 rounded-full z-10 shadow-[0_0_10px_rgba(0,0,0,0.2)]"
                          />
                        )}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setIsSearchOpen(false)}
                    className="p-2 mb-2 bg-white/40 border border-white/60 hover:bg-white rounded-full transition-all shadow-sm text-gray-500 hover:text-gray-900 duration-300 hover:rotate-90"
                  >
                    <X size={20} strokeWidth={2.5} />
                  </button>
                </div>

                <div className="p-8 pb-4">
                  <AnimatePresence mode="wait">
                    {activeSearchTab !== 'dates' ? (
                      <motion.div
                        key="search_input"
                        initial={{ opacity: 0, y: 10, rotateX: 5 }}
                        animate={{ opacity: 1, y: 0, rotateX: 0 }}
                        exit={{ opacity: 0, y: -10, rotateX: -5 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="flex items-center gap-4 bg-white/50 backdrop-blur-md rounded-3xl px-6 py-5 border-[3px] border-white/60 focus-within:border-brand-500 focus-within:bg-white transition-all duration-400 shadow-inner group">
                          {activeSearchTab === 'location' ? <MapPin size={26} className="text-gray-400 group-focus-within:text-brand-500 flex-shrink-0 transition-colors" strokeWidth={2.5} /> : <Users size={26} className="text-gray-400 group-focus-within:text-brand-500 flex-shrink-0 transition-colors" strokeWidth={2.5} />}
                          <input
                            autoFocus
                            type="text"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            placeholder={activeSearchTab === 'location' ? "Où allez-vous ?" : "Combien de locataires ?"}
                            className="flex-1 bg-transparent text-gray-900 font-extrabold text-xl outline-none placeholder:font-bold placeholder:text-gray-500"
                          />
                          {searchQuery && (
                            <button onClick={() => setSearchQuery('')} className="p-2 bg-gray-200 hover:bg-gray-300 rounded-full text-gray-500 hover:text-gray-900 transition-colors">
                              <X size={16} strokeWidth={3} />
                            </button>
                          )}
                        </div>

                        {/* Suggestions (Glassy cards) */}
                        {activeSearchTab === 'location' && (
                          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.4 }} className="mt-8 space-y-2">
                            <p className="text-xs font-black text-gray-500 uppercase tracking-widest mb-4 px-2">Recherches récentes</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {['Tokoin, Lomé', 'Baguida, Lomé', 'Agoè, Lomé', 'Kégué, Lomé'].map((loc, i) => (
                                <button
                                  key={i}
                                  onClick={() => { setSearchQuery(loc); }}
                                  className="flex items-center gap-4 p-3 bg-white/40 border border-white/60 hover:bg-white rounded-2xl text-left transition-all duration-300 group hover:shadow-lg active:scale-95"
                                >
                                  <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center group-hover:bg-brand-50 group-hover:scale-110 transition-all duration-400 shadow-inner">
                                    <MapPin size={20} className="text-gray-500 group-hover:text-brand-500 transition-colors" strokeWidth={2.5} />
                                  </div>
                                  <span className="text-[16px] font-extrabold text-gray-800 tracking-tight">{loc}</span>
                                </button>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </motion.div>
                    ) : (
                      <motion.div
                        key="calendar_picker"
                        initial={{ opacity: 0, scale: 0.98, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.98, y: -10 }}
                        transition={{ duration: 0.4 }}
                      >
                        {/* Intégration du composant CalendarPicker avec FullCalendar */}
                        <CalendarPicker isDouble={true} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {activeSearchTab !== 'dates' && (
                  <div className="px-8 pb-8 pt-4 flex justify-between items-center border-t border-white/20 mt-4">
                    <button onClick={() => setSearchQuery('')} className="text-sm font-extrabold text-gray-500 hover:text-gray-900 px-5 py-3 rounded-xl hover:bg-white/40 transition-all duration-300">
                      Effacer tout
                    </button>
                    <motion.button
                      whileHover={{ scale: 1.05, shadow: "0 15px 30px rgba(255,56,92,0.4)" }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleSearch}
                      className="bg-brand-500 text-white font-extrabold px-10 py-4 shadow-xl shadow-brand-500/30 rounded-[20px] text-[16px] flex items-center transition-all duration-300"
                    >
                      <Search size={20} className="mr-2" strokeWidth={3} />
                      Rechercher
                    </motion.button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ======= HEADER (Sticky Liquid Glass) ======= */}
      <motion.header
        style={{
          backgroundColor: headerBg,
          boxShadow: headerShadow,
          backdropFilter: backdropBlur,
          WebkitBackdropFilter: backdropBlur,
          borderBottomColor: borderColor,
          borderBottomWidth: 1,
          borderBottomStyle: 'solid'
        }}
        className="sticky top-0 z-50 transition-colors duration-400"
      >
        <div className="max-w-[1440px] mx-auto px-6 h-[90px] flex items-center justify-between gap-6">

          {/* Logo */}
          <Link to="/" className="flex items-center flex-shrink-0 group">
            <motion.img
              whileHover={{ rotate: [-2, 2, -2, 0], scale: 1.05 }}
              transition={{ duration: 0.4 }}
              src={logo}
              alt="Amétô"
              className="h-10 w-auto object-contain drop-shadow-md"
            />
          </Link>

          {/* Big central search button (Glass pill) */}
          <motion.div
            className="hidden md:flex flex-1 max-w-[600px]"
            whileHover={{ y: -2, scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.3 }}
          >
            <button
              onClick={() => setIsSearchOpen(true)}
              className="w-full h-[56px] bg-white/70 backdrop-blur-md border border-white/60 hover:bg-white hover:border-white shadow-[0_4px_16px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.1)] transition-all duration-300 rounded-[30px] flex items-center px-2 group"
            >
              <span className="flex-1 px-5 text-[14px] font-black text-gray-900 border-r border-gray-200/60 drop-shadow-sm group-hover:text-black">
                N'importe où
              </span>
              <span className="flex-1 px-5 text-[14px] font-black text-gray-900 border-r border-gray-200/60 drop-shadow-sm hidden lg:block group-hover:text-black">
                Dates flexibles
              </span>
              <span className="flex-1 px-5 text-[14px] font-bold text-gray-500 text-left truncate group-hover:text-gray-900 transition-colors">
                Ajouter des voyageurs
              </span>
              <span className="w-10 h-10 bg-brand-500 rounded-full flex items-center justify-center text-white flex-shrink-0 group-hover:bg-brand-600 transition-colors shadow-lg shadow-brand-500/30 ml-1">
                <Search size={16} strokeWidth={3} />
              </span>
            </button>
          </motion.div>

          {/* User & Global actions */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <Link
              to="/register"
              className="hidden lg:flex text-[14px] font-extrabold px-6 py-3.5 rounded-full hover:bg-white/60 hover:shadow-sm transition-all duration-300 text-gray-900 drop-shadow-sm"
            >
              Publier une annonce
            </Link>

            <button className="p-3.5 rounded-full hover:bg-white/60 hover:shadow-sm transition-all duration-300 hidden md:flex text-gray-800">
              <Globe size={20} strokeWidth={2.5} />
            </button>

            {/* Profile Dropdown (Glass Button) */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex items-center gap-2.5 border border-white/60 bg-white/60 backdrop-blur-md shadow-sm hover:shadow-md hover:bg-white transition-all duration-300 rounded-full p-2 pl-3 ml-2"
              >
                <Menu size={20} className="text-gray-800" strokeWidth={2.5} />
                <span className="text-gray-500">
                  {isLoggedIn && user ? (
                    <div className="w-8 h-8 rounded-full bg-[#FF385C] flex items-center justify-center text-white font-black text-xs shadow-sm">
                      {user.username?.[0]?.toUpperCase()}
                    </div>
                  ) : (
                    <UserCircle size={32} strokeWidth={2} className="text-gray-600 drop-shadow-sm" />
                  )}
                </span>
              </button>

              <AnimatePresence>
                {isMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 15, rotateX: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 15, rotateX: -10 }}
                    transition={{ duration: 0.3, type: "spring", bounce: 0.4 }}
                    style={{ transformStyle: 'preserve-3d' }}
                    className="absolute right-0 top-full mt-4 w-[280px] bg-white/70 backdrop-blur-[24px] rounded-[24px] border border-white/60 shadow-[0_20px_40px_rgba(0,0,0,0.1)] py-3 z-[100] overflow-hidden"
                  >
                    {!isLoggedIn ? (
                      <div className="py-2 border-b border-gray-100/50 mb-2">
                        <Link to="/register" onClick={() => setIsMenuOpen(false)} className="block px-6 py-3 text-[15px] font-black text-gray-900 hover:bg-white/60 transition-colors">
                          S'inscrire
                        </Link>
                        <Link to="/login" onClick={() => setIsMenuOpen(false)} className="block px-6 py-3 text-[15px] font-bold text-gray-600 hover:bg-white/60 transition-colors">
                          Se connecter
                        </Link>
                      </div>
                    ) : (
                      <div className="py-2 border-b border-gray-100/50 mb-2 px-6 pb-4 pt-2">
                        <p className="font-extrabold text-gray-900 drop-shadow-sm truncate">{user.first_name} {user.last_name}</p>
                        <p className="text-sm font-bold text-gray-500 tracking-wide">{user.role}</p>
                      </div>
                    )}

                    <div className="py-1">
                      <Link to="/dashboard" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 px-6 py-3 text-[15px] font-bold text-gray-700 hover:bg-white/60 hover:text-gray-900 transition-colors group">
                        <UserCircle size={20} className="text-gray-400 group-hover:text-brand-500 transition-colors" strokeWidth={2.5} /> Mon tableau de bord
                      </Link>
                      <Link to="/favorites" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 px-6 py-3 text-[15px] font-bold text-gray-700 hover:bg-white/60 hover:text-gray-900 transition-colors group">
                        <Heart size={20} className="text-gray-400 group-hover:text-brand-500 transition-colors" strokeWidth={2.5} /> Mes favoris
                      </Link>
                      <Link to="/payment" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 px-6 py-3 text-[15px] font-bold text-gray-700 hover:bg-white/60 hover:text-gray-900 transition-colors group">
                        <Bell size={20} className="text-gray-400 group-hover:text-brand-500 transition-colors" strokeWidth={2.5} /> Paiements & Alertes
                      </Link>
                    </div>

                    <div className="border-t border-gray-100/50 mt-2 py-2">
                      <Link to="/maintenance" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 px-6 py-3 text-[15px] font-bold text-gray-700 hover:bg-white/60 hover:text-gray-900 transition-colors group">
                        <Globe size={20} className="text-gray-400 group-hover:text-brand-500 transition-colors" strokeWidth={2.5} /> Centre d'aide
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button
              onClick={() => setIsSearchOpen(true)}
              className="md:hidden p-3.5 bg-white/60 backdrop-blur-md rounded-full border border-white/60 shadow-sm hover:shadow-md transition-all ml-2"
            >
              <Search size={20} className="text-gray-900" strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </motion.header>
    </>
  );
}