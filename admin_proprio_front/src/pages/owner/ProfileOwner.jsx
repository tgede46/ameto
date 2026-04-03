import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateProfile } from '../../store/slices/authSlice';
import Card, { CardBody, CardHeader } from '../../components/common/Card';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { User, Mail, Phone, MapPin, CreditCard, Save, Edit2, Shield, Smartphone } from 'lucide-react';
import toast from 'react-hot-toast';

const ProfileOwner = () => {
  const dispatch = useDispatch();
  const { user, loading } = useSelector(state => state.auth);
  const [isEditing, setIsEditing] = useState(false);
  
  const [formData, setFormData] = useState({
    prenom: '',
    nom: '',
    email: '',
    telephone: '',
    adresse: '',
    compte_bancaire: '',
    tmoney: '',
    flooz: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        prenom: user.prenom || '',
        nom: user.nom || '',
        email: user.email || '',
        telephone: user.telephone || '',
        adresse: user.adresse || '',
        compte_bancaire: user.compte_bancaire || '',
        tmoney: user.tmoney || '',
        flooz: user.flooz || '',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      const resultAction = await dispatch(updateProfile(formData));
      if (updateProfile.fulfilled.match(resultAction)) {
        toast.success('Profil mis à jour avec succès !');
        setIsEditing(false);
      } else {
        toast.error(resultAction.payload?.detail || 'Erreur lors de la mise à jour');
      }
    } catch (err) {
      toast.error('Une erreur est survenue');
    }
  };
  
  const handleCancel = () => {
    if (user) {
      setFormData({
        prenom: user.prenom || '',
        nom: user.nom || '',
        email: user.email || '',
        telephone: user.telephone || '',
        adresse: user.adresse || '',
        compte_bancaire: user.compte_bancaire || '',
        tmoney: user.tmoney || '',
        flooz: user.flooz || '',
      });
    }
    setIsEditing(false);
  };
  
  const ProfileField = ({ icon: Icon, label, value, name, type = 'text' }) => (
    <div className="flex items-start space-x-4 p-5 border border-gray-100 rounded-2xl hover:bg-gray-50/50 transition-all group">
      <div className="p-3 bg-brand-50 rounded-xl text-brand-500 group-hover:scale-110 transition-transform">
        <Icon size={20} />
      </div>
      <div className="flex-1">
        <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-1">{label}</p>
        {isEditing ? (
          <input
            type={type}
            name={name}
            value={formData[name]}
            onChange={handleChange}
            className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all"
          />
        ) : (
          <p className="font-bold text-gray-900">{value || <span className="text-gray-300 font-normal italic">Non renseigné</span>}</p>
        )}
      </div>
    </div>
  );
  
  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">Mon profil</h1>
          <p className="text-gray-500 mt-2">Gérez vos informations personnelles et vos coordonnées de paiement</p>
        </div>
        {!isEditing ? (
          <Button variant="primary" className="rounded-xl px-6 shadow-lg shadow-brand-500/20" onClick={() => setIsEditing(true)}>
            <Edit2 size={20} className="mr-2" />
            Modifier le profil
          </Button>
        ) : (
          <div className="flex space-x-3">
            <Button variant="outline" className="rounded-xl px-6" onClick={handleCancel}>
              Annuler
            </Button>
            <Button variant="primary" className="rounded-xl px-6 shadow-lg shadow-brand-500/20" onClick={handleSave} disabled={loading}>
              {loading ? <LoadingSpinner size="small" /> : <><Save size={20} className="mr-2" /> Enregistrer</>}
            </Button>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Personal Info */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="border-0 shadow-sm overflow-hidden">
            <CardHeader className="p-6 bg-gray-50/50 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <User size={20} className="text-brand-500" />
                <h3 className="text-lg font-bold text-gray-900">Informations personnelles</h3>
              </div>
            </CardHeader>
            <CardBody className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <ProfileField icon={User} label="Prénom" value={formData.prenom} name="prenom" />
              <ProfileField icon={User} label="Nom" value={formData.nom} name="nom" />
              <ProfileField icon={Mail} label="Email professionnel" value={formData.email} name="email" type="email" />
              <ProfileField icon={Phone} label="Téléphone" value={formData.telephone} name="telephone" />
              <div className="md:col-span-2">
                <ProfileField icon={MapPin} label="Adresse de résidence" value={formData.adresse} name="adresse" />
              </div>
            </CardBody>
          </Card>

          <Card className="border-0 shadow-sm overflow-hidden">
            <CardHeader className="p-6 bg-gray-50/50 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Shield size={20} className="text-brand-500" />
                <h3 className="text-lg font-bold text-gray-900">Sécurité du compte</h3>
              </div>
            </CardHeader>
            <CardBody className="p-8">
              <div className="flex flex-col md:flex-row justify-between items-center p-6 bg-gray-50 rounded-2xl gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white rounded-xl shadow-sm">
                    <Shield className="text-brand-500" size={24} />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">Mot de passe</p>
                    <p className="text-gray-500 text-xs">Dernière modification il y a 3 mois</p>
                  </div>
                </div>
                <Button variant="outline" className="rounded-xl px-6 bg-white border-gray-200">
                  Changer le mot de passe
                </Button>
              </div>
              
              <div className="flex flex-col md:flex-row justify-between items-center p-6 bg-gray-50 rounded-2xl gap-4 mt-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white rounded-xl shadow-sm">
                    <Smartphone className="text-brand-500" size={24} />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">Double Authentification (2FA)</p>
                    <p className="text-gray-500 text-xs">Sécurisez vos accès via Google Authenticator</p>
                  </div>
                </div>
                <Button variant="outline" className="rounded-xl px-6 bg-white border-gray-200">
                  Configurer 2FA
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Right Column - Payment Methods */}
        <div className="space-y-8">
          <Card className="border-0 shadow-sm overflow-hidden">
            <CardHeader className="p-6 bg-gray-50/50 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <CreditCard size={20} className="text-brand-500" />
                <h3 className="text-lg font-bold text-gray-900">Moyens de paiement</h3>
              </div>
            </CardHeader>
            <CardBody className="p-6 space-y-6">
              <p className="text-sm text-gray-500 mb-4">Ces informations seront utilisées par l'agence pour vos versements de loyer.</p>
              
              <div className="space-y-4">
                <ProfileField icon={CreditCard} label="RIB / Compte bancaire" value={formData.compte_bancaire} name="compte_bancaire" />
                <ProfileField icon={Smartphone} label="Numéro T-Money" value={formData.tmoney} name="tmoney" />
                <ProfileField icon={Smartphone} label="Numéro Flooz" value={formData.flooz} name="flooz" />
              </div>

              <div className="p-6 bg-brand-50 rounded-2xl border border-brand-500/10 mt-6">
                <h4 className="font-bold text-brand-500 text-sm mb-2">Note importante</h4>
                <p className="text-gray-600 text-xs leading-relaxed">
                  Assurez-vous que vos numéros de mobile money sont corrects pour éviter tout retard dans vos paiements.
                </p>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProfileOwner;
