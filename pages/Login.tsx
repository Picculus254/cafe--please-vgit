
import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { UserRole } from '../types';
import { api } from '../services/mockApi';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Icon } from '../components/ui/Icon';
import { useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
  const { dispatch } = useAppContext();
  const navigate = useNavigate();
  
  // State for Assistant Login
  const [assistantName, setAssistantName] = useState('');
  const [assistantPassword, setAssistantPassword] = useState('');
  const [assistantError, setAssistantError] = useState('');

  // State for Manager Login
  const [managerName, setManagerName] = useState('');
  const [managerPassword, setManagerPassword] = useState('');
  const [managerError, setManagerError] = useState('');

  const handleLogin = (e: React.FormEvent, name: string, pass: string, role: UserRole) => {
    e.preventDefault();
    setAssistantError('');
    setManagerError('');
    
    const user = api.login(name, pass, role);
    if (user) {
      dispatch({ type: 'LOGIN', payload: user });
      if ([UserRole.MANAGER, UserRole.ADMIN].includes(user.role)) {
        navigate('/manager');
      } else {
        navigate('/assistant');
      }
    } else {
      if (role === UserRole.ASSISTANT) {
        setAssistantError('Credenciais inválidas.');
      } else {
        setManagerError('Credenciais inválidas.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-brand-background flex flex-col justify-center items-center p-4">
        <div className="flex items-center space-x-3 mb-8">
            <Icon name="Coffee" size={48} className="text-brand-primary" />
            <h1 className="text-4xl font-bold text-brand-text">CAFÈ PLEASE ☕️</h1>
        </div>
      
      <div className="w-full max-w-4xl flex flex-col md:flex-row md:space-x-8 space-y-8 md:space-y-0">
        
        {/* Assistant Login */}
        <div className="flex-1">
          <Card className="w-full h-full">
            <h2 className="text-2xl font-bold text-center text-brand-text mb-2">Acesso Assistente</h2>
            <p className="text-center text-gray-500 mb-6">Login para assistentes de equipa.</p>
            
            <form onSubmit={(e) => handleLogin(e, assistantName, assistantPassword, UserRole.ASSISTANT)} data-testid="assistant-login-form">
              <div className="mb-4">
                <label className="block text-brand-text font-semibold mb-2" htmlFor="assistant-name">
                  Nome
                </label>
                <input
                  type="text"
                  id="assistant-name"
                  value={assistantName}
                  onChange={(e) => setAssistantName(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  placeholder="Seu nome de assistente"
                  required
                />
              </div>
              <div className="mb-6">
                <label className="block text-brand-text font-semibold mb-2" htmlFor="assistant-password">
                  Palavra-passe
                </label>
                <input
                  type="password"
                  id="assistant-password"
                  value={assistantPassword}
                  onChange={(e) => setAssistantPassword(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  placeholder="******"
                  required
                />
              </div>
              {assistantError && <p className="text-brand-danger text-center mb-4">{assistantError}</p>}
              <Button type="submit" className="w-full" variant="primary">
                Entrar
              </Button>
            </form>
          </Card>
        </div>

        {/* Divider */}
        <div className="hidden md:flex items-center">
            <div className="h-full w-px bg-gray-300"></div>
        </div>

        {/* Manager Login */}
        <div className="flex-1">
          <Card className="w-full h-full">
            <h2 className="text-2xl font-bold text-center text-brand-text mb-2">Acesso Gestor</h2>
            <p className="text-center text-gray-500 mb-6">Login para gestores e administradores.</p>
            
            <form onSubmit={(e) => handleLogin(e, managerName, managerPassword, UserRole.MANAGER)} data-testid="manager-login-form">
              <div className="mb-4">
                <label className="block text-brand-text font-semibold mb-2" htmlFor="manager-name">
                  Nome
                </label>
                <input
                  type="text"
                  id="manager-name"
                  value={managerName}
                  onChange={(e) => setManagerName(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  placeholder="Seu nome de gestor"
                  required
                />
              </div>
              <div className="mb-6">
                <label className="block text-brand-text font-semibold mb-2" htmlFor="manager-password">
                  Palavra-passe
                </label>
                <input
                  type="password"
                  id="manager-password"
                  value={managerPassword}
                  onChange={(e) => setManagerPassword(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  placeholder="******"
                  required
                />
              </div>
              {managerError && <p className="text-brand-danger text-center mb-4">{managerError}</p>}
              <Button type="submit" className="w-full" variant="secondary">
                Entrar
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Login;