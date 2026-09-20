import React, { forwardRef } from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, leftIcon, rightIcon, className = '', id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
              {leftIcon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={`w-full rounded-xl border bg-white dark:bg-slate-900/90 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all duration-150 py-2.5 px-3.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 disabled:opacity-50 disabled:bg-slate-50 dark:disabled:bg-slate-800 ${
              leftIcon ? 'pl-10' : ''
            } ${rightIcon ? 'pr-10' : ''} ${
              error
                ? 'border-rose-300 dark:border-rose-800 focus:border-rose-500 focus:ring-rose-500/20'
                : 'border-slate-200 dark:border-slate-700/80 hover:border-slate-300 dark:hover:border-slate-600'
            } ${className}`}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 flex items-center text-slate-400 dark:text-slate-500">
              {rightIcon}
            </div>
          )}
        </div>
        {error ? (
          <p className="mt-1 text-xs text-rose-500 dark:text-rose-400">{error}</p>
        ) : helperText ? (
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{helperText}</p>
        ) : null}
      </div>
    );
  }
);
Input.displayName = 'Input';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, helperText, className = '', id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5"
          >
            {label}
          </label>
        )}
        <textarea
          id={inputId}
          ref={ref}
          className={`w-full rounded-xl border bg-white dark:bg-slate-900/90 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all duration-150 py-2.5 px-3.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 min-h-[90px] ${
            error
              ? 'border-rose-300 dark:border-rose-800 focus:border-rose-500 focus:ring-rose-500/20'
              : 'border-slate-200 dark:border-slate-700/80 hover:border-slate-300 dark:hover:border-slate-600'
          } ${className}`}
          {...props}
        />
        {error ? (
          <p className="mt-1 text-xs text-rose-500 dark:text-rose-400">{error}</p>
        ) : helperText ? (
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{helperText}</p>
        ) : null}
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { label: string; value: string }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className = '', id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5"
          >
            {label}
          </label>
        )}
        <select
          id={inputId}
          ref={ref}
          className={`w-full rounded-xl border bg-white dark:bg-slate-900/90 text-sm text-slate-900 dark:text-slate-100 transition-all duration-150 py-2.5 px-3.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer ${
            error
              ? 'border-rose-300 dark:border-rose-800'
              : 'border-slate-200 dark:border-slate-700/80 hover:border-slate-300 dark:hover:border-slate-600'
          } ${className}`}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && <p className="mt-1 text-xs text-rose-500 dark:text-rose-400">{error}</p>}
      </div>
    );
  }
);
Select.displayName = 'Select';
