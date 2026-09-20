import React from 'react';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { useApp } from '../../store/AppContext';
import { getTranslation, calculateAge } from '../../i18n';
import { Gift, PartyPopper, Sparkles, Heart } from 'lucide-react';

interface BirthdayModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BirthdayModal: React.FC<BirthdayModalProps> = ({ isOpen, onClose }) => {
  const { user, language } = useApp();

  if (!user || !user.dateOfBirth) return null;
  const age = calculateAge(user.dateOfBirth);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title=""
      maxWidth="md"
    >
      <div className="text-center py-4 space-y-4">
        {/* Visual Icon */}
        <div className="w-16 h-16 mx-auto rounded-3xl bg-gradient-to-tr from-amber-400 via-rose-400 to-indigo-500 flex items-center justify-center text-white shadow-xl shadow-rose-500/25 animate-bounce">
          <PartyPopper className="w-8 h-8" />
        </div>

        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
            <Sparkles className="w-3.5 h-3.5" /> Special Milestone
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-2">
            {getTranslation(language, 'bday_happy')} {user.name}! 🎂
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-sm mt-2 max-w-sm mx-auto leading-relaxed">
            {getTranslation(language, 'bday_celebrate_msg')}
          </p>
        </div>

        {age !== null && (
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 inline-block px-8">
            <span className="text-xs uppercase font-semibold text-slate-400 dark:text-slate-500 block">
              Turning
            </span>
            <span className="text-3xl font-black text-indigo-600 dark:text-indigo-400">
              {age} Years Old
            </span>
          </div>
        )}

        <div className="flex justify-center gap-3 pt-2">
          <Button variant="primary" size="md" onClick={onClose} leftIcon={<Heart className="w-4 h-4 text-rose-300" />}>
            Thank You, LifeFlow!
          </Button>
        </div>
      </div>
    </Modal>
  );
};
