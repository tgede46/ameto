import { motion } from "framer-motion";
import { FilePlus, Search, MessageSquare } from "lucide-react";
import { Link } from "react-router-dom";

export default function DashboardEmptyState() {
  const actions = [
    {
      icon: Search,
      title: "Trouver un bien",
      description: "Parcourez notre catalogue de milliers de biens disponibles à la location ou à l'achat.",
      to: "/",
      buttonText: "Explorer le catalogue",
      variant: "primary"
    },
    {
      icon: FilePlus,
      title: "Compléter mon dossier",
      description: "Un dossier complet et vérifié augmente vos chances d'être accepté par les propriétaires.",
      to: "/dossier",
      buttonText: "Aller à mon dossier",
      variant: "secondary"
    },
    {
      icon: MessageSquare,
      title: "Contacter le support",
      description: "Notre équipe est disponible 24/7 pour répondre à toutes vos questions.",
      to: "/contact",
      buttonText: "Envoyer un message",
      variant: "secondary"
    }
  ];

  return (
    <div className="text-center py-16 px-6">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <h2 className="text-3xl font-extrabold text-gray-800 mb-3 tracking-tight">Bienvenue sur votre espace Amétô !</h2>
        <p className="text-gray-500 max-w-2xl mx-auto text-lg">
          Vous n'avez pas encore de bail actif. Pour commencer, explorez nos biens ou complétez votre dossier de location pour gagner la confiance des propriétaires.
        </p>
      </motion.div>

      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {actions.map((action, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 + i * 0.1, ease: "easeOut" }}
            className="bg-white/50 backdrop-blur-xl border border-white/60 rounded-[32px] p-8 shadow-lg shadow-gray-200/50 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 flex flex-col"
          >
            <div className={`w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-inner border border-gray-100 text-brand-500`}>
              <action.icon size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-3 text-left">{action.title}</h3>
            <p className="text-gray-500 text-left flex-1 mb-8">{action.description}</p>
            <Link 
              to={action.to} 
              className={`mt-auto w-full text-center font-bold py-3 px-6 rounded-xl transition-all duration-300 ${ 
                action.variant === 'primary' 
                  ? 'bg-brand-500 text-white hover:bg-brand-600 shadow-lg shadow-brand-500/30' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-black'
              }`}>
              {action.buttonText}
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
