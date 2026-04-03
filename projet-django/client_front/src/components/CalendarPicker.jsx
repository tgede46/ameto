import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';

export default function CalendarPicker({ isDouble = true, onClose }) {
  const [tab, setTab] = useState('dates');
  const [selectedStart, setSelectedStart] = useState(null);
  const [selectedEnd, setSelectedEnd] = useState(null);

  const handleDateClick = (info) => {
    if (!selectedStart || (selectedStart && selectedEnd)) {
      setSelectedStart(info.dateStr);
      setSelectedEnd(null);
    } else {
      // Determine end
      if (new Date(info.dateStr) < new Date(selectedStart)) {
        setSelectedEnd(selectedStart);
        setSelectedStart(info.dateStr);
      } else {
        setSelectedEnd(info.dateStr);
      }
    }
  };

  const getEvents = () => {
    if (selectedStart && selectedEnd) {
      return [{ start: selectedStart, end: selectedEnd, display: 'background', color: '#FF385C' }];
    } else if (selectedStart) {
      return [{ start: selectedStart, display: 'background', color: '#FF385C' }];
    }
    return [];
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95, y: -20, rotateX: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -10, rotateX: 10 }}
      transition={{ duration: 0.4, type: "spring", bounce: 0.3 }}
      style={{ transformStyle: 'preserve-3d' }}
      // Liquid glass style matching dashboard
      className="bg-white/60 backdrop-blur-[24px] rounded-[32px] border border-white/60 shadow-[0_20px_40px_rgba(0,0,0,0.1)] p-6 md:p-8 relative z-50 w-full max-w-[850px] mx-auto overflow-hidden custom-fullcalendar"
    >
      <style dangerouslySetInnerHTML={{__html: `
        .custom-fullcalendar .fc {
          --fc-border-color: rgba(255,255,255,0.2);
          --fc-button-text-color: #374151;
          --fc-button-bg-color: rgba(255,255,255,0.6);
          --fc-button-border-color: rgba(255,255,255,0.6);
          --fc-button-hover-bg-color: rgba(255,255,255,0.9);
          --fc-button-hover-border-color: rgba(255,255,255,0.9);
          --fc-button-active-bg-color: #111827;
          --fc-button-active-border-color: #111827;
          font-family: inherit;
        }
        .custom-fullcalendar .fc .fc-toolbar-title {
          font-size: 1.1rem;
          font-weight: 800;
          color: #111827;
        }
        .custom-fullcalendar .fc-theme-standard td, .custom-fullcalendar .fc-theme-standard th {
          border: none;
        }
        .custom-fullcalendar .fc-col-header-cell {
          padding-bottom: 10px;
          color: #9CA3AF;
          font-weight: 700;
          font-size: 0.8rem;
        }
        .custom-fullcalendar .fc-daygrid-day-frame {
          cursor: pointer;
          border-radius: 12px;
          transition: all 0.2s ease;
        }
        .custom-fullcalendar .fc-daygrid-day-frame:hover {
          background-color: rgba(255,255,255,0.8);
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
          transform: translateY(-2px);
        }
        .custom-fullcalendar .fc-daygrid-day-number {
          padding: 8px;
          color: #374151;
          font-weight: 600;
        }
        .custom-fullcalendar .fc-bg-event {
          opacity: 0.2;
          border-radius: 12px;
        }
      `}} />

      {/* Top Tabs (Glass) */}
      <div className="flex justify-center mb-6">
        <div className="bg-white/40 p-1 rounded-full flex border border-white/60 shadow-inner">
          <button
            onClick={() => setTab('dates')}
            className={`px-8 py-2 rounded-full text-sm font-extrabold transition-all duration-300 ${
              tab === 'dates' ? 'bg-white shadow-[0_4px_12px_rgba(0,0,0,0.05)] text-gray-900 border border-white/80' : 'text-gray-500 hover:text-gray-900 hover:bg-white/20'
            }`}
          >
            Dates
          </button>
          <button
            onClick={() => setTab('flexible')}
            className={`px-8 py-2 rounded-full text-sm font-extrabold transition-all duration-300 ${
              tab === 'flexible' ? 'bg-white shadow-[0_4px_12px_rgba(0,0,0,0.05)] text-gray-900 border border-white/80' : 'text-gray-500 hover:text-gray-900 hover:bg-white/20'
            }`}
          >
            Flexible
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {tab === 'dates' ? (
          <motion.div 
            key="dates"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
          >
            <FullCalendar
              plugins={[dayGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              headerToolbar={{
                left: 'prev',
                center: 'title',
                right: 'next'
              }}
              dateClick={handleDateClick}
              events={getEvents()}
              height={400}
              fixedWeekCount={false}
              showNonCurrentDates={false}
            />
          </motion.div>
        ) : (
          <motion.div 
            key="flexible"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center justify-center py-12"
          >
            <h3 className="text-xl font-black text-gray-900 mb-6 drop-shadow-sm">Combien de temps souhaitez-vous rester ?</h3>
            <div className="flex gap-4">
              {['Un week-end', 'Une semaine', 'Un mois'].map((opt) => (
                <button key={opt} className="px-6 py-3 rounded-[16px] border border-white/60 bg-white/40 text-sm font-extrabold text-gray-700 hover:bg-white hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                  {opt}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {onClose && (
        <div className="mt-6 flex justify-end">
           <button onClick={onClose} className="px-6 py-2.5 bg-gray-900 text-white font-bold rounded-xl hover:bg-black transition-colors hover:shadow-lg shadow-gray-900/20 active:scale-95 duration-200">
             Appliquer
           </button>
        </div>
      )}
    </motion.div>
  );
}
