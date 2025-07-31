import React, { useState, useRef } from 'react';
import { useAppContext } from '../../context/AppContext';
import { User, UserRole, AssistantType } from '../../types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Icon } from '../../components/ui/Icon';
import { Link } from 'react-router-dom';

const UserForm: React.FC<{ user?: User; onSave: (user: User) => void; onCancel: () => void; currentUser: User }> = ({ user, onSave, onCancel, currentUser }) => {
    const [name, setName] = useState(user?.name || '');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<UserRole>(user?.role || UserRole.ASSISTANT);
    const [assistantType, setAssistantType] = useState<AssistantType>(user?.assistantType || AssistantType.INBOUND);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || (!user && !password)) {
            alert('Nome e senha são obrigatórios para novos usuários.');
            return;
        }

        const userData: User = {
            id: user?.id || `user-${Date.now()}`,
            name,
            role,
            assistantType: role === UserRole.ASSISTANT ? assistantType : undefined,
            password: password || user?.password,
        };
        onSave(userData);
    };

    return (
        <Card className="mb-6 border-brand-primary border-2">
            <h3 className="text-xl font-bold mb-4">{user ? 'Editar Utilizador' : 'Novo Utilizador'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
                <input
                    type="text"
                    placeholder="Nome do Utilizador"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full p-2 border rounded-md"
                    required
                />
                {currentUser.role === UserRole.ADMIN && (
                     <select
                        value={role}
                        onChange={(e) => setRole(e.target.value as UserRole)}
                        className="w-full p-2 border rounded-md bg-white"
                        required
                    >
                        <option value={UserRole.ASSISTANT}>Assistente</option>
                        <option value={UserRole.MANAGER}>Gestor</option>
                    </select>
                )}
                 {role === UserRole.ASSISTANT && (
                    <select
                        value={assistantType}
                        onChange={(e) => setAssistantType(e.target.value as AssistantType)}
                        className="w-full p-2 border rounded-md bg-white"
                        required
                    >
                        <option value="" disabled>Selecione o tipo</option>
                        {Object.values(AssistantType).map(type => (
                            <option key={type} value={type}>{type}</option>
                        ))}
                    </select>
                 )}
                <input
                    type="password"
                    placeholder={user ? 'Nova Senha (opcional)' : 'Senha'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full p-2 border rounded-md"
                />
                <div className="flex justify-end space-x-3">
                    <Button type="button" variant="secondary" onClick={onCancel}>Cancelar</Button>
                    <Button type="submit" variant="primary">Salvar</Button>
                </div>
            </form>
        </Card>
    );
};

const UserManagement: React.FC = () => {
    const { state, dispatch } = useAppContext();
    const { currentUser } = state;
    const [isCreating, setIsCreating] = useState(false);
    const [editingUser, setEditingUser] = useState<User | undefined>(undefined);
    const [visiblePasswordUserId, setVisiblePasswordUserId] = useState<string | null>(null);
    const formRef = useRef<HTMLDivElement>(null);

    if (!currentUser) return null; // Should be handled by ProtectedRoute

    const handleSave = (user: User) => {
        const actionType = state.users.some(u => u.id === user.id) ? 'UPDATE_USER' : 'ADD_USER';
        dispatch({ type: actionType, payload: user });
        dispatch({ type: 'ADD_NOTIFICATION', payload: { id: `notif-${Date.now()}`, message: `Utilizador ${user.name} salvo com sucesso.`, type: 'success' } });
        setIsCreating(false);
        setEditingUser(undefined);
    };
    
    const handleDelete = (userId: string, userName: string) => {
        if (userId === currentUser.id) {
            dispatch({ type: 'ADD_NOTIFICATION', payload: { id: `notif-${Date.now()}`, message: 'Não pode apagar a sua própria conta.', type: 'error' } });
            return;
        }
        if(window.confirm(`Tem certeza que deseja remover ${userName}?`)) {
            dispatch({ type: 'DELETE_USER', payload: userId });
            dispatch({ type: 'ADD_NOTIFICATION', payload: { id: `notif-${Date.now()}`, message: 'Utilizador removido.', type: 'info' } });
        }
    }
    
    const handleCopyPassword = (password: string, name: string) => {
        navigator.clipboard.writeText(password);
        dispatch({ type: 'ADD_NOTIFICATION', payload: { id: `notif-${Date.now()}`, message: `Senha de ${name} copiada.`, type: 'info' } });
    }

    const managers = state.users.filter(u => u.role === UserRole.MANAGER || u.role === UserRole.ADMIN).sort((a,b) => a.name.localeCompare(b.name));
    const assistants = state.users.filter(u => u.role === UserRole.ASSISTANT);
    const inboundAssistants = assistants.filter(u => u.assistantType === AssistantType.INBOUND).sort((a,b) => a.name.localeCompare(b.name));
    const outboundAssistants = assistants.filter(u => u.assistantType === AssistantType.OUTBOUND).sort((a,b) => a.name.localeCompare(b.name));
    const amigoAssistants = assistants.filter(u => u.assistantType === AssistantType.AMIGO).sort((a,b) => a.name.localeCompare(b.name));

    const assistantTypeColors: {[key in AssistantType]: string} = {
        [AssistantType.INBOUND]: 'bg-blue-100 text-blue-800',
        [AssistantType.OUTBOUND]: 'bg-purple-100 text-purple-800',
        [AssistantType.AMIGO]: 'bg-teal-100 text-teal-800',
    };
    
    const roleColors: {[key in UserRole]?: string} = {
        [UserRole.ADMIN]: 'bg-red-200 text-red-800',
        [UserRole.MANAGER]: 'bg-sky-200 text-sky-800',
    };

    const renderUserGroup = (title: string, group: User[], showType: 'assistant' | 'manager') => (
        <div className="mb-8">
            <h2 className="text-xl font-bold text-brand-text mb-4 border-b-2 border-brand-secondary pb-2">{title}</h2>
            {group.length > 0 ? (
                <div className="space-y-3">
                    {group.map(user => (
                         <React.Fragment key={user.id}>
                            <div className="p-3 bg-gray-50 rounded-lg flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <p className="font-semibold text-brand-text">{user.name}</p>
                                    {showType === 'assistant' && user.assistantType && (
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${assistantTypeColors[user.assistantType]}`}>
                                            {user.assistantType}
                                        </span>
                                    )}
                                    {showType === 'manager' && user.role !== UserRole.ASSISTANT && roleColors[user.role] && (
                                         <span className={`px-2 py-1 text-xs font-semibold rounded-full ${roleColors[user.role]}`}>
                                            {user.role}
                                        </span>
                                    )}
                                </div>
                                <div className="space-x-2">
                                     {showType === 'assistant' && user.password && (
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            onClick={() => setVisiblePasswordUserId(visiblePasswordUserId === user.id ? null : user.id)}
                                            aria-label={visiblePasswordUserId === user.id ? 'Esconder senha' : 'Mostrar senha'}
                                        >
                                            <Icon name={visiblePasswordUserId === user.id ? "EyeOff" : "Eye"} size={16} />
                                        </Button>
                                    )}
                                    <Button variant="secondary" size="sm" onClick={() => { setEditingUser(user); setIsCreating(false); formRef.current?.scrollIntoView({ behavior: 'smooth' }); }}>
                                        <Icon name="Edit" size={16} />
                                    </Button>
                                    <Button variant="danger" size="sm" onClick={() => handleDelete(user.id, user.name)}>
                                        <Icon name="Trash2" size={16} />
                                    </Button>
                                </div>
                            </div>
                             {visiblePasswordUserId === user.id && (
                                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg -mt-2 flex justify-between items-center transition-all duration-300">
                                    <span className="font-mono text-yellow-900">
                                        Senha: <strong className="select-all">{user.password}</strong>
                                    </span>
                                    <Button
                                        size="xs"
                                        variant="secondary"
                                        onClick={() => handleCopyPassword(user.password || '', user.name)}
                                    >
                                        <Icon name="Copy" size={14} className="mr-1" />
                                        Copiar
                                    </Button>
                                </div>
                            )}
                        </React.Fragment>
                    ))}
                </div>
            ) : (
                <p className="text-gray-500 italic">Nenhum utilizador neste grupo.</p>
            )}
        </div>
    );

    return (
        <div className="p-4 md:p-8">
            <Card>
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center">
                        <Icon name="Users" size={32} className="text-brand-primary mr-3" />
                        <h1 className="text-2xl font-bold text-brand-text">Gerir Utilizadores</h1>
                    </div>
                    <div className="flex items-center gap-3">
                        {!isCreating && !editingUser && (
                            <Button onClick={() => { setIsCreating(true); setEditingUser(undefined); formRef.current?.scrollIntoView({ behavior: 'smooth' }); }}>
                                <Icon name="Plus" className="mr-2" /> Novo Utilizador
                            </Button>
                        )}
                        <Link to="/manager">
                            <Button variant="secondary">
                                <Icon name="ArrowLeft" className="mr-2" /> Voltar
                            </Button>
                        </Link>
                    </div>
                </div>
                
                <div ref={formRef}>
                    {(isCreating || editingUser) && (
                        <UserForm user={editingUser} onSave={handleSave} onCancel={() => { setIsCreating(false); setEditingUser(undefined); }} currentUser={currentUser}/>
                    )}
                </div>

                {currentUser.role === UserRole.ADMIN && renderUserGroup('Equipa de Gestão', managers, 'manager')}
                
                {renderUserGroup('Equipa Inbound', inboundAssistants, 'assistant')}
                {renderUserGroup('Equipa Outbound', outboundAssistants, 'assistant')}
                {renderUserGroup('Equipa Amigo', amigoAssistants, 'assistant')}
                
            </Card>
        </div>
    );
};

export default UserManagement;