import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchConversations, fetchConversation, sendMessage } from '../../store/slices/notificationSlice';
import Card, { CardBody } from '../../components/common/Card';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Send, Search, User, MessageSquare, Phone, Info, MoreVertical } from 'lucide-react';
import toast from 'react-hot-toast';

// Re-using the same structure as ChatOwner but for Admin context
const ChatAdmin = () => {
  const dispatch = useDispatch();
  const { conversations, messages, loading, activeConversation } = useSelector(state => state.notification);
  const { user } = useSelector(state => state.auth);
  const [msgContent, setMsgContent] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    dispatch(fetchConversations());
  }, [dispatch]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSelectConversation = (userId) => {
    dispatch(fetchConversation(userId));
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!msgContent.trim() || !activeConversation) return;

    try {
      await dispatch(sendMessage({
        destinataire: activeConversation,
        contenu: msgContent
      }));
      setMsgContent('');
    } catch (err) {
      toast.error('Erreur lors de l\'envoi');
    }
  };

  const filteredConversations = conversations.filter(c => 
    c.other_user_nom.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeConvData = conversations.find(c => c.other_user_id === activeConversation);

  return (
    <div className="h-[calc(100vh-140px)] flex gap-6 animate-fade-in">
      <div className="w-80 flex flex-col gap-4">
        <div className="relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Rechercher un utilisateur..." 
            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <Card className="flex-1 border-0 shadow-sm overflow-hidden flex flex-col bg-white">
          <div className="p-4 border-b border-gray-50 bg-gray-50/50">
            <h3 className="font-bold text-gray-900">Support & Clients</h3>
          </div>
          <div className="flex-1 overflow-y-auto">
            {filteredConversations.map(conv => (
              <div 
                key={conv.id}
                onClick={() => handleSelectConversation(conv.other_user_id)}
                className={`p-4 flex items-center gap-3 cursor-pointer transition-all hover:bg-gray-50 border-b border-gray-50/50 ${activeConversation === conv.other_user_id ? 'bg-brand-50/50 border-l-4 border-l-brand-500' : ''}`}
              >
                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 shrink-0">
                  <User size={24} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline">
                    <h4 className="font-bold text-gray-900 truncate text-sm">{conv.other_user_nom}</h4>
                    <span className="text-[10px] text-gray-400">{conv.last_message_date ? new Date(conv.last_message_date).toLocaleDateString() : ''}</span>
                  </div>
                  <p className="text-xs text-gray-500 truncate mt-1">{conv.last_message}</p>
                </div>
                {conv.unread_count > 0 && (
                  <span className="w-5 h-5 bg-brand-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {conv.unread_count}
                  </span>
                )}
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="flex-1 border-0 shadow-sm overflow-hidden flex flex-col bg-white">
        {activeConversation ? (
          <>
            <div className="p-4 border-b border-gray-50 flex justify-between items-center bg-white z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-brand-50 text-brand-500 rounded-xl flex items-center justify-center">
                  <User size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm">{activeConvData?.other_user_nom}</h3>
                  <p className="text-[10px] text-brand-500 font-bold uppercase tracking-widest">{activeConvData?.other_user_role}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 text-gray-400 hover:bg-gray-50 rounded-lg transition-all"><Phone size={18} /></button>
                <button className="p-2 text-gray-400 hover:bg-gray-50 rounded-lg transition-all"><Info size={18} /></button>
                <button className="p-2 text-gray-400 hover:bg-gray-50 rounded-lg transition-all"><MoreVertical size={18} /></button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/30">
              {messages.map(msg => {
                const isMe = msg.expediteur === user.id;
                return (
                  <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] p-4 rounded-2xl shadow-sm text-sm ${isMe ? 'bg-brand-500 text-white rounded-tr-none' : 'bg-white text-gray-900 rounded-tl-none'}`}>
                      <p>{msg.contenu}</p>
                      <p className={`text-[10px] mt-2 ${isMe ? 'text-white/70 text-right' : 'text-gray-400'}`}>
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t border-gray-50 bg-white">
              <form onSubmit={handleSendMessage} className="flex gap-3">
                <input 
                  type="text" 
                  placeholder="Écrivez votre réponse..." 
                  className="flex-1 px-6 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all"
                  value={msgContent}
                  onChange={(e) => setMsgContent(e.target.value)}
                />
                <Button type="submit" variant="primary" className="rounded-2xl w-12 h-12 flex items-center justify-center p-0 shadow-lg shadow-brand-500/20 shrink-0">
                  <Send size={20} />
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-12 bg-gray-50/20">
            <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center mb-6 shadow-sm border border-gray-50">
              <MessageSquare size={48} className="text-gray-200" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Console d'administration Chat</h3>
            <p className="text-gray-500 mt-2 max-w-xs mx-auto">
              Sélectionnez un utilisateur pour répondre à ses questions ou l'assister dans sa gestion.
            </p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default ChatAdmin;
