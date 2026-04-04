import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchConversations, fetchConversation, sendMessage } from '../../store/slices/notificationSlice';
import Card, { CardBody, CardHeader } from '../../components/common/Card';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Send, Search, User, MessageSquare, Phone, Info, MoreVertical } from 'lucide-react';
import toast from 'react-hot-toast';

const ChatOwner = () => {
  const dispatch = useDispatch();
  const { conversations, messages, loading, activeConversation } = useSelector(state => state.notifications);
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
      })).unwrap();
      setMsgContent('');
    } catch (err) {
      toast.error('Erreur lors de l\'envoi');
    }
  };

  const filteredConversations = conversations.filter(c => 
    c.other_user_nom.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeConvData = conversations.find(c => c.other_user_id === activeConversation);

  const getInitial = (name) => {
    return name?.[0]?.toUpperCase() || '?';
  };

  return (
    <div className="h-[calc(100vh-140px)] flex gap-6 animate-fade-in">
      {/* Sidebar - Conversations */}
      <aside className="w-80 flex flex-col bg-white rounded-[32px] border border-gray-100 shadow-xl overflow-hidden">
        <div className="p-6 border-b border-gray-50">
          <h2 className="text-xl font-black text-gray-900 mb-4 tracking-tight">Messages</h2>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Rechercher..."
              className="w-full bg-gray-50 border-none rounded-2xl py-3 pl-12 pr-4 text-sm font-medium focus:ring-2 focus:ring-brand-500 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {filteredConversations.length === 0 ? (
            <p className="text-center text-gray-400 text-sm mt-10 font-bold px-4">Aucune discussion pour le moment.</p>
          ) : (
            filteredConversations.map(conv => (
              <button
                key={conv.id}
                onClick={() => handleSelectConversation(conv.other_user_id)}
                className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all ${activeConversation === conv.other_user_id ? 'bg-brand-50 shadow-sm' : 'hover:bg-gray-50'}`}
              >
                <div className="relative">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white shadow-md ${activeConversation === conv.other_user_id ? 'bg-brand-500' : 'bg-gray-300'}`}>
                    {getInitial(conv.other_user_nom)}
                  </div>
                  <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white" />
                </div>
                <div className="flex-1 text-left min-w-0">
                  <div className="flex justify-between items-start">
                    <p className={`font-bold text-sm truncate ${activeConversation === conv.other_user_id ? 'text-brand-600' : 'text-gray-900'}`}>{conv.other_user_nom}</p>
                    <span className="text-[10px] text-gray-400">{conv.last_message_date ? new Date(conv.last_message_date).toLocaleDateString() : ''}</span>
                  </div>
                  <p className="text-xs text-gray-500 truncate font-medium mt-1">{conv.last_message}</p>
                </div>
                {conv.unread_count > 0 && (
                  <span className="w-5 h-5 bg-brand-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shrink-0">
                    {conv.unread_count}
                  </span>
                )}
              </button>
            ))
          )}
        </div>
      </aside>

      {/* Main Chat Area */}
      <section className="flex-1 flex flex-col bg-white rounded-[32px] border border-gray-100 shadow-xl overflow-hidden relative">
        {activeConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-white/80 backdrop-blur-md sticky top-0 z-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-brand-500 flex items-center justify-center font-bold text-white shadow-md">
                  {getInitial(activeConvData?.other_user_nom)}
                </div>
                <div>
                  <p className="font-black text-gray-900 tracking-tight">{activeConvData?.other_user_nom}</p>
                  <p className="text-xs font-bold text-brand-500 uppercase tracking-widest">{activeConvData?.other_user_role || 'En ligne'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-3 hover:bg-gray-50 rounded-xl text-gray-400 transition-colors"><Phone size={20} /></button>
                <button className="p-3 hover:bg-gray-50 rounded-xl text-gray-400 transition-colors"><Info size={20} /></button>
                <button className="p-3 hover:bg-gray-50 rounded-xl text-gray-400 transition-colors"><MoreVertical size={20} /></button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#F9FAFB]/30">
              {messages.map(msg => {
                const isMe = msg.expediteur === user.id;
                return (
                  <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] p-4 rounded-[24px] shadow-sm relative ${isMe
                        ? 'bg-brand-500 text-white rounded-tr-none'
                        : 'bg-white text-gray-800 rounded-tl-none border border-gray-50'
                      }`}>
                      <p className="text-sm font-medium leading-relaxed">{msg.contenu}</p>
                      <p className={`text-[10px] font-bold mt-2 ${isMe ? 'text-brand-100' : 'text-gray-400'}`}>
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-6 bg-white border-t border-gray-50">
              <form onSubmit={handleSendMessage} className="flex items-center gap-4 bg-gray-50 rounded-2xl p-2 focus-within:ring-2 focus-within:ring-brand-500 transition-all">
                <input
                  type="text"
                  placeholder="Écrivez votre message..."
                  className="flex-1 bg-transparent border-none py-3 px-4 text-sm font-medium focus:ring-0"
                  value={msgContent}
                  onChange={(e) => setMsgContent(e.target.value)}
                />
                <button
                  type="submit"
                  disabled={!msgContent.trim()}
                  className="w-12 h-12 bg-brand-500 text-white rounded-xl flex items-center justify-center hover:bg-brand-600 transition-all shadow-lg shadow-brand-500/20 active:scale-95 disabled:opacity-50"
                >
                  <Send size={20} />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center mb-6 shadow-sm border border-gray-50">
              <MessageSquare size={64} className="text-gray-200" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Vos conversations</h3>
            <p className="text-gray-500 mt-2 max-w-xs mx-auto">
              Sélectionnez un contact dans la liste pour démarrer une discussion.
            </p>
          </div>
        )}
      </section>
    </div>
  );
};

export default ChatOwner;
