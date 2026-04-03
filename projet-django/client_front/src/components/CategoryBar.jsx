import { motion, AnimatePresence } from 'framer-motion';
import {
  Home, Building2, Warehouse, Trees,
  Briefcase, Waves, LandPlot, Car,
  Hotel, Store, SlidersHorizontal
} from 'lucide-react';
import { useState } from 'react';

const categories = [
  { id: 'all',        label: 'Tous',         icon: Home,      },
  { id: 'VILLA',      label: 'Villas',        icon: Trees,     },
  { id: 'MAISON',     label: 'Maisons',       icon: Home,      },
  { id: 'STUDIO',     label: 'Studios',       icon: Hotel,     },
  { id: 'BUREAU',     label: 'Bureaux',       icon: Briefcase, },
  { id: 'COMMERCIAL', label: 'Commerciaux',   icon: Store,     },
  { id: 'ENTREPOT',   label: 'Entrepôts',     icon: Warehouse, },
  { id: 'TERRAIN',    label: 'Terrains',      icon: LandPlot,  },
  { id: 'PARKING',    label: 'Parkings',      icon: Car,       },
];

export default function CategoryBar({ onFilterChange }) {
  const [active, setActive] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  const handleSelect = (id) => {
    setActive(id);
    onFilterChange?.(id);
  };

  return (
    <div className="sticky top-[80px] z-40 glass border-b border-white/20">
      <div className="max-w-[1400px] mx-auto px-6 py-3 flex items-center gap-4">
        {/* Scrollable categories */}
        <div className="flex-1 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1 min-w-max pb-1">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleSelect(cat.id)}
                className={`group relative flex flex-col items-center gap-1.5 px-5 py-2.5 rounded-xl transition-all duration-300 min-w-fit ${
                  active === cat.id
                    ? 'text-gray-900'
                    : 'text-gray-400 hover:text-gray-700'
                }`}
              >
                {/* Background pill on active */}
                {active === cat.id && (
                  <motion.div
                    layoutId="categoryBg"
                    className="absolute inset-0 bg-gray-50 rounded-xl"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}

                <div className="relative z-10">
                  <cat.icon
                    size={22}
                    strokeWidth={active === cat.id ? 2.5 : 1.8}
                    className="transition-all duration-300"
                  />
                </div>
                <span className="relative z-10 text-xs font-semibold whitespace-nowrap tracking-tight">
                  {cat.label}
                </span>

                {/* Active underline */}
                {active === cat.id && (
                  <motion.div
                    layoutId="activeUnderline"
                    className="absolute -bottom-[13px] left-4 right-4 h-[2px] bg-gray-900 rounded-full"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="h-8 w-px bg-gray-200 flex-shrink-0 hidden md:block" />

        {/* Filters button */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowFilters(!showFilters)}
          className={`hidden md:flex flex-shrink-0 items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all duration-300 ${
            showFilters
              ? 'bg-gray-900 text-white border-gray-900'
              : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400'
          }`}
        >
          <SlidersHorizontal size={16} />
          Filtres
        </motion.button>
      </div>

      {/* Expanded filter panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden border-t border-gray-100"
          >
            <div className="max-w-[1400px] mx-auto px-6 py-5 grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Price range */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Budget max</label>
                <select className="immo-input py-3 text-sm">
                  <option>Toutes</option>
                  <option>≤ 100 000 FCFA</option>
                  <option>≤ 200 000 FCFA</option>
                  <option>≤ 500 000 FCFA</option>
                  <option>≥ 500 000 FCFA</option>
                </select>
              </div>
              {/* Type */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Type</label>
                <select className="immo-input py-3 text-sm">
                  <option>Location & Vente</option>
                  <option>Location</option>
                  <option>Vente</option>
                </select>
              </div>
              {/* Rooms */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Chambres</label>
                <select className="immo-input py-3 text-sm">
                  <option>Toutes</option>
                  <option>Studio</option>
                  <option>1 chambre</option>
                  <option>2 chambres</option>
                  <option>3+ chambres</option>
                </select>
              </div>
              {/* Status */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Statut</label>
                <select className="immo-input py-3 text-sm">
                  <option>Disponibles</option>
                  <option>Tous</option>
                  <option>Réservés</option>
                </select>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
