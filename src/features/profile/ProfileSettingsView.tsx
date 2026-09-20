import React, { useState } from 'react';
import { useApp } from '../../store/AppContext';
import { getTranslation, calculateAge, daysUntilBirthday, isBirthdayToday } from '../../i18n';
import { requestNotificationPermission } from '../../services/notificationService';
import { Input, Select } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { isFirebaseConfigured } from '../../firebase/config';
import {
  User as UserIcon,
  Calendar,
  Gift,
  Globe,
  Moon,
  Clock,
  Thermometer,
  Bell,
  Database,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

interface ProfileSettingsViewProps {
  onOpenBirthdayModal: () => void;
  onOpenAuthModal: () => void;
}

export const ProfileSettingsView: React.FC<ProfileSettingsViewProps> = ({
  onOpenBirthdayModal,
  onOpenAuthModal,
}) => {
  const {
    user,
    language,
    theme,
    timeFormat,
    temperatureUnit,
    setLanguage,
    setTheme,
    setTimeFormat,
    setTemperatureUnit,
    updateProfileData,
    resetDemoTasks,
    addToast,
    logout,
  } = useApp();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [dob, setDob] = useState(user?.dateOfBirth || '1995-09-20');
  const [isSaving, setIsSaving] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    'Notification' in window && Notification.permission === 'granted'
  );

  const age = dob ? calculateAge(dob) : null;
  const daysLeft = dob ? daysUntilBirthday(dob) : null;
  const isBdayToday = dob ? isBirthdayToday(dob) : false;

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateProfileData({
        name,
        email,
        dateOfBirth: dob,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleNotifications = async () => {
    const granted = await requestNotificationPermission();
    setNotificationsEnabled(granted);
    if (granted) {
      addToast('Notifications Enabled', 'You will now receive desktop deadline alerts.');
    } else {
      addToast('Notifications Blocked', 'Please grant permission in your browser settings.', 'warning');
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          {getTranslation(language, 'nav_settings')}
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Customize your personal identity, regional settings, and system environment
        </p>
      </div>

      {/* User Profile Card */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white font-extrabold text-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
              {name ? name.slice(0, 2).toUpperCase() : 'LF'}
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">{name || 'User'}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">{email || 'guest@lifeflow.app'}</p>
            </div>
          </div>

          <Button variant="outline" size="sm" onClick={onOpenAuthModal}>
            Account Access
          </Button>
        </div>

        {/* Profile Edit Form */}
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label={getTranslation(language, 'set_name')}
              value={name}
              onChange={(e) => setName(e.target.value)}
              leftIcon={<UserIcon className="w-4 h-4" />}
            />
            <Input
              label={getTranslation(language, 'auth_email')}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isFirebaseConfigured}
              helperText={isFirebaseConfigured ? 'Managed via Firebase Auth' : undefined}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label={getTranslation(language, 'set_dob')}
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              leftIcon={<Calendar className="w-4 h-4" />}
              helperText="Enables smart birthday greetings and age tracking"
            />

            {/* Birthday Status Tile */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
              <div>
                <span className="text-[11px] uppercase font-bold text-slate-400 block">
                  Milestone Tracker
                </span>
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  {isBdayToday
                    ? '🎉 Birthday is TODAY!'
                    : `${daysLeft ?? 0} days until birthday (${age ?? 0} yrs)`}
                </span>
              </div>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={onOpenBirthdayModal}
                leftIcon={<Gift className="w-3.5 h-3.5 text-rose-500" />}
              >
                Test Alert
              </Button>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button type="submit" variant="primary" size="sm" isLoading={isSaving}>
              Save Profile Changes
            </Button>
          </div>
        </form>
      </div>

      {/* Preferences Grid */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          Regional & Display Preferences
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Language */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-indigo-500" />
              {getTranslation(language, 'set_language')}
            </label>
            <Select
              value={language}
              onChange={(e) => setLanguage(e.target.value as any)}
              options={[
                { label: 'English (LTR)', value: 'en' },
                { label: 'العربية (RTL)', value: 'ar' },
                { label: 'Deutsch (LTR)', value: 'de' },
              ]}
            />
          </div>

          {/* Theme */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Moon className="w-4 h-4 text-indigo-500" />
              {getTranslation(language, 'set_theme')}
            </label>
            <Select
              value={theme}
              onChange={(e) => setTheme(e.target.value as any)}
              options={[
                { label: 'System Default', value: 'system' },
                { label: 'Light Theme', value: 'light' },
                { label: 'Dark Theme', value: 'dark' },
              ]}
            />
          </div>

          {/* Time Format */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-indigo-500" />
              {getTranslation(language, 'set_time_format')}
            </label>
            <Select
              value={timeFormat}
              onChange={(e) => setTimeFormat(e.target.value as any)}
              options={[
                { label: '24-Hour (18:30)', value: '24h' },
                { label: '12-Hour (06:30 PM)', value: '12h' },
              ]}
            />
          </div>

          {/* Temperature Unit */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Thermometer className="w-4 h-4 text-indigo-500" />
              {getTranslation(language, 'set_temp_unit')}
            </label>
            <Select
              value={temperatureUnit}
              onChange={(e) => setTemperatureUnit(e.target.value as any)}
              options={[
                { label: 'Celsius (°C)', value: 'celsius' },
                { label: 'Fahrenheit (°F)', value: 'fahrenheit' },
              ]}
            />
          </div>
        </div>

        {/* Notifications */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 block">
                Desktop Notifications
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Receive browser reminders for deadlines and task starts
              </span>
            </div>
          </div>
          <Button
            variant={notificationsEnabled ? 'secondary' : 'outline'}
            size="sm"
            onClick={handleToggleNotifications}
          >
            {notificationsEnabled ? 'Enabled' : 'Enable'}
          </Button>
        </div>
      </div>

      {/* Backend & Firebase Architecture Card */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">
                Database & Backend Architecture
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Current data persistence and synchronization mode
              </p>
            </div>
          </div>

          <span
            className={`text-xs px-2.5 py-1 rounded-full font-bold flex items-center gap-1.5 ${
              isFirebaseConfigured
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
            }`}
          >
            {isFirebaseConfigured ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" /> Firebase Firestore Connected
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" /> Local / Demo Mode Active
              </>
            )}
          </span>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          LifeFlow is architected with a decoupled Data Access Layer. In Demo Mode, all data is
          persisted in fast local browser storage. When Firebase environment credentials are provided,
          it automatically connects to Firebase Authentication and Google Cloud Firestore.
        </p>

        <div className="flex items-center justify-between pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={resetDemoTasks}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Reset 20 Demo Tasks
          </Button>

          <Button variant="ghost" size="sm" onClick={logout} className="text-rose-500 hover:text-rose-600">
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
};
