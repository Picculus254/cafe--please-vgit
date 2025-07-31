import React, { createContext, useReducer, useContext, useEffect } from 'react';
import { User, Request, AppSettings, AppNotification, RequestStatus, CodeType, UserRole, AssistantType, Sale } from '../types';
import { api } from '../services/mockApi';

interface AppState {
  currentUser: User | null;
  users: User[];
  requests: Request[];
  sales: Sale[];
  settings: AppSettings;
  notifications: AppNotification[];
  isInitialized: boolean;
}

type Action =
  | { type: 'INITIALIZE'; payload: { users: User[], requests: Request[], sales: Sale[], settings: AppSettings } }
  | { type: 'LOGIN'; payload: User }
  | { type: 'LOGOUT' }
  | { type: 'ADD_REQUEST'; payload: Request }
  | { type: 'UPDATE_REQUEST'; payload: Request }
  | { type: 'UPDATE_REQUESTS'; payload: Request[] }
  | { type: 'ADD_SALE'; payload: Sale }
  | { type: 'UPDATE_SETTINGS'; payload: AppSettings }
  | { type: 'ADD_USER'; payload: User }
  | { type: 'UPDATE_USER'; payload: User }
  | { type: 'DELETE_USER'; payload: string }
  | { type: 'ADD_NOTIFICATION'; payload: AppNotification }
  | { type: 'REMOVE_NOTIFICATION'; payload: string };

const initialState: AppState = {
  currentUser: null,
  users: [],
  requests: [],
  sales: [],
  settings: { 
    autoApprove: {
        [AssistantType.INBOUND]: false,
        [AssistantType.OUTBOUND]: false,
        [AssistantType.AMIGO]: false,
    },
    limits: {
        [AssistantType.INBOUND]: { maxOnBreak: 0, maxOnOther: 0},
        [AssistantType.OUTBOUND]: { maxOnBreak: 0, maxOnOther: 0},
        [AssistantType.AMIGO]: { maxOnBreak: 0, maxOnOther: 0},
    },
    validationTimeout: 30 
  },
  notifications: [],
  isInitialized: false,
};

const appReducer = (state: AppState, action: Action): AppState => {
  switch (action.type) {
    case 'INITIALIZE':
      return { ...state, ...action.payload, isInitialized: true };
    case 'LOGIN':
      return { ...state, currentUser: action.payload };
    case 'LOGOUT':
      return { ...state, currentUser: null };
    case 'ADD_REQUEST': {
        const newRequests = [...state.requests, action.payload];
        api.saveRequests(newRequests);
        return { ...state, requests: newRequests };
    }
    case 'UPDATE_REQUEST': {
        const updatedRequests = state.requests.map(r => r.id === action.payload.id ? action.payload : r);
        api.saveRequests(updatedRequests);
        return { ...state, requests: updatedRequests };
    }
    case 'UPDATE_REQUESTS': {
        api.saveRequests(action.payload);
        return { ...state, requests: action.payload };
    }
    case 'ADD_SALE': {
        const newSales = [...state.sales, action.payload];
        api.saveSales(newSales);
        return { ...state, sales: newSales };
    }
    case 'UPDATE_SETTINGS':
      api.saveSettings(action.payload);
      return { ...state, settings: action.payload };
    case 'ADD_USER': {
        const newUsers = [...state.users, action.payload];
        api.saveUsers(newUsers);
        return { ...state, users: newUsers };
    }
    case 'UPDATE_USER': {
        const updatedUsers = state.users.map(u => u.id === action.payload.id ? action.payload : u);
        api.saveUsers(updatedUsers);
        return { ...state, users: updatedUsers };
    }
    case 'DELETE_USER': {
        const filteredUsers = state.users.filter(u => u.id !== action.payload);
        api.saveUsers(filteredUsers);
        return { ...state, users: filteredUsers };
    }
    case 'ADD_NOTIFICATION':
      return { ...state, notifications: [...state.notifications, action.payload] };
    case 'REMOVE_NOTIFICATION':
      return { ...state, notifications: state.notifications.filter(n => n.id !== action.payload) };
    default:
      return state;
  }
};

