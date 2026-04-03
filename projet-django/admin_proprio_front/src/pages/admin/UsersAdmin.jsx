import React, { useState } from 'react';
import Card, { CardBody, CardHeader } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import { Search, UserPlus, Edit, Trash2, Filter, Mail, Phone, X, Save } from 'lucide-react';

const UsersAdmin = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newUser, setNewUser] = useState({ name: '', email: '', phone: '', role: 'locataire', status: 'actif' });
  
  const [users, setUsers] = useState([
    { id: 1, name: 'M. Koffi', email: 'koffi@email.com', phone: '90 00 00 00', role: 'proprietaire', status: 'actif', properties: 5 },
    { id: 2, name: 'Mme Afi', email: 'afi@email.com', phone: '90 00 00 01', role: 'locataire', status: 'actif', properties: 1 },
    { id: 3, name: 'M. Yao', email: 'yao@email.com', phone: '90 00 00 02', role: 'admin', status: 'actif', properties: 0 },
  ]);
  
  const handleAddUser = () => {
    const newId = users.length + 1;
    setUsers([...users, { id: newId, ...newUser, properties: 0 }]);
    setShowAddModal(false);
    setNewUser({ name: '', email: '', phone: '', role: 'locataire', status: 'actif' });
  };
  
  const handleEditUser = () => {
    setUsers(users.map(u => u.id === selectedUser.id ? selectedUser : u));
    setShowEditModal(false);
  };
  
  const handleDeleteUser = (id) => {
    if (confirm('Supprimer cet utilisateur ?')) {
      setUsers(users.filter(u => u.id !== id));
    }
  };
  
  const filteredUsers = users.filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase()));
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div><h1 className="text-3xl font-bold text-primary">Gestion des utilisateurs</h1><p className="text-secondary mt-2">Gérez tous les utilisateurs de la plateforme</p></div>
        <Button variant="primary" onClick={() => setShowAddModal(true)}><UserPlus size={20} className="mr-2" />Ajouter un utilisateur</Button>
      </div>
      
      <Card><CardBody><div className="flex flex-col md:flex-row gap-4"><div className="flex-1 relative"><Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary" /><input type="text" placeholder="Rechercher..." className="input-field pl-10" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div><Button variant="outline"><Filter size={20} className="mr-2" />Filtres</Button></div></CardBody></Card>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredUsers.map(user => (
          <Card key={user.id}>
            <CardBody>
              <div className="flex justify-between items-start">
                <div className="flex space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-brand-500 to-brand-600 rounded-full flex items-center justify-center"><span className="text-white font-bold text-lg">{user.name[0]}</span></div>
                  <div><h3 className="font-bold text-lg">{user.name}</h3><div className="flex items-center space-x-2 text-sm text-secondary mt-1"><Mail size={14} /><span>{user.email}</span></div><div className="flex items-center space-x-2 text-sm text-secondary mt-1"><Phone size={14} /><span>{user.phone}</span></div></div>
                </div>
                <div className="flex space-x-2">
                  <button onClick={() => { setSelectedUser(user); setShowEditModal(true); }} className="p-1 hover:bg-gray-100 rounded-lg"><Edit size={18} /></button>
                  <button onClick={() => handleDeleteUser(user.id)} className="p-1 hover:bg-red-50 rounded-lg"><Trash2 size={18} className="text-error" /></button>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-border flex justify-between items-center">
                <Badge variant={user.role === 'admin' ? 'info' : user.role === 'proprietaire' ? 'success' : 'default'}>{user.role}</Badge>
                {user.properties > 0 && <span className="text-sm text-secondary">{user.properties} biens</span>}
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
      
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Ajouter un utilisateur">
        <div className="space-y-4">
          <div><label className="block text-sm font-medium mb-2">Nom complet</label><input type="text" className="input-field" value={newUser.name} onChange={(e) => setNewUser({...newUser, name: e.target.value})} /></div>
          <div><label className="block text-sm font-medium mb-2">Email</label><input type="email" className="input-field" value={newUser.email} onChange={(e) => setNewUser({...newUser, email: e.target.value})} /></div>
          <div><label className="block text-sm font-medium mb-2">Téléphone</label><input type="text" className="input-field" value={newUser.phone} onChange={(e) => setNewUser({...newUser, phone: e.target.value})} /></div>
          <div><label className="block text-sm font-medium mb-2">Rôle</label><select className="input-field" value={newUser.role} onChange={(e) => setNewUser({...newUser, role: e.target.value})}><option value="admin">Admin</option><option value="proprietaire">Propriétaire</option><option value="locataire">Locataire</option></select></div>
          <div className="flex space-x-3 pt-4"><Button variant="outline" className="flex-1" onClick={() => setShowAddModal(false)}>Annuler</Button><Button variant="primary" className="flex-1" onClick={handleAddUser}><Save size={16} className="mr-2" />Créer</Button></div>
        </div>
      </Modal>
      
      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Modifier l'utilisateur">
        {selectedUser && (<div className="space-y-4"><div><label className="block text-sm font-medium mb-2">Nom complet</label><input type="text" className="input-field" value={selectedUser.name} onChange={(e) => setSelectedUser({...selectedUser, name: e.target.value})} /></div><div><label className="block text-sm font-medium mb-2">Email</label><input type="email" className="input-field" value={selectedUser.email} onChange={(e) => setSelectedUser({...selectedUser, email: e.target.value})} /></div><div><label className="block text-sm font-medium mb-2">Téléphone</label><input type="text" className="input-field" value={selectedUser.phone} onChange={(e) => setSelectedUser({...selectedUser, phone: e.target.value})} /></div><div><label className="block text-sm font-medium mb-2">Rôle</label><select className="input-field" value={selectedUser.role} onChange={(e) => setSelectedUser({...selectedUser, role: e.target.value})}><option value="admin">Admin</option><option value="proprietaire">Propriétaire</option><option value="locataire">Locataire</option></select></div><div className="flex space-x-3 pt-4"><Button variant="outline" className="flex-1" onClick={() => setShowEditModal(false)}>Annuler</Button><Button variant="primary" className="flex-1" onClick={handleEditUser}><Save size={16} className="mr-2" />Enregistrer</Button></div></div>)}
      </Modal>
    </div>
  );
};

export default UsersAdmin;
