import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/common/Button';
import logoAmeto from '../assets/logo_ameto.png';

const Home = () => {
  const navigate = useNavigate();

  const goToLogin = () => {
    navigate('/login');
  };

  const handleCardKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      goToLogin();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 to-white">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <img src={logoAmeto} alt="Amétô" className="w-24 h-24 object-contain" />
          </div>
          
          <p className="text-xl text-secondary max-w-2xl mx-auto">
            Gérez votre patrimoine immobilier simplement et efficacement au Togo
          </p>
        </div>


        {/* Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <div
            className="bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 p-8 text-center group cursor-pointer"
            onClick={goToLogin}
            onKeyDown={handleCardKeyDown}
            role="button"
            tabIndex={0}
          >
              <div className="w-20 h-20 bg-brand-50 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-10 h-10 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-primary mb-2">Espace Propriétaire</h2>
              <p className="text-secondary mb-4">Gérez vos biens, suivez vos revenus et la maintenance</p>
              <Button variant="primary" className="w-full" onClick={goToLogin}>
                Accéder
              </Button>
          </div>

          <div
            className="bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 p-8 text-center group cursor-pointer"
            onClick={goToLogin}
            onKeyDown={handleCardKeyDown}
            role="button"
            tabIndex={0}
          >
              <div className="w-20 h-20 bg-brand-50 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-10 h-10 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-primary mb-2">Espace Admin</h2>
              <p className="text-secondary mb-4">Supervision globale, gestion des biens et des utilisateurs</p>
              <Button variant="primary" className="w-full" onClick={goToLogin}>
                Accéder
              </Button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Home;