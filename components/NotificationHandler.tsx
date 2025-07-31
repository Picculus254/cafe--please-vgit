
import React, { useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { Icon } from './ui/Icon';

export const NotificationHandler: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const { notifications } = state;

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-5 right-5 z-50 space-y-3">
      {notifications.map(notification => (
        <NotificationToast key={notification.id} {...notification} onClose={() => dispatch({ type: 'REMOVE_NOTIFICATION', payload: notification.id })} />
      ))}
    </div>
  );
};

interface NotificationToastProps {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
}

const NotificationToast: React.FC<NotificationToastProps> = ({ id, message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const typeClasses = {
    success: 'bg-green-100 border-green-500 text-green-700',
    error: 'bg-red-100 border-red-500 text-red-700',
    info: 'bg-blue-100 border-blue-500 text-blue-700',
  };

  const icons = {
    success: 'CheckCircle',
    error: 'XCircle',
    info: 'Info',
  }

  return (
    <div className={`flex items-center p-4 rounded-lg shadow-lg border-l-4 ${typeClasses[type]}`} role="alert">
      <Icon name={icons[type] as keyof typeof import('lucide-react').icons} className="mr-3" />
      <div className="flex-grow">{message}</div>
      <button onClick={onClose} className="ml-4 -mr-1 p-1 rounded-md hover:bg-black/10">
        <Icon name="X" size={20} />
      </button>
    </div>
  );
};
