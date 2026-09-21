import React, { useState } from 'react';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useApp } from '../../store/AppContext';
import { getTranslation } from '../../i18n';
import { Category } from '../../types';
import {
  Briefcase,
  User,
  Palette,
  Heart,
  DollarSign,
  BookOpen,
  Folder,
  Tag,
  Star,
  ShoppingBag,
  Home,
  Code,
  Target,
  Coffee,
  Smile,
  Sparkles,
  Check,
} from 'lucide-react';

interface NewCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCategoryCreated?: (newCategory: Category) => void;
}

export const CATEGORY_COLORS = [
  { name: 'Indigo', value: '#6366f1' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Emerald', value: '#10b981' },
  { name: 'Teal', value: '#14b8a6' },
  { name: 'Rose', value: '#f43f5e' },
  { name: 'Amber', value: '#f59e0b' },
  { name: 'Purple', value: '#8b5cf6' },
  { name: 'Cyan', value: '#06b6d4' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Pink', value: '#ec4899' },
];

export const CATEGORY_ICONS = [
  { name: 'Folder', icon: Folder, label: 'Folder' },
  { name: 'Tag', icon: Tag, label: 'Tag' },
  { name: 'Briefcase', icon: Briefcase, label: 'Work' },
  { name: 'User', icon: User, label: 'Personal' },
  { name: 'Palette', icon: Palette, label: 'Design' },
  { name: 'Heart', icon: Heart, label: 'Health' },
  { name: 'DollarSign', icon: DollarSign, label: 'Finance' },
  { name: 'BookOpen', icon: BookOpen, label: 'Reading' },
  { name: 'Star', icon: Star, label: 'Important' },
  { name: 'ShoppingBag', icon: ShoppingBag, label: 'Shopping' },
  { name: 'Home', icon: Home, label: 'Home' },
  { name: 'Code', icon: Code, label: 'Tech' },
  { name: 'Target', icon: Target, label: 'Goals' },
  { name: 'Coffee', icon: Coffee, label: 'Lifestyle' },
  { name: 'Smile', icon: Smile, label: 'Hobbies' },
  { name: 'Sparkles', icon: Sparkles, label: 'Creative' },
];

export const getCategoryIconComponent = (iconName: string) => {
  const found = CATEGORY_ICONS.find((item) => item.name === iconName);
  return found ? found.icon : Folder;
};

export const NewCategoryModal: React.FC<NewCategoryModalProps> = ({
  isOpen,
  onClose,
  onCategoryCreated,
}) => {
  const { addNewCategory, language } = useApp();
  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState(CATEGORY_COLORS[0].value);
  const [selectedIcon, setSelectedIcon] = useState('Folder');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError(language === 'ar' ? 'يرجى إدخال اسم التصنيف' : 'Category name is required');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const created = await addNewCategory({
        name: name.trim(),
        color: selectedColor,
        icon: selectedIcon,
      });

      setName('');
      setSelectedColor(CATEGORY_COLORS[0].value);
      setSelectedIcon('Folder');
      if (onCategoryCreated) {
        onCategoryCreated(created);
      }
      onClose();
    } catch (err) {
      console.error('Failed to create category:', err);
      setError(language === 'ar' ? 'فشل إنشاء التصنيف' : 'Failed to create category');
    } finally {
      setLoading(false);
    }
  };

  const PreviewIcon = getCategoryIconComponent(selectedIcon);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={language === 'ar' ? 'إضافة تصنيف جديد' : 'New Category'}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 rounded-xl text-xs text-rose-600 dark:text-rose-300">
            {error}
          </div>
        )}

        {/* Category Name */}
        <Input
          label={language === 'ar' ? 'اسم التصنيف *' : 'Category Name *'}
          placeholder={language === 'ar' ? 'مثال: التسوق، العمل الحر، العائلة...' : 'e.g. Shopping, Freelance, Home...'}
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
        />

        {/* Live Preview */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">
            {language === 'ar' ? 'معاينة شارة التصنيف' : 'Category Badge Preview'}
          </label>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex items-center justify-between">
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold shadow-xs transition-colors"
              style={{
                backgroundColor: `${selectedColor}18`,
                color: selectedColor,
                border: `1px solid ${selectedColor}40`,
              }}
            >
              <PreviewIcon className="w-3.5 h-3.5" />
              <span>{name.trim() || (language === 'ar' ? 'اسم التصنيف' : 'Category Name')}</span>
            </span>
            <span className="text-[11px] text-slate-400">
              {language === 'ar' ? 'سيظهر بهذا الشكل في المهام' : 'Shown on task cards'}
            </span>
          </div>
        </div>

        {/* Color Palette */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">
            {language === 'ar' ? 'لون التصنيف' : 'Color Token'}
          </label>
          <div className="flex flex-wrap gap-2.5 items-center">
            {CATEGORY_COLORS.map((c) => (
              <button
                key={c.value}
                type="button"
                onClick={() => setSelectedColor(c.value)}
                className="w-7 h-7 rounded-full transition-transform flex items-center justify-center cursor-pointer hover:scale-110 active:scale-95 focus:outline-none"
                style={{ backgroundColor: c.value }}
                title={c.name}
              >
                {selectedColor === c.value && <Check className="w-4 h-4 text-white drop-shadow-sm" />}
              </button>
            ))}
          </div>
        </div>

        {/* Icon Selection */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">
            {language === 'ar' ? 'أيقونة التصنيف' : 'Category Icon'}
          </label>
          <div className="grid grid-cols-8 sm:grid-cols-8 gap-2">
            {CATEGORY_ICONS.map((item) => {
              const IconComp = item.icon;
              const isSelected = selectedIcon === item.name;
              return (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => setSelectedIcon(item.name)}
                  className={`p-2 rounded-xl border flex items-center justify-center transition-all cursor-pointer ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 ring-2 ring-indigo-500/20 shadow-xs'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:border-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                  }`}
                  title={item.label}
                >
                  <IconComp className="w-4 h-4" />
                </button>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            {getTranslation(language, 'btn_cancel')}
          </Button>
          <Button type="submit" variant="primary" size="sm" isLoading={loading}>
            {language === 'ar' ? 'إنشاء التصنيف' : 'Create Category'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
