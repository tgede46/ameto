import { MessageSquare, Send, Search, MoreVertical, Phone, Video, Loader2 } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { fetchContacts, fetchConversation, sendMessage } from "../store/userSlice";
import Header from "../components/Header";

export default function Messages() {
  const dispatch = useDispatch();
  const { profile, contacts, activeConversation, loading } = useSelector((state) => state.user);
  const [activeChat, setActiveChat] = useState(null);
  const [messageText, setMessageText] = useState("");
  const scrollRef = useRef(null);

  useEffect(() => {
    dispatch(fetchContacts());
  }, [dispatch]);

  useEffect(() => {
    if (contacts?.length > 0 && !activeChat) {
      setActiveChat(contacts[0].id);
    }
  }, [contacts, activeChat]);

  useEffect(() => {
    if (activeChat) {
      dispatch(fetchConversation(activeChat));
      const interval = setInterval(() => {
        dispatch(fetchConversation(activeChat));
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [activeChat, dispatch]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [activeConversation]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!messageText.trim() || !activeChat) return;
    
    await dispatch(sendMessage({ receiver: activeChat, text: messageText }));
    setMessageText("");
  };

  const currentContact = contacts?.find(c => c.id === activeChat);

  // Vérification de l'authentification (token présent mais profil en cours de chargement)
  const hasToken = !!localStorage.getItem('token');

  if (hasToken && !profile) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-brand-500 animate-spin" />
          <p className="text-gray-500 font-medium animate-pulse">Chargement de votre messagerie...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-gray-50 p-6 text-center">
        <MessageSquare size={64} className="text-gray-200 mb-6" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Accès restreint</h2>
        <p className="text-gray-500 max-w-md">Veuillez vous connecter pour accéder à votre messagerie.</p>
        <Link to="/login" className="mt-6 bg-brand-500 text-white px-8 py-3 rounded-xl font-bold hover:bg-brand-600 transition-all">Se connecter</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col h-screen overflow-hidden">
      <Header />
      
      <main className="flex-1 max-w-[1400px] mx-auto w-full px-4 py-6 md:py-10 flex gap-6 overflow-hidden">
        
        {/* Contacts Sidebar */}
        <aside className="hidden md:flex flex-col w-80 bg-white rounded-[32px] border border-gray-100 shadow-xl overflow-hidden">
          <div className="p-6 border-b border-gray-50">
            <h2 className="text-xl font-black text-gray-900 mb-4 tracking-tight">Messages</h2>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Rechercher..." 
                className="w-full bg-gray-50 border-none rounded-2xl py-3 pl-12 pr-4 text-sm font-medium focus:ring-2 focus:ring-brand-500 transition-all"
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {!contacts || contacts.length === 0 ? (
              <p className="text-center text-gray-400 text-sm mt-10 font-bold px-4">Aucune discussion pour le moment.</p>
            ) : (
              contacts.map((contact) => (
                <button
                  key={contact.id}
                  onClick={() => setActiveChat(contact.id)}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all ${activeChat === contact?.id ? 'bg-brand-50 shadow-sm' : 'hover:bg-gray-50'}`}
                >
                  <div className="relative">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white shadow-md ${activeChat === contact?.id ? 'bg-brand-500' : 'bg-gray-300'}`}>
                      {contact?.username?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white" />
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <div className="flex justify-between items-start">
                      <p className={`font-bold text-sm truncate ${activeChat === contact?.id ? 'text-brand-600' : 'text-gray-900'}`}>{contact?.first_name} {contact?.last_name}</p>
                    </div>
                    <p className="text-xs text-gray-500 truncate font-medium">{contact?.role}</p>
                  </div>
                </button>
              ))
            )}
          </div>
        </aside>

        {/* Chat Area */}
        <section className="flex-1 flex flex-col bg-white rounded-[32px] border border-gray-100 shadow-xl overflow-hidden relative">
          
          {activeChat && currentContact ? (
            <>
              {/* Chat Header */}
              <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-white/80 backdrop-blur-md sticky top-0 z-10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-brand-500 flex items-center justify-center font-bold text-white shadow-md">
                    {currentContact?.username?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div>
                    <p className="font-black text-gray-900 tracking-tight">{currentContact?.first_name} {currentContact?.last_name}</p>
                    <p className="text-xs font-bold text-brand-500">{currentContact?.role}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-3 hover:bg-gray-50 rounded-xl text-gray-400 transition-colors"><Phone size={20} /></button>
                  <button className="p-3 hover:bg-gray-50 rounded-xl text-gray-400 transition-colors"><Video size={20} /></button>
                  <button className="p-3 hover:bg-gray-50 rounded-xl text-gray-400 transition-colors"><MoreVertical size={20} /></button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#F9FAFB]/30">
                {activeConversation?.map((msg) => {
                  const isOwn = msg.sender === profile?.id;
                  return (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      key={msg.id}
                      className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[70%] p-4 rounded-[24px] shadow-sm relative ${
                        isOwn 
                          ? 'bg-brand-500 text-white rounded-tr-none' 
                          : 'bg-white text-gray-800 rounded-tl-none border border-gray-50'
                      }`}>
                        <p className="text-sm font-medium leading-relaxed">{msg.text}</p>
                        <p className={`text-[10px] font-bold mt-2 ${isOwn ? 'text-brand-100' : 'text-gray-400'}`}>
                          {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
                <div ref={scrollRef} />
              </div>

              {/* Input Area */}
              <div className="p-6 bg-white border-t border-gray-50">
                <form onSubmit={handleSend} className="flex items-center gap-4 bg-gray-50 rounded-2xl p-2 focus-within:ring-2 focus-within:ring-brand-500 transition-all">
                  <input
                    type="text"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="Écrivez votre message..."
                    className="flex-1 bg-transparent border-none py-3 px-4 text-sm font-medium focus:ring-0"
                  />
                  <button 
                    type="submit"
                    disabled={!messageText.trim()}
                    className="w-12 h-12 bg-brand-500 text-white rounded-xl flex items-center justify-center hover:bg-brand-600 transition-all shadow-lg shadow-brand-500/20 active:scale-95 disabled:opacity-50"
                  >
                    <Send size={20} />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <MessageSquare size={64} className="text-gray-200 mb-6" />
              <h3 className="text-xl font-bold text-gray-800">Sélectionnez une discussion</h3>
              <p className="text-gray-500 max-w-xs mt-2">Choisissez un contact dans la liste pour commencer à discuter.</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}


