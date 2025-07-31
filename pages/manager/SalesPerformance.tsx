
import React, { useState, useMemo } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Icon } from '../../components/ui/Icon';
import { Link } from 'react-router-dom';
import { calculateSalesRanking } from '../../utils/gamification';
import { SalesRanking, AssistantType } from '../../types';

const getMedal = (rank: number) => {
    if (rank === 1) return <Icon name="Medal" className="text-yellow-500" />;
    if (rank === 2) return <Icon name="Medal" className="text-slate-400" />;
    if (rank === 3) return <Icon name="Medal" className="text-amber-700" />;
    return <span className="font-bold text-gray-500">{rank}º</span>;
};

const SalesRankingTable: React.FC<{ title: string; data: SalesRanking[] }> = ({ title, data }) => (
    <div>
        <h2 className="text-xl font-bold text-brand-text mb-4 border-b-2 border-brand-secondary pb-2">{title}</h2>
        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead>
                    <tr className="border-b-2 border-gray-200">
                        <th className="p-3 text-sm font-semibold tracking-wide text-left">Rank</th>
                        <th className="p-3 text-sm font-semibold tracking-wide text-left">Assistente</th>
                        <th className="p-3 text-sm font-semibold tracking-wide text-center">Total de Vendas</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {data.length > 0 && data.some(s => s.totalSales > 0) ? data.map(s => (
                        <tr key={s.userId} className={`hover:bg-gray-50 ${s.rank === 1 ? 'bg-green-50' : ''}`}>
                            <td className="p-3 text-lg font-bold">{getMedal(s.rank)}</td>
                            <td className="p-3">
                                <p className="font-bold text-brand-text">{s.userName}</p>
                                <p className="text-sm text-gray-500">{s.assistantType}</p>
                            </td>
                            <td className="p-3 text-center text-2xl font-bold text-brand-success">{s.totalSales}</td>
                        </tr>
                    )) : (
                        <tr>
                            <td colSpan={3} className="text-center py-10 text-gray-500">
                                <Icon name="Inbox" size={40} className="mx-auto mb-2 text-gray-400" />
                                Nenhum dado de vendas para este grupo no período selecionado.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    </div>
);


const SalesPerformance: React.FC = () => {
    const { state } = useAppContext();
    const [period, setPeriod] = useState<'this-month' | 'last-month' | 'all-time'>('this-month');

    const { inboundSales, outboundSales, amigoSales } = useMemo(() => {
        const allSales = calculateSalesRanking(state.sales, state.users, period);
        
        const filterAndRank = (type: AssistantType) => {
            return allSales
                .filter(sale => sale.assistantType === type)
                .map((sale, index) => ({ ...sale, rank: index + 1 }));
        };

        return {
            inboundSales: filterAndRank(AssistantType.INBOUND),
            outboundSales: filterAndRank(AssistantType.OUTBOUND),
            amigoSales: filterAndRank(AssistantType.AMIGO),
        };

    }, [state.sales, state.users, period]);
    
    const periodLabels = {
        'this-month': 'Este Mês',
        'last-month': 'Mês Passado',
        'all-time': 'Sempre'
    };

    return (
        <div className="p-4 md:p-8">
            <Card>
                <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
                    <div className="flex items-center">
                        <Icon name="DollarSign" size={32} className="text-brand-primary mr-3" />
                        <h1 className="text-2xl font-bold text-brand-text">Desempenho de Vendas</h1>
                    </div>
                    <Link to="/manager">
                        <Button variant="secondary">
                            <Icon name="ArrowLeft" className="mr-2" /> Voltar
                        </Button>
                    </Link>
                </div>

                <div className="mb-6 flex flex-col sm:flex-row items-center gap-4 p-4 bg-gray-50 rounded-lg">
                    <h2 className="text-lg font-semibold text-brand-text whitespace-nowrap">Ver período:</h2>
                    <div className="flex items-center gap-2 flex-wrap">
                        {(Object.keys(periodLabels) as Array<keyof typeof periodLabels>).map(p => (
                            <Button
                                key={p}
                                variant={period === p ? 'primary' : 'secondary'}
                                onClick={() => setPeriod(p)}
                                size="xs"
                            >
                                {periodLabels[p]}
                            </Button>
                        ))}
                    </div>
                </div>

                <div className="space-y-8">
                   <SalesRankingTable title="Equipa Inbound" data={inboundSales} />
                   <SalesRankingTable title="Equipa Outbound" data={outboundSales} />
                   <SalesRankingTable title="Equipa Amigo" data={amigoSales} />
                </div>
            </Card>
        </div>
    );
};

export default SalesPerformance;
