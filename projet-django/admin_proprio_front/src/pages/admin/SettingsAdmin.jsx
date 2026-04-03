import React, { useState } from 'react';
import Card, { CardBody, CardHeader } from '../../components/common/Card';
import Button from '../../components/common/Button';

const SettingsAdmin = () => {
  const [settings, setSettings] = useState({ siteName: 'ImmoTech', email: 'contact@immotech.tg', phone: '+228 90 00 00 00', address: 'Lomé, Togo' });

  return (
    <div className="space-y-6 animate-fade-in">
      <div><h1 className="text-3xl font-bold text-primary">Paramètres</h1><p className="text-secondary mt-2">Configuration de la plateforme</p></div>
      <Card><CardHeader><h3 className="text-lg font-bold">Informations générales</h3></CardHeader><CardBody className="space-y-4">
        <div><label className="block text-sm font-medium mb-2">Nom du site</label><input type="text" className="input-field" value={settings.siteName} onChange={(e) => setSettings({...settings, siteName: e.target.value})} /></div>
        <div><label className="block text-sm font-medium mb-2">Email de contact</label><input type="email" className="input-field" value={settings.email} onChange={(e) => setSettings({...settings, email: e.target.value})} /></div>
        <div><label className="block text-sm font-medium mb-2">Téléphone</label><input type="text" className="input-field" value={settings.phone} onChange={(e) => setSettings({...settings, phone: e.target.value})} /></div>
        <div><label className="block text-sm font-medium mb-2">Adresse</label><input type="text" className="input-field" value={settings.address} onChange={(e) => setSettings({...settings, address: e.target.value})} /></div>
        <Button variant="primary">Enregistrer</Button>
      </CardBody></Card>
    </div>
  );
};

export default SettingsAdmin;
