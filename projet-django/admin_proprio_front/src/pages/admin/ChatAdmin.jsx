import React, { useState } from 'react';
import Card, { CardBody, CardHeader } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import { 
  Send, Phone, Video, MoreVertical, Smile, Paperclip, 
  Search, Users, MessageSquare 
} from 'lucide-react';

const ChatAdmin = () => {
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [showNewChatModal, setShowNewChatModal] = useState(false);

  const [chats, setChats] = useState([
    { id: 1, name: 'M. Koffi', role: 'proprietaire', lastMessage: 'Bonjour, je voudrais ajouter un bien', time: '10:30', unread: 2, online: true, avatar: 'K' },
    { id: 2, name: 'Mme Afi', role: 'locataire', lastMessage: "Problème de fuite d'eau", time: '09:15', unread: 1, online: false, avatar: 'A' },
    { id: 3, name: 'M. Jean', role: 'locataire', lastMessage: 'Merci pour votre aide', time: 'Hier', unread: 0, online: false, avatar: 'J' },
    { id: 4, name: 'Mme Sarah', role: 'proprietaire', lastMessage: 'Quand est la prochaine visite ?', time: 'Hier', unread: 0, online: true, avatar: 'S' },
  ]);

  const chatMessages = {
    1: [
      { id: 1, sender: 'user', text: 'Bonjour, je voudrais ajouter un nouveau bien', time: '10:30', isOwn: false },
      { id: 2, sender: 'admin', text: 'Bonjour M. Koffi, je vous envoie le formulaire', time: '10:32', isOwn: true },
      { id: 3, sender: 'user', text: 'Merci beaucoup', time: '10:33', isOwn: false },
    ],
    2: [
      { id: 1, sender: 'user', text: "Bonjour, j'ai un problème de fuite d'eau", time: '09:15', isOwn: false },
      { id: 2, sender: 'admin', text: 'Bonjour Mme Afi, je vais envoyer un plombier', time: '09:20', isOwn: true },
    ],
  };

  const handleSelectChat = (chat) => {
    setSelectedChat(chat);
    setMessages(chatMessages[chat.id] || []);
    setChats(chats.map(c => c.id === chat.id ? { ...c, unread: 0 } : c));
  };

  const sendMessage = () => {
    if (newMessage.trim() && selectedChat) {
      const newMsg = {
        id: messages.length + 1,
        sender: 'admin',
        text: newMessage,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isOwn: true
      };
      setMessages([...messages, newMsg]);
      setNewMessage('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') sendMessage();
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'proprietaire':
        return <Badge variant="success">Propriétaire</Badge>;
      case 'locataire':
        return <Badge variant="info">Locataire</Badge>;
      default:
        return <Badge>Autre</Badge>;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in h-[calc(100vh-120px)]">
      
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-primary">Messagerie</h1>
          <p className="text-secondary mt-2">Discutez avec vos clients et propriétaires</p>
        </div>
        <Button variant="primary" onClick={() => setShowNewChatModal(true)}>
          <Users size={20} className="mr-2" />
          Nouvelle conversation
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">

        {/* LISTE DES CHATS */}
        <Card className="h-full flex flex-col">
          <CardHeader>
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary" />
              <input type="text" placeholder="Rechercher..." className="input-field pl-10 py-2" />
            </div>
          </CardHeader>

          <CardBody className="flex-1 overflow-y-auto p-0">
            {chats.map(chat => (
              <div
                key={chat.id}
                onClick={() => handleSelectChat(chat)}
                className="p-4 border-b border-border cursor-pointer hover:bg-gray-50"
              >
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-br from-brand-500 to-brand-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">{chat.avatar}</span>
                    </div>
                    {chat.online && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex justify-between">
                      <h3 className="font-bold">{chat.name}</h3>
                      <span className="text-xs text-secondary">{chat.time}</span>
                    </div>

                    <div className="flex justify-between items-center mt-1">
                      <p className="text-sm text-secondary truncate w-32">{chat.lastMessage}</p>
                      {chat.unread > 0 && (
                        <span className="bg-brand-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          {chat.unread}
                        </span>
                      )}
                    </div>

                    <div className="mt-1">{getRoleBadge(chat.role)}</div>
                  </div>
                </div>
              </div>
            ))}
          </CardBody>
        </Card>

        {/* ZONE DE CHAT */}
        <Card className="lg:col-span-2 h-full flex flex-col">
          {selectedChat ? (
            <>
              <CardHeader className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-brand-500 to-brand-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">{selectedChat.avatar}</span>
                  </div>
                  <div>
                    <h3 className="font-bold">{selectedChat.name}</h3>
                    <p className="text-xs text-green-500">
                      {selectedChat.online ? 'En ligne' : 'Hors ligne'}
                    </p>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button variant="outline" size="sm"><Phone size={16} /></Button>
                  <Button variant="outline" size="sm"><Video size={16} /></Button>
                  <Button variant="outline" size="sm"><MoreVertical size={16} /></Button>
                </div>
              </CardHeader>

              {/* MESSAGES */}
              <CardBody className="flex-1 overflow-y-auto">
                <div className="space-y-4">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.isOwn ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-2xl p-3 ${
                          msg.isOwn ? 'bg-brand-500 text-white' : 'bg-gray-100'
                        }`}
                      >
                        <p className="text-sm">{msg.text}</p>
                        <p className="text-xs mt-1 opacity-70">{msg.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardBody>

              {/* INPUT */}
              <div className="p-4 border-t border-border">
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm"><Paperclip size={18} /></Button>
                  <Button variant="outline" size="sm"><Smile size={18} /></Button>

                  <input
                    type="text"
                    placeholder="Écrivez votre message..."
                    className="flex-1 input-field py-2"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                  />

                  <Button variant="primary" onClick={sendMessage}>
                    <Send size={18} />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <MessageSquare size={48} className="mx-auto text-gray-300 mb-3" />
                <p className="text-secondary">Sélectionnez une conversation</p>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* MODAL */}
      <Modal
        isOpen={showNewChatModal}
        onClose={() => setShowNewChatModal(false)}
        title="Nouvelle conversation"
      >
        <div className="space-y-4">
          <input type="text" className="input-field" placeholder="Nom ou email..." />

          <div className="space-y-2 max-h-64 overflow-y-auto">
            {chats.map(chat => (
              <div key={chat.id} className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-xl cursor-pointer">
                <div className="w-10 h-10 bg-brand-100 rounded-full flex items-center justify-center">
                  <span className="text-brand-500 font-bold">{chat.avatar}</span>
                </div>
                <div>
                  <p className="font-medium">{chat.name}</p>
                  <p className="text-xs text-secondary">{chat.role}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex space-x-3 pt-4">
            <Button variant="outline" className="flex-1" onClick={() => setShowNewChatModal(false)}>
              Annuler
            </Button>
            <Button variant="primary" className="flex-1">
              Démarrer
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ChatAdmin;