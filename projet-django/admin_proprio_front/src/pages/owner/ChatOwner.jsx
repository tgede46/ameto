import React, { useState } from 'react';
import Card, { CardBody, CardHeader } from '../../components/common/Card';
import Button from '../../components/common/Button';
import { Send, Phone, Video, MoreVertical, Smile, Paperclip } from 'lucide-react';

const ChatOwner = () => {
  const [messages, setMessages] = useState([
    { id: 1, sender: 'admin', text: 'Bonjour M. Koffi, comment puis-je vous aider ?', time: '10:30', isOwn: false },
    { id: 2, sender: 'owner', text: 'Bonjour, je voudrais ajouter un nouveau bien', time: '10:32', isOwn: true },
    { id: 3, sender: 'admin', text: 'Bien sûr, je vous envoie le formulaire', time: '10:33', isOwn: false },
  ]);
  const [newMessage, setNewMessage] = useState('');

  const sendMessage = () => {
    if (newMessage.trim()) {
      setMessages([...messages, { 
        id: messages.length + 1, 
        sender: 'owner', 
        text: newMessage, 
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), 
        isOwn: true 
      }]);
      setNewMessage('');
    }
  };

  const handleKeyPress = (e) => { 
    if (e.key === 'Enter') sendMessage(); 
  };

  return (
    <div className="space-y-6 animate-fade-in h-screen">
      <div>
        <h1 className="text-3xl font-bold text-primary">Messagerie</h1>
        <p className="text-secondary mt-2">Contactez votre agence immobilière</p>
      </div>
      
      <Card className="h-[calc(100vh-140px)] flex flex-col">
        <CardHeader className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-brand-500 to-brand-600 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">A</span>
            </div>
            <div>
              <h3 className="font-bold text-lg">Agence ImmoTech</h3>
              <p className="text-xs text-success flex items-center">
                <span className="w-2 h-2 bg-success rounded-full mr-1"></span>
                En ligne
              </p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm"><Phone size={16} /></Button>
            <Button variant="outline" size="sm"><Video size={16} /></Button>
            <Button variant="outline" size="sm"><MoreVertical size={16} /></Button>
          </div>
        </CardHeader>
        
        <CardBody className="flex-1 overflow-y-auto">
          <div className="space-y-4">
            {messages.map((msg) => {
              const messageClass = msg.isOwn 
                ? "bg-brand-500 text-white" 
                : "bg-gray-100 text-primary";
              return (
                <div key={msg.id} className={"flex " + (msg.isOwn ? "justify-end" : "justify-start")}>
                  <div className={"max-w-[70%] " + messageClass + " rounded-2xl p-3 shadow-sm"}>
                    <p className="text-sm">{msg.text}</p>
                    <p className={"text-xs mt-1 " + (msg.isOwn ? "text-white/70" : "text-secondary")}>{msg.time}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardBody>
        
        <div className="p-4 border-t border-border bg-white rounded-b-2xl">
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" className="rounded-full"><Paperclip size={18} /></Button>
            <Button variant="outline" size="sm" className="rounded-full"><Smile size={18} /></Button>
            <input
              type="text"
              placeholder="Écrivez votre message..."
              className="flex-1 input-field py-3 rounded-full"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <Button variant="primary" onClick={sendMessage} className="rounded-full"><Send size={18} /></Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ChatOwner;
