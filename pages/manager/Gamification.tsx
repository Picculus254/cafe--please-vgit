import React, { useState, useMemo } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Icon } from '../../components/ui/Icon';
import { Link } from 'react-router-dom';
import { calculateScores } from '../../utils/gamification';
import { GamificationScore } from '../../types';

const Gamification: React.FC = () => {
    const { state } = useAppContext();
    const [period, setPeriod] = useState<'this-month' | 'last-month' | 'all-time'>('this-month');

    const rankedScores: GamificationScore[] = useMemo(() => {
        const scores = calculateScores(state.requests, state.users, period);
        return scores.map((score, index) => ({ ...score, rank: index + 1 }));
    }, [state.requests, state.users, period]);

    const getMedal = (rank: number) => {
        if (rank === 1) return <Icon name="Medal" className="text-yellow-500" />;
        if (rank === 2) return <Icon name="Medal" className="text-slate-400" />;
        if (rank === 3) return <Icon name="Medal" className="text-amber-700" />;
        return <span className="font-bold text-gray-500">{rank}º</span>;
    };
    
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
                        <Icon name="Trophy" size={32} className="text-brand-primary mr-3" />
                        <h1 className="text-2xl font-bold text-brand-text">Gamificação & Leaderboard</h1>
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

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b-2 border-gray-200">
                                <th className="p-3 text-sm font-semibold tracking-wide text-left">Rank</th>
                                <th className="p-3 text-sm font-semibold tracking-wide text-left">Assistente</th>
                                <th className="p-3 text-sm font-semibold tracking-wide text-center">Pontuação</th>
                                <th className="p-3 text-sm font-semibold tracking-wide text-center">Concluídos</th>
                                <th className="p-3 text-sm font-semibold tracking-wide text-center">Recusados</th>
                                <th className="p-3 text-sm font-semibold tracking-wide text-center">Cancelados</th>
                                <th className="p-3 text-sm font-semibold tracking-wide text-center">Expirados</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {rankedScores.length > 0 ? rankedScores.map(s => (
                                <tr key={s.userId} className={`hover:bg-gray-50 ${s.rank === 1 ? 'bg-yellow-50' : ''}`}>
                                    <td className="p-3 text-lg font-bold">{getMedal(s.rank)}</td>
                                    <td className="p-3">
                                        <p className="font-bold text-brand-text">{s.userName}</p>
                                        <p className="text-sm text-gray-500">{s.assistantType}</p>
                                    </td>
                                    <td className="p-3 text-center text-lg font-bold text-brand-primary">{s.score}</td>
                                    <td className="p-3 text-center text-green-600">{s.stats.completed}</td>
                                    <td className="p-3 text-center text-red-600">{s.stats.rejected}</td>
                                    <td className="p-3 text-center text-yellow-600">{s.stats.cancelled}</td>
                                    <td className="p-3 text-center text-purple-600">{s.stats.expired}</td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={7} className="text-center py-10 text-gray-500">
                                        <Icon name="Inbox" size={40} className="mx-auto mb-2 text-gray-400" />
                                        Nenhum dado para o período selecionado.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

            </Card>
        </div>
    );
};

export default Gamification;
