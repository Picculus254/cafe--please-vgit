
import React, { useState } from 'react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Icon } from './ui/Icon';
import { useAppContext } from '../context/AppContext';
import { api } from '../services/mockApi';

export const PasswordChangeCard: React.FC = () => {
    const { state, dispatch } = useAppContext();
    const { currentUser } = state;
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const addNotification = (message: string, type: 'success' | 'error' | 'info') => {
        dispatch({ type: 'ADD_NOTIFICATION', payload: { id: `notif-${Date.now()}`, message, type } });
    };

    const resetForm = () => {
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setError('');
        setIsFormVisible(false);
        setIsLoading(false);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!currentUser) return;

        if (newPassword !== confirmPassword) {
            setError('As novas palavras-passe não coincidem.');
            return;
        }
        if (newPassword.length < 4) {
            setError('A nova palavra-passe deve ter pelo menos 4 caracteres.');
            return;
        }

        setIsLoading(true);
        
        // Simulate API delay
        setTimeout(() => {
            const success = api.changePassword(currentUser.id, currentPassword, newPassword);

            if (success) {
                addNotification('Palavra-passe alterada com sucesso!', 'success');
                resetForm();
            } else {
                setError('A sua palavra-passe atual está incorreta.');
                setIsLoading(false);
            }
        }, 500);
    };

    if (!isFormVisible) {
        return (
            <Card>
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-xl font-bold text-brand-text flex items-center">
                            <Icon name="Lock" className="mr-2" />
                            Segurança
                        </h3>
                        <p className="text-sm text-gray-500">Altere a sua palavra-passe.</p>
                    </div>
                    <Button onClick={() => setIsFormVisible(true)}>Alterar</Button>
                </div>
            </Card>
        );
    }

    return (
        <Card className="border-2 border-brand-primary">
            <h3 className="text-xl font-bold text-brand-text mb-4 flex items-center">
                <Icon name="Lock" className="mr-2" />
                Alterar Palavra-passe
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="font-semibold text-brand-text block mb-1">Palavra-passe Atual</label>
                    <input
                        type="password"
                        value={currentPassword}
                        onChange={e => setCurrentPassword(e.target.value)}
                        className="w-full p-2 border rounded-md"
                        required
                    />
                </div>
                <div>
                    <label className="font-semibold text-brand-text block mb-1">Nova Palavra-passe</label>
                    <input
                        type="password"
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        className="w-full p-2 border rounded-md"
                        required
                    />
                </div>
                <div>
                    <label className="font-semibold text-brand-text block mb-1">Confirmar Nova Palavra-passe</label>
                    <input
                        type="password"
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        className="w-full p-2 border rounded-md"
                        required
                    />
                </div>
                {error && <p className="text-brand-danger text-sm">{error}</p>}
                <div className="flex justify-end space-x-3">
                    <Button type="button" variant="secondary" onClick={resetForm} disabled={isLoading}>Cancelar</Button>
                    <Button type="submit" variant="primary" disabled={isLoading}>
                        {isLoading ? <Icon name="Loader" className="animate-spin" /> : 'Salvar Alterações'}
                    </Button>
                </div>
            </form>
        </Card>
    );
};
