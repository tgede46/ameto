import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Mail, Lock, Eye, EyeOff, Loader2, Home, ArrowRight } from 'lucide-react';
import { loginStart, loginSuccess, loginFailure } from '../store/slices/authSlice';
import authService from '../services/authService';
import Button from '../components/common/Button';
import logoAmeto from '../assets/logo_ameto.png';
import toast from 'react-hot-toast';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const { loading, error, isAuthenticated, user } = useSelector((state) => state.auth);

  // Rediriger si déjà connecté
  useEffect(() => {
    if (isAuthenticated && user) {
      const role = user.role?.toUpperCase();
      const from = location.state?.from?.pathname;
      
      if (from && from !== '/login') {
        navigate(from, { replace: true });
      } else if (role === 'ADMIN') {
        navigate('/admin/dashboard', { replace: true });
      } else if (role === 'PROPRIETAIRE') {
        navigate('/owner/dashboard', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate, location]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(loginStart());
    
    try {
      const data = await authService.login(formData);
      dispatch(loginSuccess({
        user: data.utilisateur,
        token: data.access
      }));
      
      toast.success('Connexion réussie !');
      
      // Redirect based on role
      const role = data.utilisateur.role?.toUpperCase();
      if (role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else if (role === 'PROPRIETAIRE') {
        navigate('/owner/dashboard');
      } else {
        navigate('/');
      }
    } catch (err) {
      const message = err.response?.data?.detail || 'Identifiants incorrects';
      dispatch(loginFailure(message));
      toast.error(message);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col md:flex-row font-sans">
      {/* Panel visuel (Gauche) */}
      <div className="hidden md:flex md:w-[50%] lg:w-[60%] relative overflow-hidden bg-gray-900">
        <motion.div 
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          className="absolute inset-0 w-full h-full"
        >
          <img
            src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop"
            alt="Immobilier Moderne"
            className="w-full h-full object-cover opacity-50"
          />
        </motion.div>

        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent" />
        
        <div className="relative z-10 flex flex-col justify-between p-12 lg:p-16 w-full">
          <Link to="/" className="inline-block hover:scale-105 transition-transform duration-300">
            <img src={logoAmeto} alt="Amétô" className="h-12 w-auto object-contain brightness-0 invert" />
          </Link>

          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-md px-5 py-3 rounded-full mb-8 border border-white/20"
            >
              <div className="w-10 h-10 bg-brand-500 rounded-full flex items-center justify-center shadow-lg shadow-brand-500/30">
                <Home size={18} className="text-white" />
              </div>
              <span className="text-white font-semibold text-sm tracking-wide">Espace de Gestion Professionnel</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="text-4xl lg:text-5xl xl:text-6xl font-extrabold text-white mb-6 leading-tight tracking-tight"
            >
              Pilotez votre patrimoine<br />
              <span className="text-brand-500">en toute sérénité.</span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="text-gray-300 text-lg max-w-lg"
            >
              La plateforme de gestion immobilière de référence au Togo pour les agences et les propriétaires exigeants.
            </motion.p>
          </div>

          
        </div>
      </div>

      {/* Formulaire de connexion (Droite) */}
      <div className="flex-1 flex flex-col justify-center px-8 sm:px-12 lg:px-24 py-12 bg-white relative">
        <div className="md:hidden mb-12">
          <img src={logoAmeto} alt="Amétô" className="h-10 w-auto object-contain" />
        </div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md mx-auto"
        >
          <div className="mb-10">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Bienvenue</h2>
            <p className="text-gray-500">Connectez-vous pour accéder à votre tableau de bord.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-widest">
                Email Professionnel
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-brand-500 transition-colors">
                  <Mail size={20} strokeWidth={2} />
                </div>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="block w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all duration-200"
                  placeholder="nom@exemple.com"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <label className="block text-sm font-bold text-gray-700 uppercase tracking-widest">
                  Mot de passe
                </label>
                <Link to="#" className="text-sm font-semibold text-brand-500 hover:text-brand-600 transition-colors">
                  Oublié ?
                </Link>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-brand-500 transition-colors">
                  <Lock size={20} strokeWidth={2} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="block w-full pl-12 pr-12 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all duration-200"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="flex items-center">
              <input
                id="remember-me"
                type="checkbox"
                className="h-4 w-4 text-brand-500 focus:ring-brand-500 border-gray-300 rounded-lg cursor-pointer"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-600 cursor-pointer">
                Rester connecté
              </label>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="p-4 bg-brand-50 border border-brand-500/20 rounded-xl text-brand-500 text-sm font-medium"
              >
                {error}
              </motion.div>
            )}

            <Button
              type="submit"
              variant="primary"
              className="w-full py-4 rounded-2xl flex items-center justify-center gap-2 text-lg font-bold shadow-xl shadow-brand-500/20"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="animate-spin" size={24} />
              ) : (
                <>
                  Se connecter
                  <ArrowRight size={20} />
                </>
              )}
            </Button>
          </form>

          <div className="mt-12 pt-8 border-t border-gray-100">
            <p className="text-center text-gray-500 text-sm">
              Vous n'avez pas encore de compte ?{' '}
              <Link to="#" className="font-bold text-gray-900 hover:text-brand-500 transition-colors">
                Contactez l'agence Amétô
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
