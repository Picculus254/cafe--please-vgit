
import React from 'react';
import { useAppContext } from '../../context/AppContext';
import { RequestStatus, CodeType, AssistantType } from '../../types';
import { Card } from '../../components/ui/Card';
import { Icon } from '../../components/ui/Icon';
import { Link } from 'react-router-dom';

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ComponentProps<typeof Icon>['name']; color: string }> = ({ title, value, icon, color }) => (
    <Card className="flex items-center p-4">
        <div className={`p-3 rounded-full mr-4 ${color}`}>
            <Icon name={icon} size={24} className="text-white" />
        </div>
        <div>
            <p className="text-sm text-gray-500">{title}</p>
            <p className="text-2xl font-bold text-brand-text">{value}</p>
        </div>
    </Card>
);

const ManagerDashboard: React.FC = () => {
    const { state } = useAppContext();
    const { requests, users } = state;

    const teams = [AssistantType.INBOUND, AssistantType.OUTBOUND, AssistantType.AMIGO];

    const teamStats = teams.map(team => {
        const teamAssistants = users.filter(u => u.assistantType === team);
        const teamAssistantIds = new Set(teamAssistants.map(u => u.id));
        const teamRequests = requests.filter(r => teamAssistantIds.has(r.userId));

        return {
            teamName: team,
            pendingRequests: teamRequests.filter(r => r.status === RequestStatus.PENDING).length,
            activeBreaks: teamRequests.filter(r => r.codeType === CodeType.BREAK && r.status === RequestStatus.ACTIVE).length,
            activeOthers: teamRequests.filter(r => r.codeType !== CodeType.BREAK && r.status === RequestStatus.ACTIVE).length,
            totalAssistants: teamAssistants.length,
        };
    });
    
    const navLinks = [
        { to: '/manager/requests', icon: 'ListChecks', label: 'Gerir Pedidos' },
        { to: '/manager/users', icon: 'Users', label: 'Gerir Utilizadores' },
        { to: '/manager/settings', icon: 'Settings', label: 'Configurações' },
        { to: '/manager/stats', icon: 'BarChart3', label: 'Estatísticas' },
        { to: '/manager/gamification', icon: 'Trophy', label: 'Gamificação' },
        { to: '/manager/sales', icon: 'DollarSign', label: 'Desempenho Vendas' },
    ];

    return (
        <div className="p-4 md:p-8 space-y-8">
            <div className="space-y-8">
                {teamStats.map(stats => (
                    <Card key={stats.teamName}>
                        <h2 className="text-xl font-bold text-brand-text mb-4 border-b-2 border-brand-secondary pb-2">Equipa {stats.teamName}</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            <StatCard title="Pedidos Pendentes" value={stats.pendingRequests} icon="Hourglass" color="bg-brand-warning" />
                            <StatCard title="Em Break" value={stats.activeBreaks} icon="Coffee" color="bg-brand-primary" />
                            <StatCard title="Outros Códigos Ativos" value={stats.activeOthers} icon="ClipboardList" color="bg-brand-accent" />
                            <StatCard title="Total de Assistentes" value={stats.totalAssistants} icon="User" color="bg-sky-500" />
                        </div>
                    </Card>
                ))}
            </div>

            <Card>
                <h2 className="text-xl font-bold text-brand-text mb-4">Ações Rápidas</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                    {navLinks.map(link => (
                        <Link key={link.to} to={link.to} className="block text-center p-6 bg-brand-background hover:bg-brand-secondary rounded-lg transition-colors">
                            <Icon name={link.icon as any} size={40} className="mx-auto text-brand-primary mb-2" />
                            <span className="font-semibold text-brand-text">{link.label}</span>
                        </Link>
                    ))}
                </div>
            </Card>

             <Card>
                <h2 className="text-xl font-bold text-brand-text mb-4">Últimos Pedidos</h2>
                 <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b">
                                <th className="p-2">Assistente</th>
                                <th className="p-2">Tipo</th>
                                <th className="p-2">Duração</th>
                                <th className="p-2">Status</th>
                                <th className="p-2">Data</th>
                            </tr>
                        </thead>
                        <tbody>
                            {requests.slice(-5).reverse().map(req => (
                                <tr key={req.id} className="border-b hover:bg-gray-50">
                                    <td className="p-2">{req.userName}</td>
                                    <td className="p-2">{req.codeType}</td>
                                    <td className="p-2">{req.duration} min</td>
                                    <td className="p-2">{req.status}</td>
                                    <td className="p-2">{new Date(req.requestedAt).toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                 </div>
            </Card>
        </div>
    );
};

export default ManagerDashboard;
