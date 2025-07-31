import React, { useState, useMemo } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Card } from '../../components/ui/Card';
import { Icon } from '../../components/ui/Icon';
import { RequestStatus, CodeType, Request } from '../../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Button } from '../../components/ui/Button';
import { Link } from 'react-router-dom';

const Statistics: React.FC = () => {
    const { state } = useAppContext();
    const { requests, users } = state;
    const [filters, setFilters] = useState({
        user: 'all',
        status: 'all',
        codeType: 'all',
        startDate: '',
        endDate: '',
    });

    const filteredRequests = useMemo(() => {
        return requests.filter(req => {
            const reqDate = new Date(req.requestedAt);
            const startDate = filters.startDate ? new Date(filters.startDate) : null;
            const endDate = filters.endDate ? new Date(filters.endDate) : null;

            if (startDate && reqDate < startDate) return false;
            if (endDate && reqDate > endDate) return false;
            if (filters.user !== 'all' && req.userId !== filters.user) return false;
            if (filters.status !== 'all' && req.status !== filters.status) return false;
            if (filters.codeType !== 'all' && req.codeType !== filters.codeType) return false;
            
            return true;
        });
    }, [requests, filters]);

    const chartData = useMemo(() => {
        const data: { [key: string]: any } = {};
        filteredRequests.forEach(req => {
            const day = new Date(req.requestedAt).toLocaleDateString();
            if (!data[day]) {
                data[day] = { name: day };
                Object.values(CodeType).forEach(ct => data[day][ct] = 0);
            }
            data[day][req.codeType]++;
        });
        return Object.values(data);
    }, [filteredRequests]);

    const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
        setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const exportToCSV = () => {
        const headers = ['Assistente', 'Tipo Código', 'Duração', 'Status', 'Data Pedido', 'Data Início', 'Data Fim'];
        const rows = filteredRequests.map(req => [
            req.userName,
            req.codeType,
            req.duration,
            req.status,
            req.requestedAt ? new Date(req.requestedAt).toLocaleString() : '',
            req.startedAt ? new Date(req.startedAt).toLocaleString() : '',
            req.endsAt ? new Date(req.endsAt).toLocaleString() : ''
        ].join(','));

        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "historico_pedidos.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const codeTypeColors: {[key in CodeType]: string} = {
        [CodeType.BREAK]: '#a27b5c',
        [CodeType.LUNCH]: '#e7ab79',
        [CodeType.CAMPAIGN]: '#3f4e4f',
        [CodeType.FOLLOW_UP]: '#6a994e',
        [CodeType.OTHER]: '#bc4749',
    };

    return (
        <div className="p-4 md:p-8 space-y-6">
            <Card>
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center">
                        <Icon name="BarChart3" size={32} className="text-brand-primary mr-3" />
                        <h1 className="text-2xl font-bold text-brand-text">Estatísticas e Histórico</h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button onClick={exportToCSV}><Icon name="Download" className="mr-2" /> Exportar CSV</Button>
                        <Link to="/manager">
                            <Button variant="secondary">
                                <Icon name="ArrowLeft" className="mr-2" /> Voltar
                            </Button>
                        </Link>
                    </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                    <select name="user" onChange={handleFilterChange} className="p-2 border rounded-md"><option value="all">Todos Assistentes</option>{users.filter(u=>u.role==='ASSISTANT').map(u=><option key={u.id} value={u.id}>{u.name}</option>)}</select>
                    <select name="status" onChange={handleFilterChange} className="p-2 border rounded-md"><option value="all">Todos Status</option>{Object.values(RequestStatus).map(s=><option key={s} value={s}>{s}</option>)}</select>
                    <select name="codeType" onChange={handleFilterChange} className="p-2 border rounded-md"><option value="all">Todos Tipos</option>{Object.values(CodeType).map(ct=><option key={ct} value={ct}>{ct}</option>)}</select>
                    <input type="date" name="startDate" onChange={handleFilterChange} className="p-2 border rounded-md" />
                    <input type="date" name="endDate" onChange={handleFilterChange} className="p-2 border rounded-md" />
                </div>

                <div className="h-96 w-full mb-8">
                    <ResponsiveContainer>
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            {Object.values(CodeType).map(ct => (
                                <Bar key={ct} dataKey={ct} stackId="a" fill={codeTypeColors[ct]} />
                            ))}
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                         <thead><tr className="border-b"><th className="p-2">Assistente</th><th className="p-2">Tipo</th><th className="p-2">Status</th><th className="p-2">Data Pedido</th></tr></thead>
                         <tbody>
                            {filteredRequests.slice(0, 20).map(req => (
                                <tr key={req.id} className="border-b hover:bg-gray-50"><td className="p-2">{req.userName}</td><td className="p-2">{req.codeType}</td><td className="p-2">{req.status}</td><td className="p-2">{new Date(req.requestedAt).toLocaleString()}</td></tr>
                            ))}
                         </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default Statistics;