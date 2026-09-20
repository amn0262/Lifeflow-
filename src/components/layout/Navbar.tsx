import React, { useState } from 'react';
import { useApp } from '../../store/AppContext';
import { getTranslation, formatTime, isBirthdayToday } from '../../i18n';
import { formatTempString } from '../../services/weatherService';
import {
  Clock,
  CloudSun,
  Sun,
  Moon,
  Globe,
  Plus,
  Search,
  Gift,
  User as UserIcon,
  LogOut,
  Sparkles,
  Sliders,
} from 'lucide-react';
import { Button } from '../ui/Button';

interface NavbarProps {
  onOpenQuickAdd: () => void;
  onOpenSearch: () => void;
  onOpenBirthdayCelebration: () => void;
  onNavigateToProfile: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenQuickAdd,
  onOpenSearch,
  onOpenBirthdayCelebration,
  onNavigateToProfile,
}) => {
  const {
    user,
    currentTime,
    weather,
    language,
    theme,
    timeFormat,
    temperatureUnit,
    setLanguage,
    setTheme,
    logout,
  } = useApp();

  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const isBirthday = user?.dateOfBirth ? isBirthdayToday(user.dateOfBirth) : false;

  const cycleTheme = () => {
    if (theme === 'light') setTheme('dark');
    else if (theme === 'dark') setTheme('system');
    else setTheme('light');
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand & Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white flex items-center justify-center shadow-md shadow-indigo-500/20 font-bold text-lg">
            LF
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white">
                LifeFlow
              </span>
              <span className="hidden sm:inline-block text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                PRO
              </span>
            </div>
            <p className="hidden md:block text-[11px] text-slate-400 dark:text-slate-500">
              Personal Productivity Architecture
            </p>
          </div>
        </div>

        {/* Live Clock & Weather Center Pill */}
        <div className="hidden lg:flex items-center gap-3 px-4 py-1.5 rounded-full bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 text-xs text-slate-700 dark:text-slate-300">
          {/* Live clock with ticking seconds */}
          <div className="flex items-center gap-1.5 font-medium tracking-wide">
            <Clock className="w-3.5 h-3.5 text-indigo-500" />
            <span className="tabular-nums font-mono text-xs">
              {formatTime(currentTime, language, timeFormat === '24h', true)}
            </span>
          </div>

          <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600" />

          {/* Weather preview */}
          {weather && (
            <div className="flex items-center gap-1.5">
              <CloudSun className="w-3.5 h-3.5 text-amber-500" />
              <span>{weather.city}:</span>
              <span className="font-semibold">
                {formatTempString(weather.temperature, temperatureUnit)}
              </span>
              <span className="text-slate-400 dark:text-slate-500 capitalize hidden xl:inline">
                ({weather.condition})
              </span>
            </div>
          )}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Birthday Celebratory Badge Button if today is birthday */}
          {isBirthday && (
            <button
              onClick={onOpenBirthdayCelebration}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-rose-500 text-white text-xs font-bold shadow-md shadow-rose-500/20 animate-bounce cursor-pointer"
              title="Happy Birthday! Click to celebrate"
            >
              <Gift className="w-4 h-4" />
              <span className="hidden sm:inline">Happy Birthday!</span>
            </button>
          )}

          {/* Quick Add Button */}
          <Button
            onClick={onOpenQuickAdd}
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
            className="shadow-sm"
          >
            <span className="hidden sm:inline">{getTranslation(language, 'task_quick_add')}</span>
          </Button>

          {/* Global Search Shortcut */}
          <button
            onClick={onOpenSearch}
            className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Global Search (Ctrl+K / Cmd+K)"
            aria-label="Search"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Language Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
              className="p-2 min-w-[40px] min-h-[40px] text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors uppercase text-xs font-bold flex items-center justify-center gap-1"
              aria-label="Language Selector"
            >
              <Globe className="w-4 h-4" />
              <span>{language}</span>
            </button>

            {isLangMenuOpen && (
              <div className="absolute end-0 mt-2 w-36 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 py-1 z-50">
                <button
                  onClick={() => {
                    setLanguage('en');
                    setIsLangMenuOpen(false);
                  }}
                  className={`w-full text-left rtl:text-right px-4 py-2.5 text-xs flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-800 ${
                    language === 'en' ? 'font-bold text-indigo-600 dark:text-indigo-400' : ''
                  }`}
                >
                  <span>English</span>
                  <span>EN</span>
                </button>
                <button
                  onClick={() => {
                    setLanguage('ar');
                    setIsLangMenuOpen(false);
                  }}
                  className={`w-full text-left rtl:text-right px-4 py-2.5 text-xs flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-800 ${
                    language === 'ar' ? 'font-bold text-indigo-600 dark:text-indigo-400' : ''
                  }`}
                >
                  <span>العربية</span>
                  <span>AR</span>
                </button>
                <button
                  onClick={() => {
                    setLanguage('de');
                    setIsLangMenuOpen(false);
                  }}
                  className={`w-full text-left rtl:text-right px-4 py-2.5 text-xs flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-800 ${
                    language === 'de' ? 'font-bold text-indigo-600 dark:text-indigo-400' : ''
                  }`}
                >
                  <span>Deutsch</span>
                  <span>DE</span>
                </button>
              </div>
            )}
          </div>

          {/* Theme Toggle */}
          <button
            onClick={cycleTheme}
            className="p-2 min-w-[40px] min-h-[40px] flex items-center justify-center text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={`Theme: ${theme}`}
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? (
              <Moon className="w-4 h-4 text-indigo-400" />
            ) : theme === 'light' ? (
              <Sun className="w-4 h-4 text-amber-500" />
            ) : (
              <Sparkles className="w-4 h-4 text-slate-400" />
            )}
          </button>

          {/* User Profile Button */}
          <div className="relative">
            <button
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              className="flex items-center gap-2 p-1.5 min-w-[40px] min-h-[40px] rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="User Profile Menu"
            >
              <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 font-bold flex items-center justify-center text-xs">
                {user?.name ? user.name.slice(0, 2).toUpperCase() : 'U'}
              </div>
              <span className="hidden md:inline-block text-xs font-semibold text-slate-700 dark:text-slate-300 max-w-[100px] truncate">
                {user?.name || 'User'}
              </span>
            </button>

            {isProfileMenuOpen && (
              <div className="absolute end-0 mt-2 w-52 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 py-1.5 z-50">
                <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800">
                  <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                    {user?.name}
                  </p>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate">
                    {user?.email}
                  </p>
                </div>
                <button
                  onClick={() => {
                    onNavigateToProfile();
                    setIsProfileMenuOpen(false);
                  }}
                  className="w-full text-left rtl:text-right px-4 py-2.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2.5"
                >
                  <Sliders className="w-4 h-4 text-slate-400" />
                  <span>Profile & Preferences</span>
                </button>
                <button
                  onClick={() => {
                    logout();
                    setIsProfileMenuOpen(false);
                  }}
                  className="w-full text-left rtl:text-right px-4 py-2.5 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2.5"
                >
                  <LogOut className="w-4 h-4" />
                  <span>{getTranslation(language, 'nav_logout')}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Compact Live Clock & Weather Bar */}
      <div className="lg:hidden flex items-center justify-between px-4 py-1.5 bg-slate-100/70 dark:bg-slate-900/90 border-t border-slate-200/60 dark:border-slate-800/80 text-[11px] text-slate-600 dark:text-slate-400">
        <div className="flex items-center gap-1.5 font-medium">
          <Clock className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
          <span className="tabular-nums font-mono">
            {formatTime(currentTime, language, timeFormat === '24h', false)}
          </span>
        </div>
        {weather && (
          <div className="flex items-center gap-1.5 truncate max-w-[220px]">
            <CloudSun className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span className="truncate">{weather.city}</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200 shrink-0">
              {formatTempString(weather.temperature, temperatureUnit)}
            </span>
          </div>
        )}
      </div>
    </header>
  );
};
