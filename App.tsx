import React from 'react';
import { HashRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AppProvider, useAppContext } from './context/AppContext';
import Login from './pages/Login';
import AssistantDashboard from './pages/assistant/AssistantDashboard';
import ManagerDashboard from './pages/manager/ManagerDashboard';
import RequestManagement from './pages/manager/RequestManagement';
import UserManagement from './pages/manager/UserManagement';
import Settings from './pages/manager/Settings';
import Statistics from './pages/manager/Statistics';
import Gamification from './pages/manager/Gamification';
import SalesPerformance from './pages/manager/SalesPerformance';
import { Header } from './components/Header';
import { NotificationHandler } from './components/NotificationHandler';
import { UserRole } from './types';

const AppLayout: React.FC = () => {
    return (
        <div className="min-h-screen bg-brand-background">
            <Header />
            <main>
                <Outlet />
            </main>
        </div>
    );
};

const ProtectedRoute: React.FC<{ allowedRoles: UserRole[] }> = ({ allowedRoles }) => {
    const { state } = useAppContext();
    const { currentUser, isInitialized } = state;

    if (!isInitialized) {
        return <div className="flex justify-center items-center h-screen">Carregando...</div>;
    }
    
    if (!currentUser) {
        return <Navigate to="/login" replace />;
    }

    return allowedRoles.includes(currentUser.role) ? <Outlet /> : <Navigate to="/login" replace />;
};

const AppRoutes: React.FC = () => {
    const { state } = useAppContext();
    const { currentUser } = state;
    
    const getHomeRedirect = () => {
        if (!currentUser) return "/login";
        switch (currentUser.role) {
            case UserRole.ADMIN:
            case UserRole.MANAGER:
                return "/manager";
            case UserRole.ASSISTANT:
                return "/assistant";
            default:
                return "/login";
        }
    };

    return (
        <Routes>
            <Route path="/login" element={<Login />} />
            
            <Route element={<AppLayout />}>
                 <Route path="/" element={<Navigate to={getHomeRedirect()} />} />

                <Route element={<ProtectedRoute allowedRoles={[UserRole.ASSISTANT]} />}>
                    <Route path="/assistant" element={<AssistantDashboard />} />
                </Route>

                <Route element={<ProtectedRoute allowedRoles={[UserRole.MANAGER, UserRole.ADMIN]} />}>
                    <Route path="/manager" element={<ManagerDashboard />} />
                    <Route path="/manager/requests" element={<RequestManagement />} />
                    <Route path="/manager/users" element={<UserManagement />} />
                    <Route path="/manager/settings" element={<Settings />} />
                    <Route path="/manager/stats" element={<Statistics />} />
                    <Route path="/manager/gamification" element={<Gamification />} />
                    <Route path="/manager/sales" element={<SalesPerformance />} />
                </Route>
            </Route>

            <Route path="*" element={<Navigate to="/" />} />
        </Routes>
    );
};


const App: React.FC = () => {
  return (
    <AppProvider>
        <HashRouter>
            <NotificationHandler />
            <AppRoutes />
        </HashRouter>
    </AppProvider>
  );
};

export default App;