import { Request, User, RequestStatus, UserRole, AssistantType, GamificationScore, Sale, SalesRanking } from '../types';

export const calculateScores = (requests: Request[], users: User[], period: 'this-month' | 'last-month' | 'all-time' = 'this-month'): Omit<GamificationScore, 'rank'>[] => {
    const now = new Date();
    const firstDayThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastDayLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    const filteredRequests = requests.filter(req => {
        if (period === 'all-time') return true;
        
        // Ensure request has a date before proceeding
        if (!req.requestedAt) return false;

        const reqDate = new Date(req.requestedAt);
        if (period === 'this-month') {
            return reqDate >= firstDayThisMonth;
        }
        if (period === 'last-month') {
            return reqDate >= firstDayLastMonth && reqDate <= lastDayLastMonth;
        }
        return true;
    });

    const scores: { [key: string]: Omit<GamificationScore, 'rank'> } = {};

    const assistants = users.filter(u => u.role === UserRole.ASSISTANT);
    assistants.forEach(assistant => {
        scores[assistant.id] = {
            userId: assistant.id,
            userName: assistant.name,
            assistantType: assistant.assistantType,
            score: 0,
            stats: { completed: 0, rejected: 0, cancelled: 0, expired: 0 }
        };
    });

    filteredRequests.forEach(req => {
        if (!scores[req.userId]) return; // Skip if user is not a registered assistant or has been deleted

        switch (req.status) {
            case RequestStatus.COMPLETED:
                scores[req.userId].score += 10;
                scores[req.userId].stats.completed++;
                break;
            case RequestStatus.REJECTED:
                scores[req.userId].score -= 5;
                scores[req.userId].stats.rejected++;
                break;
            case RequestStatus.CANCELLED:
                scores[req.userId].score -= 5;
                scores[req.userId].stats.cancelled++;
                break;
            case RequestStatus.EXPIRED:
                scores[req.userId].score -= 10;
                scores[req.userId].stats.expired++;
                break;
            default:
                break;
        }
    });

    return Object.values(scores).sort((a, b) => b.score - a.score);
};

export const calculateSalesRanking = (sales: Sale[], users: User[], period: 'this-month' | 'last-month' | 'all-time' = 'this-month'): Omit<SalesRanking, 'rank'>[] => {
    const now = new Date();
    const firstDayThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastDayLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    const filteredSales = sales.filter(sale => {
        if (period === 'all-time') return true;
        
        if (!sale.reportedAt) return false;

        const saleDate = new Date(sale.reportedAt);
        if (period === 'this-month') {
            return saleDate >= firstDayThisMonth;
        }
        if (period === 'last-month') {
            return saleDate >= firstDayLastMonth && saleDate <= lastDayLastMonth;
        }
        return true;
    });

    const rankings: { [key: string]: Omit<SalesRanking, 'rank'> } = {};

    const assistants = users.filter(u => u.role === UserRole.ASSISTANT);
    assistants.forEach(assistant => {
        rankings[assistant.id] = {
            userId: assistant.id,
            userName: assistant.name,
            assistantType: assistant.assistantType,
            totalSales: 0,
        };
    });

    filteredSales.forEach(sale => {
        if (rankings[sale.userId]) {
            rankings[sale.userId].totalSales += sale.saleCount;
        }
    });

    return Object.values(rankings).sort((a, b) => b.totalSales - a.totalSales);
};