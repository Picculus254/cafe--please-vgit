import React, { useState, useMemo, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Request, RequestStatus, AssistantType } from '../../types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Icon } from '../../components/ui/Icon';
import { Link } from 'react-router-dom';

// A smaller, inline timer for the list view
const InlineTimer: React.FC<{ endTime: string | undefined }> = ({ endTime }) => {
    const [timeLeft, setTimeLeft] = useState('00:00');

    useEffect(() => {
        if (!endTime) return;

        const intervalId = setInterval(() => {
            const distance = new Date(endTime).getTime() - new Date().getTime();

            if (distance < 0) {
                setTimeLeft('Finalizado');
                clearInterval(intervalId);
                return;
            }

            const minutes = String(Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))).padStart(2, '0');
            const seconds = String(Math.floor((distance % (1000 * 60)) / 1000)).padStart(2, '0');
            setTimeLeft(`${minutes}:${seconds}`);
        }, 1000);

        return () => clearInterval(intervalId);
    }, [endTime]);

    return <span className="font-mono font-semibold text-brand-success">{timeLeft}</span>;
};

// A dedicated component for each team's request section
const TeamRequestSection: React.FC<{
    teamType: AssistantType;
    requests: {
        pending: Request[];
        approved: Request[];
        active: Request[];
        history: Request[];
    };
    handleRequestAction: (request: Request, approve: boolean) => void;
}> = ({ teamType, requests, handleRequestAction }) => {
    const [activeTab, setActiveTab] = useState<RequestStatus | 'HISTORY'>(RequestStatus.PENDING);

    const renderList = (requestsToList: Request[], type: typeof activeTab) => {
        if (requestsToList.length === 0) {
            return (
                <div className="text-center py-10">
                    <Icon name="Inbox" size={48} className="mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500">Nenhum pedido nesta categoria.</p>
                </div>
            );
        }
        return (
            <div className="space-y-4 max-h-[400px] overflow-y-auto p-1">
                {requestsToList.map(req => (
                    <div key={req.id} data-testid="request-item" className="p-4 rounded-lg bg-gray-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex-grow">
                            <p className="font-bold text-lg text-brand-text">{req.userName}</p>
                            <p className="text-gray-600">{req.codeType} - {req.duration} min</p>
                            <p className="text-sm text-gray-400">Pedido em: {new Date(req.requestedAt).toLocaleString()}</p>
                        </div>
                        <div className="flex items-center space-x-3 flex-shrink-0 w-full sm:w-auto justify-end">
                            {type === RequestStatus.PENDING && (
                                <>
                                    <Button variant="success" onClick={() => handleRequestAction(req, true)} size="xs"><Icon name="Check" className="mr-1" /> Aprovar</Button>
                                    <Button variant="danger" onClick={() => handleRequestAction(req, false)} size="xs"><Icon name="X" className="mr-1" /> Recusar</Button>
                                </>
                            )}
                            {type === RequestStatus.ACTIVE && (
                                <div className="flex items-center space-x-2 text-lg">
                                    <Icon name="Timer" className="text-brand-success" />
                                    <InlineTimer endTime={req.endsAt} />
                                </div>
                            )}
                            {type === RequestStatus.APPROVED && <span className="text-sm font-semibold text-blue-600">Aguardando assistente...</span>}
                            {type === 'HISTORY' && <span className="text-sm font-semibold text-gray-600">{req.status}</span>}
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    const tabs = [
        { status: RequestStatus.PENDING, label: 'Pendentes', data: requests.pending },
        { status: RequestStatus.APPROVED, label: 'Aprovados', data: requests.approved },
        { status: RequestStatus.ACTIVE, label: 'Em Curso', data: requests.active },
        { status: 'HISTORY', label: 'Histórico', data: requests.history },
    ];

    return (
        <Card>
            <h2 className="text-xl font-bold text-brand-text mb-4 border-b-2 border-brand-secondary pb-2">Equipa {teamType}</h2>

            <div className="border-b border-gray-200 mb-6">
                <nav className="-mb-px flex space-x-6 overflow-x-auto">
                    {tabs.map(tab => (
                        <button
                            key={tab.status}
                            onClick={() => setActiveTab(tab.status as any)}
                            className={`${
                                activeTab === tab.status
                                    ? 'border-brand-primary text-brand-primary'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
                        >
                            {tab.label}
                            {tab.data.length > 0 && (
                                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium ${activeTab === tab.status ? 'bg-brand-primary text-white' : 'bg-gray-200 text-gray-800'}`}>
                                    {tab.data.length}
                                </span>
                            )}
                        </button>
                    ))}
                </nav>
            </div>

            <div>
                {activeTab === RequestStatus.PENDING && renderList(requests.pending, RequestStatus.PENDING)}
                {activeTab === RequestStatus.APPROVED && renderList(requests.approved, RequestStatus.APPROVED)}
                {activeTab === RequestStatus.ACTIVE && renderList(requests.active, RequestStatus.ACTIVE)}
                {activeTab === 'HISTORY' && renderList(requests.history, 'HISTORY')}
            </div>
        </Card>
    );
};


const RequestManagement: React.FC = () => {
    const { state, dispatch } = useAppContext();

    const handleRequestAction = (request: Request, approve: boolean) => {
        const status = approve ? RequestStatus.APPROVED : RequestStatus.REJECTED;
        const updatedRequest: Request = {
            ...request,
            status,
            handledAt: new Date().toISOString(),
        };
        if (approve) {
            updatedRequest.validationExpiresAt = new Date(Date.now() + state.settings.validationTimeout * 1000).toISOString();
        }
        dispatch({ type: 'UPDATE_REQUEST', payload: updatedRequest });
        dispatch({ type: 'ADD_NOTIFICATION', payload: { id: `notif-${Date.now()}`, message: `Pedido de ${request.userName} foi ${approve ? 'aprovado' : 'recusado'}.`, type: 'info' } });
    };

    const requestsByTeam = useMemo(() => {
        const userMap = new Map(state.users.map(u => [u.id, u]));

        const initialData: { [key in AssistantType]: { pending: Request[], approved: Request[], active: Request[], history: Request[] } } = {
            [AssistantType.INBOUND]: { pending: [], approved: [], active: [], history: [] },
            [AssistantType.OUTBOUND]: { pending: [], approved: [], active: [], history: [] },
            [AssistantType.AMIGO]: { pending: [], approved: [], active: [], history: [] },
        };

        state.requests.forEach(req => {
            const user = userMap.get(req.userId);
            if (!user || !user.assistantType) return;

            const teamData = initialData[user.assistantType];
            if (!teamData) return;

            switch (req.status) {
                case RequestStatus.PENDING:
                    teamData.pending.push(req);
                    break;
                case RequestStatus.APPROVED:
                    teamData.approved.push(req);
                    break;
                case RequestStatus.ACTIVE:
                    teamData.active.push(req);
                    break;
                case RequestStatus.COMPLETED:
                case RequestStatus.REJECTED:
                case RequestStatus.CANCELLED:
                case RequestStatus.EXPIRED:
                    teamData.history.push(req);
                    break;
            }
        });

        // Sort each array
        Object.values(initialData).forEach(teamData => {
            teamData.pending.sort((a, b) => new Date(a.requestedAt).getTime() - new Date(b.requestedAt).getTime());
            teamData.approved.sort((a, b) => new Date(a.handledAt || '').getTime() - new Date(b.handledAt || '').getTime());
            teamData.active.sort((a, b) => new Date(a.startedAt || '').getTime() - new Date(b.startedAt || '').getTime());
            teamData.history.sort((a, b) => new Date(b.handledAt || b.requestedAt).getTime() - new Date(a.handledAt || a.requestedAt).getTime());
            // Limit history to most recent 50
            teamData.history = teamData.history.slice(0, 50);
        });

        return initialData;
    }, [state.requests, state.users]);

    return (
        <div className="p-4 md:p-8 space-y-6">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center">
                    <Icon name="ListChecks" size={32} className="text-brand-primary mr-3" />
                    <h1 className="text-2xl font-bold text-brand-text">Visão Geral dos Pedidos</h1>
                </div>
                <Link to="/manager">
                    <Button variant="secondary">
                        <Icon name="ArrowLeft" className="mr-2" />
                        Voltar
                    </Button>
                </Link>
            </div>

            {Object.values(AssistantType).map(teamType => (
                <TeamRequestSection
                    key={teamType}
                    teamType={teamType}
                    requests={requestsByTeam[teamType]}
                    handleRequestAction={handleRequestAction}
                />
            ))}
        </div>
    );
};

export default RequestManagement;