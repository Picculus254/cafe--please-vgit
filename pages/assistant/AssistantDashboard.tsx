




import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { CodeType, Request, RequestStatus, Sale } from '../../types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Icon } from '../../components/ui/Icon';
import { CountdownTimer } from '../../components/CountdownTimer';
import { calculateScores, calculateSalesRanking } from '../../utils/gamification';
import { PasswordChangeCard } from '../../components/PasswordChangeCard';
import { playSound, APPROVAL_SOUND, WARNING_SOUND } from '../../utils/audio';

const RequestForm: React.FC<{ onNewRequest: (req: Request) => void }> = ({ onNewRequest }) => {
    const { state } = useAppContext();
    const [codeType, setCodeType] = useState<CodeType>(CodeType.BREAK);
    const [duration, setDuration] = useState(10);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!state.currentUser) return;

        const newRequest: Request = {
            id: `req-${Date.now()}`,
            userId: state.currentUser.id,
            userName: state.currentUser.name,
            codeType,
            duration,
            status: RequestStatus.PENDING,
            requestedAt: new Date().toISOString(),
        };
        onNewRequest(newRequest);
    };

    return (
        <Card>
            <h3 className="text-xl font-bold text-brand-text mb-4">Novo Pedido</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="font-semibold text-brand-text">Tipo de Código</label>
                    <select value={codeType} onChange={e => setCodeType(e.target.value as CodeType)} className="w-full p-2 border rounded-md mt-1">
                        {Object.values(CodeType).map(ct => <option key={ct} value={ct}>{ct}</option>)}
                    </select>
                </div>
                <div>
                    <label className="font-semibold text-brand-text">Duração</label>
                    <select value={duration} onChange={e => setDuration(Number(e.target.value))} className="w-full p-2 border rounded-md mt-1">
                        <option value={10}>10 min</option>
                        <option value={15}>15 min</option>
                        <option value={20}>20 min</option>
                    </select>
                </div>
                <Button type="submit" className="w-full">Enviar Pedido</Button>
            </form>
        </Card>
    );
};

const RequestList: React.FC<{ requests: Request[], title: string, emptyMessage: string, currentUserId?: string, "data-testid"?: string }> = ({ requests, title, emptyMessage, currentUserId, ...props }) => {
    
    const getStatusChip = (status: RequestStatus) => {
        const classes = {
            [RequestStatus.PENDING]: 'bg-yellow-100 text-yellow-800',
            [RequestStatus.APPROVED]: 'bg-blue-100 text-blue-800',
            [RequestStatus.ACTIVE]: 'bg-green-100 text-green-800 animate-pulse',
            [RequestStatus.REJECTED]: 'bg-red-100 text-red-800',
            [RequestStatus.COMPLETED]: 'bg-gray-100 text-gray-800',
            [RequestStatus.CANCELLED]: 'bg-gray-100 text-gray-800',
            [RequestStatus.EXPIRED]: 'bg-orange-100 text-orange-800',
        };
        return <span className={`px-2 py-1 text-xs font-semibold rounded-full ${classes[status]}`}>{status}</span>;
    }

    return (
        <Card {...props}>
            <h3 className="text-xl font-bold text-brand-text mb-4">{title}</h3>
            <ul className="space-y-3 max-h-96 overflow-y-auto">
                {requests.length > 0 ? requests.map((req, index) => (
                    <li key={req.id} data-testid="request-list-item" className={`p-3 rounded-lg flex items-center justify-between ${req.userId === currentUserId ? 'bg-brand-secondary' : 'bg-gray-50'}`}>
                        <div className="flex items-center space-x-3">
                            <span className="font-bold text-brand-primary">#{index + 1}</span>
                            <div>
                                <p className="font-semibold text-brand-text">{req.userName}</p>
                                <p className="text-sm text-gray-500">{req.codeType} - {req.duration} min</p>
                            </div>
                        </div>
                        {getStatusChip(req.status)}
                    </li>
                )) : <p className="text-gray-500 text-center py-4">{emptyMessage}</p>}
            </ul>
        </Card>
    );
};