const AppContext = createContext<{ state: AppState; dispatch: React.Dispatch<Action> }>({
  state: initialState,
  dispatch: () => null,
});

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  useEffect(() => {
    const users = api.getUsers();
    const requests = api.getRequests();
    const sales = api.getSales();
    const settings = api.getSettings();
    dispatch({ type: 'INITIALIZE', payload: { users, requests, sales, settings } });
  }, []);
  
  // Bot logic
  useEffect(() => {
    const isAnyBotActive = state.settings.autoApprove && Object.values(state.settings.autoApprove).some(v => v);
    if (!state.isInitialized || state.currentUser?.role !== UserRole.MANAGER || !isAnyBotActive) {
        return;
    }
    
    const botInterval = setInterval(() => {
        let requestsToUpdate = [...state.requests];
        let changed = false;

        // 1. Check for expired validations
        requestsToUpdate.forEach(req => {
            if (req.status === RequestStatus.APPROVED && req.validationExpiresAt && new Date(req.validationExpiresAt) < new Date()) {
                req.status = RequestStatus.EXPIRED;
                req.handledAt = new Date().toISOString();
                changed = true;
            }
        });
        
        // 2. Process pending queue with type-specific limits
        const userMap = new Map<string, User>(state.users.map(u => [u.id, u]));
        const activeRequests = requestsToUpdate.filter(r => r.status === RequestStatus.ACTIVE);
        
        const activeCounts: { [key in AssistantType]: { onBreak: number, onOther: number } } = {
            [AssistantType.INBOUND]: { onBreak: 0, onOther: 0 },
            [AssistantType.OUTBOUND]: { onBreak: 0, onOther: 0 },
            [AssistantType.AMIGO]: { onBreak: 0, onOther: 0 },
        };

        activeRequests.forEach(req => {
            const user = userMap.get(req.userId);
            if (user && user.assistantType && activeCounts[user.assistantType]) {
                if (req.codeType === CodeType.BREAK) {
                    activeCounts[user.assistantType].onBreak++;
                } else {
                    activeCounts[user.assistantType].onOther++;
                }
            }
        });
        
        const pendingRequests = requestsToUpdate
            .filter(r => r.status === RequestStatus.PENDING)
            .sort((a, b) => new Date(a.requestedAt).getTime() - new Date(b.requestedAt).getTime());

        for (const req of pendingRequests) {
            const user = userMap.get(req.userId);
            if (!user || !user.assistantType) continue;

            const assistantType = user.assistantType;
            
            // Check if the bot for this specific assistant type is active
            if (!state.settings.autoApprove?.[assistantType]) {
                continue;
            }
            
            const limits = state.settings.limits?.[assistantType];
            const counts = activeCounts[assistantType];
            
            if (!limits || !counts) continue;

            const isBreak = req.codeType === CodeType.BREAK;

            if (isBreak && counts.onBreak < limits.maxOnBreak) {
                req.status = RequestStatus.APPROVED;
                req.validationExpiresAt = new Date(Date.now() + state.settings.validationTimeout * 1000).toISOString();
                changed = true;
                break; 
            } else if (!isBreak && counts.onOther < limits.maxOnOther) {
                req.status = RequestStatus.APPROVED;
                req.validationExpiresAt = new Date(Date.now() + state.settings.validationTimeout * 1000).toISOString();
                changed = true;
                break;
            }
        }
        
        // 3. Auto-complete finished timers
        requestsToUpdate.forEach(req => {
            if (req.status === RequestStatus.ACTIVE && req.endsAt && new Date(req.endsAt) < new Date()) {
                req.status = RequestStatus.COMPLETED;
                changed = true;
            }
        });

        if (changed) {
            dispatch({ type: 'UPDATE_REQUESTS', payload: requestsToUpdate });
        }
    }, 5000); // Check every 5 seconds

    return () => clearInterval(botInterval);
  }, [state.isInitialized, state.settings.autoApprove, state.requests, state.settings, state.currentUser, state.users]);


  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>;
};

export const useAppContext = () => useContext(AppContext);