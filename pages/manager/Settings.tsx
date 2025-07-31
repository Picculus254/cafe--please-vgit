

import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { AppSettings, AssistantType, CodeType } from '../../types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Icon } from '../../components/ui/Icon';
import { Link } from 'react-router-dom';

const otherCodeTypes = Object.values(CodeType).filter(ct => ct !== CodeType.BREAK).join(', ');

const Settings: React.FC = () => {
    const { state, dispatch } = useAppContext();
    const [settings, setSettings] = useState<AppSettings>(state.settings);

    useEffect(() => {
        setSettings(state.settings);
    }, [state.settings]);

    const handleAutoApproveChange = (type: AssistantType, checked: boolean) => {
        setSettings(prev => ({
            ...prev,
            autoApprove: {
                ...prev.autoApprove,
                [type]: checked,
            }
        }));
    };

    const handleLimitChange = (e: React.ChangeEvent<HTMLInputElement>, type: AssistantType, field: 'maxOnBreak' | 'maxOnOther') => {
        const value = Number(e.target.value);
        setSettings(prev => ({
            ...prev,
            limits: {
                ...prev.limits,
                [type]: {
                    ...prev.limits[type],
                    [field]: value >= 0 ? value : 0,
                }
            }
        }));
    };

    const handleGenericChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setSettings(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : Number(value)
        }));
    };

    const handleSave = () => {
        dispatch({ type: 'UPDATE_SETTINGS', payload: settings });
        dispatch({ type: 'ADD_NOTIFICATION', payload: { id: `notif-${Date.now()}`, message: 'Configurações salvas com sucesso!', type: 'success' } });
    };

    // Ensure settings objects exist to prevent runtime errors
    if (!settings.limits) {
        settings.limits = {
            [AssistantType.INBOUND]: { maxOnBreak: 0, maxOnOther: 0 },
            [AssistantType.OUTBOUND]: { maxOnBreak: 0, maxOnOther: 0 },
            [AssistantType.AMIGO]: { maxOnBreak: 0, maxOnOther: 0 },
        };
    }
     if (!settings.autoApprove) {
        settings.autoApprove = {
            [AssistantType.INBOUND]: false,
            [AssistantType.OUTBOUND]: false,
            [AssistantType.AMIGO]: false,
        };
    }


    return (
        <div className="p-4 md:p-8">
            <Card>
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center">
                        <Icon name="Settings" size={32} className="text-brand-primary mr-3" />
                        <h1 className="text-2xl font-bold text-brand-text">Configurações do Sistema</h1>
                    </div>
                    <Link to="/manager">
                        <Button variant="secondary">
                            <Icon name="ArrowLeft" className="mr-2" />
                            Voltar
                        </Button>
                    </Link>
                </div>

                <div className="space-y-6">
                    <div>
                        <h3 className="text-lg font-semibold text-brand-text mb-4">Bots de Aprovação Automática</h3>
                        <div className="space-y-4">
                            {Object.values(AssistantType).map(type => (
                                <div key={type} className="p-4 border rounded-lg bg-gray-50">
                                    <div className="flex items-center justify-between mb-4">
                                        <h4 className="text-xl font-bold text-brand-text">{type}</h4>
                                        <div className="flex items-center space-x-3">
                                            <label htmlFor={`autoApprove-${type}`} className="font-medium">
                                                Bot Ativo
                                            </label>
                                            <input
                                                type="checkbox"
                                                id={`autoApprove-${type}`}
                                                checked={settings.autoApprove?.[type] ?? false}
                                                onChange={(e) => handleAutoApproveChange(type, e.target.checked)}
                                                className="h-6 w-6 rounded text-brand-primary focus:ring-brand-primary"
                                            />
                                        </div>
                                    </div>

                                    <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 transition-opacity ${!settings.autoApprove?.[type] ? 'opacity-50' : ''}`}>
                                        <div>
                                            <label htmlFor={`maxOnBreak-${type}`} className="block font-medium mb-1 text-sm">Nº máximo em BREAK</label>
                                            <input
                                                type="number"
                                                id={`maxOnBreak-${type}`}
                                                value={settings.limits[type]?.maxOnBreak ?? 0}
                                                onChange={(e) => handleLimitChange(e, type, 'maxOnBreak')}
                                                disabled={!settings.autoApprove?.[type]}
                                                className="w-full p-2 border rounded-md disabled:bg-gray-200"
                                                min="0"
                                            />
                                            <p className="text-xs text-gray-500 mt-1">
                                                (Inclui: {CodeType.BREAK})
                                            </p>
                                        </div>
                                        <div>
                                            <label htmlFor={`maxOnOther-${type}`} className="block font-medium mb-1 text-sm">Nº máximo em OUTROS CÓDIGOS</label>
                                             <input
                                                type="number"
                                                id={`maxOnOther-${type}`}
                                                value={settings.limits[type]?.maxOnOther ?? 0}
                                                onChange={(e) => handleLimitChange(e, type, 'maxOnOther')}
                                                disabled={!settings.autoApprove?.[type]}
                                                className="w-full p-2 border rounded-md disabled:bg-gray-200"
                                                min="0"
                                            />
                                            <p className="text-xs text-gray-500 mt-1">
                                                (Inclui: {otherCodeTypes})
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                     <div className="p-4 border rounded-lg">
                        <h3 className="text-lg font-semibold mb-2 text-brand-text">Geral</h3>
                        <div>
                            <label htmlFor="validationTimeout" className="block font-medium mb-1">Tempo para assistente validar pedido (segundos)</label>
                            <input
                                type="number"
                                id="validationTimeout"
                                name="validationTimeout"
                                value={settings.validationTimeout}
                                onChange={handleGenericChange}
                                className="w-full p-2 border rounded-md"
                                min="10"
                            />
                        </div>
                    </div>
                </div>

                <div className="mt-8 flex justify-end">
                    <Button onClick={handleSave}>Salvar Alterações</Button>
                </div>
            </Card>
        </div>
    );
};

export default Settings;