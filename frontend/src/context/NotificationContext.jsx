import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, AlertCircle, X, Info } from 'lucide-react';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);

  const showNotification = useCallback((message, type = 'success') => {
    const id = Date.now();
    setNotifications((prev) => [...prev, { id, message, type }]);
    
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 4000);
  }, []);

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-4 pointer-events-none">
        {notifications.map((n) => (
          <Toast 
            key={n.id} 
            {...n} 
            onClose={() => setNotifications((prev) => prev.filter((notif) => notif.id !== n.id))} 
          />
        ))}
      </div>
    </NotificationContext.Provider>
  );
}

function Toast({ message, type, onClose }) {
  const icons = {
    success: <CheckCircle className="text-pink-accent" size={24} />,
    error: <AlertCircle className="text-red-500" size={24} />,
    info: <Info className="text-blue-500" size={24} />
  };

  const styles = {
    success: 'border-pink-accent shadow-[6px_6px_0px_0px_#ff0a60]',
    error: 'border-red-500 shadow-[6px_6px_0px_0px_#ef4444]',
    info: 'border-blue-500 shadow-[6px_6px_0px_0px_#3b82f6]'
  };

  return (
    <div className={`
      pointer-events-auto flex items-center gap-4 p-4 min-w-[280px] bg-white border-2 rounded-lg
      animate-in slide-in-from-right-10 fade-in duration-500 cubic-bezier(0.16, 1, 0.3, 1)
      ${styles[type] || styles.info}
    `}>
      <div className="shrink-0 animate-pulse">{icons[type]}</div>
      <div className="flex-1">
        <p className="font-logo text-gray-900 leading-tight">{message}</p>
      </div>
      <button 
        onClick={onClose}
        className="text-gray-400 hover:text-pink-accent transition-colors p-1"
      >
        <X size={18} />
      </button>
    </div>
  );
}

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotification must be used within NotificationProvider');
  return context;
};
