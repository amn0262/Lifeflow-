import React, { useState } from 'react';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useApp } from '../../store/AppContext';
import { getTranslation } from '../../i18n';
import { resetUserPassword } from '../../services/authService';
import { Mail, Lock, User as UserIcon, Calendar, Sparkles } from 'lucide-react';
import { isFirebaseConfigured } from '../../firebase/config';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
}) => {
  const { login, register, language, addToast } = useApp();
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>(initialMode);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [dob, setDob] = useState('1995-09-20');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'login') {
        await login(email, password);
        onClose();
      } else if (mode === 'register') {
        await register(name, email, password, dob);
        onClose();
      } else if (mode === 'forgot') {
        await resetUserPassword(email);
        addToast('Password Reset', 'Password reset instructions have been sent to your email.');
        setMode('login');
      }
    } catch (err: any) {
      setError(err?.message || 'Authentication error. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = () => {
    setName('Aymen Bourouba');
    setEmail('aymen@lifeflow.app');
    setPassword('DemoPass123!');
    setDob('1995-09-20');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        mode === 'login'
          ? getTranslation(language, 'auth_login')
          : mode === 'register'
          ? getTranslation(language, 'auth_register')
          : getTranslation(language, 'auth_forgot')
      }
      maxWidth="sm"
    >
      <div className="space-y-4">
        {/* Firebase Config Notice */}
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between">
          <span>
            Backend:{' '}
            <strong className="text-slate-700 dark:text-slate-300">
              {isFirebaseConfigured ? 'Firebase Live' : 'Local / Demo Mode Active'}
            </strong>
          </span>
          <button
            type="button"
            onClick={handleDemoFill}
            className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold flex items-center gap-1"
          >
            <Sparkles className="w-3 h-3" /> Auto-fill Demo
          </button>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 rounded-xl text-xs text-rose-600 dark:text-rose-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === 'register' && (
            <>
              <Input
                label="Full Name"
                placeholder="e.g. Aymen Bourouba"
                value={name}
                onChange={(e) => setName(e.target.value)}
                leftIcon={<UserIcon className="w-4 h-4" />}
                required
              />
              <Input
                label="Date of Birth"
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                leftIcon={<Calendar className="w-4 h-4" />}
                helperText="Used for your birthday greeting and analytics"
              />
            </>
          )}

          <Input
            label={getTranslation(language, 'auth_email')}
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            leftIcon={<Mail className="w-4 h-4" />}
            required
          />

          {mode !== 'forgot' && (
            <Input
              label={getTranslation(language, 'auth_password')}
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock className="w-4 h-4" />}
              required
            />
          )}

          {mode === 'login' && (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setMode('forgot')}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                {getTranslation(language, 'auth_forgot')}?
              </button>
            </div>
          )}

          <Button type="submit" variant="primary" className="w-full" isLoading={loading}>
            {mode === 'login'
              ? getTranslation(language, 'auth_login')
              : mode === 'register'
              ? getTranslation(language, 'auth_register')
              : 'Send Reset Link'}
          </Button>
        </form>

        <div className="text-center pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
          {mode === 'login' ? (
            <p>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => setMode('register')}
                className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                {getTranslation(language, 'auth_register')}
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => setMode('login')}
                className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                {getTranslation(language, 'auth_login')}
              </button>
            </p>
          )}
        </div>
      </div>
    </Modal>
  );
};
