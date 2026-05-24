'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, Info, Flame } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

type ToastType = 'success' | 'error' | 'warning' | 'info' | 'streak';

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

interface ToastContextProps {
  toast: (type: ToastType, title: string, message?: string) => void;
  toasts: Toast[];
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextProps>({
  toast: () => {},
  toasts: [],
  removeToast: () => {},
});

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return {
    toast: context.toast,
    success: (title: string, message?: string) => context.toast('success', title, message),
    error: (title: string, message?: string) => context.toast('error', title, message),
    warning: (title: string, message?: string) => context.toast('warning', title, message),
    info: (title: string, message?: string) => context.toast('info', title, message),
    streak: (title: string, message?: string) => context.toast('streak', title, message),
  };
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback((type: ToastType, title: string, message?: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, title, message }]);
    
    // Auto-dismiss after 4 seconds
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ toast, toasts, removeToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[9999] flex flex-col space-y-2 max-w-sm w-full pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
              className="pointer-events-auto flex items-start gap-3 w-full border border-white/10 bg-[#0d0d15]/90 backdrop-blur-md p-4 rounded-xl shadow-2xl text-slate-100"
            >
              {/* Type Icon */}
              <div className="shrink-0 mt-0.5">
                {t.type === 'success' && <CheckCircle className="h-5 w-5 text-emerald-400" />}
                {t.type === 'error' && <AlertCircle className="h-5 w-5 text-red-400" />}
                {t.type === 'warning' && <AlertCircle className="h-5 w-5 text-amber-400" />}
                {t.type === 'info' && <Info className="h-5 w-5 text-cyan-400" />}
                {t.type === 'streak' && <Flame className="h-5 w-5 text-orange-500 animate-pulse" />}
              </div>

              {/* Message Details */}
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-white leading-tight">{t.title}</h4>
                {t.message && <p className="text-xs text-slate-400 mt-1 leading-snug">{t.message}</p>}
              </div>

              {/* Close Button */}
              <button
                onClick={() => removeToast(t.id)}
                className="shrink-0 text-slate-400 hover:text-white transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};
