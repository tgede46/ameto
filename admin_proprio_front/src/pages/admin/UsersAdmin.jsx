import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUsers } from '../../store/slices/userSlice';
import Card, { CardBody } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Search, UserPlus, Edit, Trash2, Filter, Mail, Phone, X, Save, Users, Lock, Info, FileText } from 'lucide-react';
import api from '../../services/api';

import toast from 'react-hot-toast';
import userService from '../../services/userService';

const UsersAdmin = () => {
  const dispatch = useDispatch();
  const { users, loading, error } = useSelector(state => state.users);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDocModal, setShowDocModal] = useState(false);
  const [newUser, setNewUser] = useState({ prenom: '', nom: '', email: '', telephone: '', role: 'LOCATAIRE', password: '' });


  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  const handleAddUser = async () => {
    try {
      await userService.createUser(newUser);
      toast.success('Utilisateur ajouté !');
      setShowAddModal(false);
      setNewUser({ prenom: '', nom: '', email: '', telephone: '', role: 'LOCATAIRE', password: '' });
      dispatch(fetchUsers());
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Erreur lors de l\'ajout');
    }
  };

  const handleEditUser = async () => {
    try {
      await userService.updateUser(selectedUser.id, selectedUser);
      toast.success('Utilisateur modifié !');
      setShowEditModal(false);
      dispatch(fetchUsers());
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Erreur lors de la modification');
    }
  };

  const toggleVerification = async (user) => {
    try {
      const endpoint = user.role === 'LOCATAIRE' ? `auth/locataires/${user.id}/` : `auth/proprietaires/${user.id}/`;
      await api.patch(endpoint, { is_verified: !user.is_verified });
      toast.success(user.is_verified ? 'Profil dévalidé' : 'Profil vérifié avec succès !');
      dispatch(fetchUsers());
    } catch (err) {
      toast.error('Erreur lors de la vérification');
    }
  };


  const handleDeleteUser = async (id, role) => {
    if (confirm('Supprimer cet utilisateur ?')) {
      try {
        await userService.deleteUser(id, role);
        toast.success('Utilisateur supprimé !');
        dispatch(fetchUsers());
      } catch (err) {
        toast.error('Erreur lors de la suppression');
      }
    }
  };

  const filteredUsers = users?.filter(u =>
    (u.prenom + ' ' + (u.nom || '')).toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (loading && users.length === 0) return <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>;
  if (error) return <div className="p-6 bg-red-50 text-red-600 rounded-2xl">{error}</div>;

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">Gestion des utilisateurs</h1>
          <p className="text-gray-500 mt-2">Modérez et gérez les comptes de la plateforme</p>
        </div>
        <Button variant="primary" className="rounded-xl shadow-lg shadow-brand-500/20 px-6" onClick={() => setShowAddModal(true)}>
          <UserPlus size={20} className="mr-2" />
          Ajouter un utilisateur
        </Button>
      </div>

      <Card className="border-0 shadow-sm"><CardBody><div className="flex flex-col md:flex-row gap-4"><div className="flex-1 relative"><Search size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" /><input type="text" placeholder="Rechercher par nom ou email..." className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div><Button variant="outline" className="rounded-2xl px-6"><Filter size={20} className="mr-2" />Filtres</Button></div></CardBody></Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredUsers.map(user => (
          <Card key={user.id} className="hover:shadow-md transition-all border-0 shadow-sm bg-white overflow-hidden group">
            <CardBody className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex space-x-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-brand-500 to-brand-600 rounded-2xl flex items-center justify-center shadow-lg shadow-brand-500/20 group-hover:scale-110 transition-transform duration-300">
                    <span className="text-white font-extrabold text-xl">{(user.prenom?.[0] || user.email?.[0] || '?').toUpperCase()}</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">{user.prenom} {user.nom}</h3>
                    <div className="flex items-center space-x-2 text-sm text-gray-500 mt-1">
                      <Mail size={14} className="text-brand-500" />
                      <span>{user.email}</span>
                    </div>
                    {user.telephone && (
                      <div className="flex items-center space-x-2 text-sm text-gray-500 mt-1">
                        <Phone size={14} className="text-brand-500" />
                        <span>{user.telephone}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex space-x-1">
                  <button onClick={() => { setSelectedUser(user); setShowEditModal(true); }} className="p-2 text-gray-400 hover:text-brand-500 hover:bg-brand-50 rounded-xl transition-all"><Edit size={18} /></button>
                  <button onClick={() => handleDeleteUser(user.id, user.role)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"><Trash2 size={18} /></button>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-gray-50 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Badge variant={user.role?.toUpperCase() === 'ADMIN' ? 'info' : user.role?.toUpperCase() === 'PROPRIETAIRE' ? 'success' : 'default'} className="rounded-lg px-3 py-1 font-bold uppercase tracking-wider text-[10px]">
                    {user.role}
                  </Badge>
                  {user.role === 'LOCATAIRE' && (
                    <button
                      onClick={() => { setSelectedUser(user); setShowDocModal(true); }}
                      className="flex items-center gap-1.5 px-2 py-1 bg-gray-50 text-gray-600 text-[10px] font-bold rounded-lg border border-gray-100 hover:bg-brand-50 hover:text-brand-500 transition-all"
                    >
                      <FileText size={12} /> Dossier
                    </button>
                  )}
                </div>
                <div className="flex items-center text-xs font-bold text-gray-400 uppercase tracking-widest">
                  ID: #{user.id}
                </div>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {filteredUsers.length === 0 && !loading && (
        <div className="text-center py-20 bg-gray-50 rounded-[40px] border-2 border-dashed border-gray-200">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
            <Users size={32} className="text-gray-300" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">Aucun utilisateur trouvé</h3>
          <p className="text-gray-500 mt-1">Essayez de modifier vos critères de recherche</p>
        </div>
      )}

      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Ajouter un utilisateur">
        <div className="space-y-4 p-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-widest">Prénom</label><input type="text" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500/10 focus:border-brand-500 outline-none" value={newUser.prenom} onChange={(e) => setNewUser({ ...newUser, prenom: e.target.value })} /></div>
            <div><label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-widest">Nom</label><input type="text" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500/10 focus:border-brand-500 outline-none" value={newUser.nom} onChange={(e) => setNewUser({ ...newUser, nom: e.target.value })} /></div>
          </div>
          <div><label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-widest">Email</label><input type="email" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500/10 focus:border-brand-500 outline-none" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} /></div>
          <div><label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-widest">Téléphone</label><input type="text" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500/10 focus:border-brand-500 outline-none" value={newUser.telephone} onChange={(e) => setNewUser({ ...newUser, telephone: e.target.value })} /></div>
          <div><label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-widest">Rôle</label><select className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500/10 focus:border-brand-500 outline-none" value={newUser.role} onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}><option value="ADMIN">Admin</option><option value="PROPRIETAIRE">Propriétaire</option><option value="LOCATAIRE">Locataire</option></select></div>
          <div><label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-widest">Mot de passe</label><div className="relative"><Lock size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" /><input type="password" placeholder="••••••••" className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500/10 focus:border-brand-500 outline-none" value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} /></div></div>
          <div className="flex space-x-3 pt-6"><Button variant="outline" className="flex-1 rounded-xl" onClick={() => setShowAddModal(false)}>Annuler</Button><Button variant="primary" className="flex-1 rounded-xl" onClick={handleAddUser}><Save size={16} className="mr-2" />Créer</Button></div>
        </div>
      </Modal>

      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Modifier l'utilisateur">
        {selectedUser && (
          <div className="space-y-4 p-4">
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-widest">Prénom</label><input type="text" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500/10 focus:border-brand-500 outline-none" value={selectedUser.prenom} onChange={(e) => setSelectedUser({ ...selectedUser, prenom: e.target.value })} /></div>
              <div><label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-widest">Nom</label><input type="text" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500/10 focus:border-brand-500 outline-none" value={selectedUser.nom} onChange={(e) => setSelectedUser({ ...selectedUser, nom: e.target.value })} /></div>
            </div>
            <div><label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-widest">Email</label><input type="email" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500/10 focus:border-brand-500 outline-none" value={selectedUser.email} onChange={(e) => setSelectedUser({ ...selectedUser, email: e.target.value })} /></div>
            <div><label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-widest">Téléphone</label><input type="text" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500/10 focus:border-brand-500 outline-none" value={selectedUser.telephone} onChange={(e) => setSelectedUser({ ...selectedUser, telephone: e.target.value })} /></div>
            <div><label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-widest">Rôle</label><select className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500/10 focus:border-brand-500 outline-none" value={selectedUser.role} onChange={(e) => setSelectedUser({ ...selectedUser, role: e.target.value })}><option value="ADMIN">Admin</option><option value="PROPRIETAIRE">Propriétaire</option><option value="LOCATAIRE">Locataire</option></select></div>
            <div className="flex space-x-3 pt-6"><Button variant="outline" className="flex-1 rounded-xl" onClick={() => setShowEditModal(false)}>Annuler</Button><Button variant="primary" className="flex-1 rounded-xl" onClick={handleEditUser}><Save size={16} className="mr-2" />Enregistrer</Button></div>
          </div>
        )}
      </Modal>

      <Modal isOpen={showDocModal} onClose={() => setShowDocModal(false)} title="Dossier Locataire">
        {selectedUser && (
          <div className="space-y-6 p-4">
            <div className="bg-gray-50 p-4 rounded-2xl flex items-center justify-between">
              <div>
                <p className="text-secondary text-xs uppercase font-bold tracking-widest mb-1">Status de vérification</p>
                <p className="font-bold text-primary">{selectedUser.is_verified ? 'Vérifié' : 'En attente de validation'}</p>
              </div>
              <Button
                variant={selectedUser.is_verified ? 'outline' : 'primary'}
                onClick={() => toggleVerification(selectedUser)}
              >
                {selectedUser.is_verified ? 'Révoquer' : 'Valider le profil'}
              </Button>
            </div>

            <div className="space-y-4">
              <p className="text-sm font-bold uppercase text-gray-400">Documents justificatifs</p>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 border border-gray-100 rounded-2xl hover:bg-gray-50 transition-colors">
                  <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">CNI / Passeport</p>
                  {selectedUser.cni ? (
                    <a href={selectedUser.cni} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-brand-500 font-bold hover:underline">
                      <Eye size={16} /> Voir CNI
                    </a>
                  ) : <p className="text-xs text-gray-300 italic">Non fourni</p>}
                </div>

                <div className="p-4 border border-gray-100 rounded-2xl hover:bg-gray-50 transition-colors">
                  <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">Dernière Fiche de Paie</p>
                  {selectedUser.fiche_paie ? (
                    <a href={selectedUser.fiche_paie} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-brand-500 font-bold hover:underline">
                      <FileText size={16} /> Voir Fiche
                    </a>
                  ) : <p className="text-xs text-gray-300 italic">Non fourni</p>}
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-2xl flex items-start gap-3">
                <Info size={20} className="text-blue-500 mt-1 flex-shrink-0" />
                <p className="text-xs text-blue-600 leading-relaxed">
                  Assurez-vous que les revenus déclarés ({selectedUser.revenus?.toLocaleString()} CFA) sont cohérents avec les justificatifs fournis avant de valider le profil.
                </p>
              </div>
            </div>

            <Button variant="outline" className="w-full mt-4" onClick={() => setShowDocModal(false)}>Fermer</Button>
          </div>
        )}
      </Modal>
    </div>

  );
};

export default UsersAdmin;