const GamificationSummaryCard: React.FC = () => {
    const { state } = useAppContext();
    const { requests, users, currentUser } = state;

    const myScoreData = useMemo(() => {
        const scores = calculateScores(requests, users, 'this-month');
        const rankedScores = scores.map((score, index) => ({ ...score, rank: index + 1 }));
        return rankedScores.find(s => s.userId === currentUser?.id);
    }, [requests, users, currentUser]);

    if (!myScoreData) return null;

    return (
        <Card className="border-2 border-brand-accent">
            <h3 className="text-xl font-bold text-brand-text mb-4 flex items-center">
                <Icon name="Trophy" className="mr-2 text-brand-accent" />
                Pontuação do Mês
            </h3>
            <div className="text-center space-y-2">
                <div>
                    <p className="text-sm text-gray-600">Sua Posição</p>
                    <p className="text-4xl font-bold text-brand-primary">{myScoreData.rank}º</p>
                </div>
                <div>
                    <p className="text-sm text-gray-600">Total de Pontos</p>
                    <p className="text-2xl font-semibold text-brand-text">{myScoreData.score}</p>
                </div>
            </div>
        </Card>
    );
};

const SalesInputCard: React.FC<{ onReportSales: (count: number) => void }> = ({ onReportSales }) => {
    const [saleCount, setSaleCount] = useState<number | string>('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (typeof saleCount === 'number' && saleCount > 0) {
            onReportSales(saleCount);
            setSaleCount('');
        }
    };

    return (
        <Card>
            <h3 className="text-xl font-bold text-brand-text mb-4 flex items-center">
                <Icon name="DollarSign" className="mr-2 text-brand-success" />
                Registar Vendas
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="saleCount" className="font-semibold text-brand-text">Nº de Vendas</label>
                    <input
                        type="number"
                        id="saleCount"
                        value={saleCount}
                        onChange={e => setSaleCount(e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-full p-2 border rounded-md mt-1"
                        placeholder="Ex: 5"
                        min="1"
                        required
                    />
                </div>
                <Button type="submit" variant="success" className="w-full">
                    <Icon name="PlusCircle" className="mr-2" />
                    Registar
                </Button>
            </form>
        </Card>
    );
};

const SalesSummaryCard: React.FC = () => {
    const { state } = useAppContext();
    const { sales, users, currentUser } = state;

    const mySalesData = useMemo(() => {
        const ranking = calculateSalesRanking(sales, users, 'this-month');
        return ranking.find(s => s.userId === currentUser?.id);
    }, [sales, users, currentUser]);

    if (!mySalesData) return null;

    return (
        <Card className="border-2 border-brand-success">
            <h3 className="text-xl font-bold text-brand-text mb-4 flex items-center">
                <Icon name="TrendingUp" className="mr-2 text-brand-success" />
                Vendas do Mês
            </h3>
            <div className="text-center">
                <p className="text-sm text-gray-600">Total de Vendas</p>
                <p className="text-4xl font-bold text-brand-success">{mySalesData.totalSales}</p>
            </div>
        </Card>
    );
};


const AssistantDashboard: React.FC = () => {
    const { state, dispatch } = useAppContext();
    const { currentUser, requests, users } = state;
    const [hasPlayedWarning, setHasPlayedWarning] = useState(false);
    const prevRequestStatusRef = useRef<RequestStatus | undefined>();

    const myCurrentRequest = useMemo(() => 
        requests.find(r => r.userId === currentUser?.id && [RequestStatus.PENDING, RequestStatus.APPROVED, RequestStatus.ACTIVE].includes(r.status)),
        [requests, currentUser]
    );

    // Effect for playing sound on request approval
    useEffect(() => {
        const currentStatus = myCurrentRequest?.status;
        const prevStatus = prevRequestStatusRef.current;
        
        if (prevStatus === RequestStatus.PENDING && currentStatus === RequestStatus.APPROVED) {
            playSound(APPROVAL_SOUND);
        }
        
        prevRequestStatusRef.current = currentStatus;
    }, [myCurrentRequest?.status]);

    // Effect for playing warning sound when acceptance timer is low
    useEffect(() => {
        if (myCurrentRequest?.status !== RequestStatus.APPROVED) {
            setHasPlayedWarning(false);
        }
    }, [myCurrentRequest?.status, myCurrentRequest?.id]);

    useEffect(() => {
        let intervalId: ReturnType<typeof setInterval> | undefined;

        if (myCurrentRequest?.status === RequestStatus.APPROVED && myCurrentRequest.validationExpiresAt && !hasPlayedWarning) {
            const expiryTime = new Date(myCurrentRequest.validationExpiresAt).getTime();
            
            const checkAndPlay = () => {
                const now = new Date().getTime();
                const timeLeftSeconds = (expiryTime - now) / 1000;

                // Play warning sound when 10 seconds or less are remaining.
                if (timeLeftSeconds <= 10 && timeLeftSeconds > 0) {
                    playSound(WARNING_SOUND);
                    setHasPlayedWarning(true);
                    if (intervalId) {
                        clearInterval(intervalId);
                    }
                }
            };

            checkAndPlay();
            intervalId = setInterval(checkAndPlay, 1000);
        }

        return () => {
            if (intervalId) {
                clearInterval(intervalId);
            }
        };
    }, [myCurrentRequest, hasPlayedWarning]);


    const pendingQueue = useMemo(() => {
        if (!currentUser?.assistantType) return [];

        const userMap = new Map(users.map(user => [user.id, user]));

        return requests
            .filter(r => {
                const requestUser = userMap.get(r.userId);
                return (
                    [RequestStatus.PENDING, RequestStatus.APPROVED].includes(r.status) &&
                    requestUser?.assistantType === currentUser.assistantType
                );
            })
            .sort((a, b) => {
                // Approved requests come first
                if (a.status === RequestStatus.APPROVED && b.status !== RequestStatus.APPROVED) return -1;
                if (a.status !== RequestStatus.APPROVED && b.status === RequestStatus.APPROVED) return 1;
    
                // Then sort by requested time
                return new Date(a.requestedAt).getTime() - new Date(b.requestedAt).getTime();
            });
    }, [requests, users, currentUser]);

    const activeQueue = useMemo(() => {
        if (!currentUser?.assistantType) return [];
    
        const userMap = new Map(users.map(user => [user.id, user]));
    
        return requests
            .filter(r => {
                const requestUser = userMap.get(r.userId);
                return (
                    r.status === RequestStatus.ACTIVE &&
                    requestUser?.assistantType === currentUser.assistantType
                );
            })
            .sort((a, b) => {
                const timeA = new Date(a.startedAt || a.requestedAt).getTime();
                const timeB = new Date(b.startedAt || b.requestedAt).getTime();
                return timeA - timeB;
            });
    }, [requests, users, currentUser]);
    
    const myPosition = useMemo(() => {
        if (!myCurrentRequest || myCurrentRequest.status !== RequestStatus.PENDING) return -1;
        // Position is only calculated relative to other PENDING requests
        return pendingQueue.filter(r => r.status === RequestStatus.PENDING).findIndex(r => r.id === myCurrentRequest.id) + 1;
    }, [pendingQueue, myCurrentRequest]);

    const addNotification = useCallback((message: string, type: 'success' | 'error' | 'info') => {
        dispatch({ type: 'ADD_NOTIFICATION', payload: { id: `notif-${Date.now()}`, message, type } });
    }, [dispatch]);

    const handleNewRequest = (req: Request) => {
        if (myCurrentRequest) {
            addNotification('Você já possui um pedido ativo ou pendente.', 'error');
            return;
        }
        dispatch({ type: 'ADD_REQUEST', payload: req });
        addNotification('Pedido enviado com sucesso!', 'success');
    };

    const handleReportSales = (count: number) => {
        if (!currentUser) return;
        const newSale: Sale = {
            id: `sale-${Date.now()}`,
            userId: currentUser.id,
            saleCount: count,
            reportedAt: new Date().toISOString(),
        };
        dispatch({ type: 'ADD_SALE', payload: newSale });
        addNotification(`${count} venda(s) registada(s) com sucesso!`, 'success');
    };

    const handleValidation = useCallback((accept: boolean) => {
        if (!myCurrentRequest) return;
        
        if (accept) {
            const now = new Date();
            const endsAt = new Date(now.getTime() + myCurrentRequest.duration * 60 * 1000);
            const updatedRequest: Request = {
                ...myCurrentRequest,
                status: RequestStatus.ACTIVE,
                startedAt: now.toISOString(),
                endsAt: endsAt.toISOString(),
            };
            dispatch({ type: 'UPDATE_REQUEST', payload: updatedRequest });
            addNotification('Pausa iniciada! Aproveite.', 'info');
        } else {
             const updatedRequest: Request = {
                ...myCurrentRequest,
                status: RequestStatus.REJECTED,
                handledAt: new Date().toISOString(),
            };
            dispatch({ type: 'UPDATE_REQUEST', payload: updatedRequest });
            addNotification('Pedido recusado.', 'info');
        }
    }, [myCurrentRequest, dispatch, addNotification]);

    const handleCancel = useCallback(() => {
        if (!myCurrentRequest) return;
        const updatedRequest: Request = { ...myCurrentRequest, status: RequestStatus.CANCELLED, handledAt: new Date().toISOString() };
        dispatch({ type: 'UPDATE_REQUEST', payload: updatedRequest });
        addNotification('Pedido cancelado.', 'info');
    }, [myCurrentRequest, dispatch, addNotification]);

    const handleEndEarly = useCallback(() => {
        if (!myCurrentRequest) return;
        const updatedRequest: Request = { ...myCurrentRequest, status: RequestStatus.COMPLETED, handledAt: new Date().toISOString() };
        dispatch({ type: 'UPDATE_REQUEST', payload: updatedRequest });
        addNotification('Pausa terminada.', 'success');
    }, [myCurrentRequest, dispatch, addNotification]);

    const renderMyStatus = () => {
        if (!myCurrentRequest) return <RequestForm onNewRequest={handleNewRequest} />;
        
        switch (myCurrentRequest.status) {
            case RequestStatus.PENDING:
                return (
                    <Card className="text-center">
                        <Icon name="Hourglass" size={48} className="mx-auto text-brand-warning mb-4" />
                        <h3 className="text-xl font-bold">Pedido Pendente</h3>
                        <p className="text-gray-600">Seu pedido de {myCurrentRequest.codeType} está na fila.</p>
                        <p className="text-2xl font-bold my-4 text-brand-primary">{myPosition > 0 ? `${myPosition}º na fila` : 'Na fila'}</p>
                        <Button variant="danger" onClick={handleCancel}>Cancelar Pedido</Button>
                    </Card>
                );
            case RequestStatus.APPROVED:
                 return (
                    <Card className="text-center bg-blue-50 border-blue-500 border-2">
                        <Icon name="ThumbsUp" size={48} className="mx-auto text-blue-600 mb-4" />
                        <h3 className="text-xl font-bold">Pedido Aprovado!</h3>
                        <p className="text-gray-600 mb-4">Você tem {state.settings.validationTimeout} segundos para aceitar.</p>
                        <div className="flex justify-center space-x-4">
                            <Button variant="success" onClick={() => handleValidation(true)}>Aceitar</Button>
                            <Button variant="danger" onClick={() => handleValidation(false)}>Recusar</Button>
                        </div>
                    </Card>
                );
            case RequestStatus.ACTIVE:
                return (
                    <>
                        <CountdownTimer title={`Em ${myCurrentRequest.codeType}`} endTime={myCurrentRequest.endsAt!} onFinish={handleEndEarly} />
                        <Button variant="secondary" onClick={() => handleEndEarly()} className="w-full mt-4">Terminar Código</Button>
                    </>
                );
            default:
                 return <RequestForm onNewRequest={handleNewRequest} />;
        }
    }

    return (
        <div className="p-4 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-1 space-y-8">
                {renderMyStatus()}
                <SalesInputCard onReportSales={handleReportSales} />
                <SalesSummaryCard />
                <GamificationSummaryCard />
                <PasswordChangeCard />
            </div>
            <div className="md:col-span-2 space-y-8">
                <RequestList 
                    requests={pendingQueue} 
                    title={`Fila de Pedidos Pendentes (${currentUser?.assistantType || ''})`} 
                    emptyMessage="Nenhum pedido na fila de espera."
                    currentUserId={currentUser?.id}
                    data-testid="pending-requests-list"
                />
                <RequestList 
                    requests={activeQueue} 
                    title={`Pedidos em Curso (${currentUser?.assistantType || ''})`}
                    emptyMessage="Nenhum assistente em pausa ou código ativo."
                    currentUserId={currentUser?.id}
                    data-testid="active-requests-list"
                />
            </div>
        </div>
    );
};

export default AssistantDashboard;