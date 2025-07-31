import React from 'react';
import { useAppContext } from '../context/AppContext';
import { Icon } from './ui/Icon';
import { Button } from './ui/Button';

export const Header: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const { currentUser } = state;

  const handleLogout = () => {
    dispatch({ type: 'LOGOUT' });
  };

  return (
    <header className="bg-white shadow-sm p-4 flex justify-between items-center">
      <div className="flex items-center space-x-3">
        <Icon name="Coffee" size={32} className="text-brand-primary" />
        <h1 className="text-2xl font-bold text-brand-text">CAFÈ PLEASE ☕️</h1>
      </div>
      {currentUser && (
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="font-semibold text-brand-text">{currentUser.name}</p>
            <p className="text-sm text-gray-500">{currentUser.role}</p>
          </div>
          <Button onClick={handleLogout} variant="secondary" size="xs">
            <Icon name="LogOut" size={20} />
          </Button>
        </div>
      )}
    </header>
  );
};
