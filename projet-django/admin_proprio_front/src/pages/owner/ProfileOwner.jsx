import React, { useState } from 'react';
import Card, { CardBody, CardHeader } from '../../components/common/Card';
import Button from '../../components/common/Button';
import { User, Mail, Phone, MapPin, CreditCard, Save, Edit2 } from 'lucide-react';

const ProfileOwner = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: 'M. Koffi Mensah',
    email: 'koffi@immo.com',
    phone: '+228 90 00 00 00',
    address: 'Lomé, Togo',
    bankAccount: 'TG1234567890',
    tMoney: '123456789',
    flooz: '123456789',
  });
  
  const [formData, setFormData] = useState(profile);
  
  const handleSave = () => {
    setProfile(formData);
    setIsEditing(false);
  };
  
  const handleCancel = () => {
    setFormData(profile);
    setIsEditing(false);
  };
  
  const ProfileField = ({ icon: Icon, label, value, name, type = 'text' }) => (
    <div className="flex items-start space-x-3 p-4 border border-border rounded-xl hover:bg-gray-50 transition-colors">
      <div className="p-2 bg-brand-50 rounded-lg">
        <Icon size={20} className="text-brand-500" />
      </div>
      <div className="flex-1">
        <p className="text-secondary text-sm">{label}</p>
        {isEditing ? (
          <input
            type={type}
            value={formData[name]}
            onChange={(e) => setFormData({ ...formData, [name]: e.target.value })}
            className="input-field mt-1"
          />
        ) : (
          <p className="font-medium text-primary mt-1">{value || 'Non renseigné'}</p>
        )}
      </div>
    </div>
  );
  
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-primary">Mon profil</h1>
          <p className="text-secondary mt-2">Gérez vos informations personnelles et bancaires</p>
        </div>
        {!isEditing ? (
          <Button variant="primary" onClick={() => setIsEditing(true)}>
            <Edit2 size={20} className="mr-2" />
            Modifier
          </Button>
        ) : (
          <div className="flex space-x-3">
            <Button variant="outline" onClick={handleCancel}>
              Annuler
            </Button>
            <Button variant="primary" onClick={handleSave}>
              <Save size={20} className="mr-2" />
              Enregistrer
            </Button>
          </div>
        )}
      </div>
      
      {/* Profile Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <h3 className="text-lg font-bold">Informations personnelles</h3>
          </CardHeader>
          <CardBody className="space-y-4">
            <ProfileField icon={User} label="Nom complet" value={profile.name} name="name" />
            <ProfileField icon={Mail} label="Email" value={profile.email} name="email" type="email" />
            <ProfileField icon={Phone} label="Téléphone" value={profile.phone} name="phone" />
            <ProfileField icon={MapPin} label="Adresse" value={profile.address} name="address" />
          </CardBody>
        </Card>
        
        <Card>
          <CardHeader>
            <h3 className="text-lg font-bold">Coordonnées bancaires</h3>
          </CardHeader>
          <CardBody className="space-y-4">
            <ProfileField icon={CreditCard} label="Compte bancaire" value={profile.bankAccount} name="bankAccount" />
            <ProfileField icon={Phone} label="T-Money" value={profile.tMoney} name="tMoney" />
            <ProfileField icon={Phone} label="Flooz" value={profile.flooz} name="flooz" />
          </CardBody>
        </Card>
      </div>
      
      {/* Account Security */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-bold">Sécurité du compte</h3>
        </CardHeader>
        <CardBody>
          <div className="flex justify-between items-center p-4 border border-border rounded-xl">
            <div>
              <p className="font-medium">Mot de passe</p>
              <p className="text-secondary text-sm">Dernière modification il y a 3 mois</p>
            </div>
            <Button variant="outline" size="sm">
              Changer
            </Button>
          </div>
          <div className="flex justify-between items-center p-4 border border-border rounded-xl mt-4">
            <div>
              <p className="font-medium">Authentification à deux facteurs</p>
              <p className="text-secondary text-sm">Sécurisez votre compte</p>
            </div>
            <Button variant="outline" size="sm">
              Activer
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default ProfileOwner;