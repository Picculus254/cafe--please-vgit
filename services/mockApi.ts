
import { User, UserRole, Request, RequestStatus, AppSettings, CodeType, AssistantType, Sale } from '../types';

const USERS_KEY = 'cafe_please_users';
const REQUESTS_KEY = 'cafe_please_requests';
const SALES_KEY = 'cafe_please_sales';
const SETTINGS_KEY = 'cafe_please_settings';

const initialUsers: User[] = [
  { id: 'manager-1', name: 'GESTOR', role: UserRole.ADMIN, password: '0000' },
  // Inbound Users
  { id: 'assistant-carvalheil1', name: 'CARVALHEIL1', role: UserRole.ASSISTANT, password: '1234', assistantType: AssistantType.INBOUND },
  { id: 'assistant-gracianog', name: 'GRACIANOG', role: UserRole.ASSISTANT, password: '1234', assistantType: AssistantType.INBOUND },
  { id: 'assistant-santosa35', name: 'SANTOSA35', role: UserRole.ASSISTANT, password: '1234', assistantType: AssistantType.INBOUND },
  { id: 'assistant-fariab2', name: 'FARIAB2', role: UserRole.ASSISTANT, password: '1234', assistantType: AssistantType.INBOUND },
  { id: 'assistant-francar', name: 'FRANCAR', role: UserRole.ASSISTANT, password: '1234', assistantType: AssistantType.INBOUND },
  { id: 'assistant-martinrs', name: 'MARTINRS', role: UserRole.ASSISTANT, password: '1234', assistantType: AssistantType.INBOUND },
  { id: 'assistant-pintoe4', name: 'PINTOE4', role: UserRole.ASSISTANT, password: '1234', assistantType: AssistantType.INBOUND },
  { id: 'assistant-carvalfd', name: 'CARVALFD', role: UserRole.ASSISTANT, password: '1234', assistantType: AssistantType.INBOUND },
  { id: 'assistant-curvelsm', name: 'CURVELSM', role: UserRole.ASSISTANT, password: '1234', assistantType: AssistantType.INBOUND },
  { id: 'assistant-moraesa2', name: 'MORAESA2', role: UserRole.ASSISTANT, password: '1234', assistantType: AssistantType.INBOUND },
  { id: 'assistant-quintinoj1', name: 'QUINTINOJ1', role: UserRole.ASSISTANT, password: '1234', assistantType: AssistantType.INBOUND },
  { id: 'assistant-souzac1', name: 'SOUZAC1', role: UserRole.ASSISTANT, password: '1234', assistantType: AssistantType.INBOUND },
  { id: 'assistant-carassad', name: 'CARASSAD', role: UserRole.ASSISTANT, password: '1234', assistantType: AssistantType.INBOUND },
  { id: 'assistant-conceicaoa1', name: 'CONCEICAOA1', role: UserRole.ASSISTANT, password: '1234', assistantType: AssistantType.INBOUND },
  { id: 'assistant-cruzg3', name: 'CRUZG3', role: UserRole.ASSISTANT, password: '1234', assistantType: AssistantType.INBOUND },
  { id: 'assistant-cunhan', name: 'CUNHAN', role: UserRole.ASSISTANT, password: '1234', assistantType: AssistantType.INBOUND },
  { id: 'assistant-floresf', name: 'FLORESF', role: UserRole.ASSISTANT, password: '1234', assistantType: AssistantType.INBOUND },
  { id: 'assistant-leall1', name: 'LEALL1', role: UserRole.ASSISTANT, password: '1234', assistantType: AssistantType.INBOUND },
  { id: 'assistant-matam1', name: 'MATAM1', role: UserRole.ASSISTANT, password: '1234', assistantType: AssistantType.INBOUND },
  { id: 'assistant-bautost', name: 'BAUTOST', role: UserRole.ASSISTANT, password: '1234', assistantType: AssistantType.INBOUND },
  { id: 'assistant-diasc3', name: 'DIASC3', role: UserRole.ASSISTANT, password: '1234', assistantType: AssistantType.INBOUND },
  { id: 'assistant-manuelj1', name: 'MANUELJ1', role: UserRole.ASSISTANT, password: '1234', assistantType: AssistantType.INBOUND },
  { id: 'assistant-souzao', name: 'SOUZAO', role: UserRole.ASSISTANT, password: '1234', assistantType: AssistantType.INBOUND },
  { id: 'assistant-wahianaa', name: 'WAHIANAA', role: UserRole.ASSISTANT, password: '1234', assistantType: AssistantType.INBOUND },
  { id: 'assistant-cardosoz1', name: 'CARDOSOZ1', role: UserRole.ASSISTANT, password: '1234', assistantType: AssistantType.INBOUND },
  { id: 'assistant-duartea5', name: 'DuarteA5', role: UserRole.ASSISTANT, password: '1234', assistantType: AssistantType.INBOUND },
  { id: 'assistant-ferreiras5', name: 'FERREIRAS5', role: UserRole.ASSISTANT, password: '1234', assistantType: AssistantType.INBOUND },
  { id: 'assistant-marquesa1', name: 'MARQUESA1', role: UserRole.ASSISTANT, password: '1234', assistantType: AssistantType.INBOUND },
  { id: 'assistant-moinhosf', name: 'MOINHOSF', role: UserRole.ASSISTANT, password: '1234', assistantType: AssistantType.INBOUND },
  { id: 'assistant-sangom', name: 'SANGOM', role: UserRole.ASSISTANT, password: '1234', assistantType: AssistantType.INBOUND },
  { id: 'assistant-simoesb', name: 'SIMOESB', role: UserRole.ASSISTANT, password: '1234', assistantType: AssistantType.INBOUND },
  { id: 'assistant-caetanom', name: 'CAETANOM', role: UserRole.ASSISTANT, password: '1234', assistantType: AssistantType.INBOUND },
  { id: 'assistant-constantis', name: 'CONSTANTIS', role: UserRole.ASSISTANT, password: '1234', assistantType: AssistantType.INBOUND },
  { id: 'assistant-oliveiraa12', name: 'OLIVEIRAA12', role: UserRole.ASSISTANT, password: '1234', assistantType: AssistantType.INBOUND },
  { id: 'assistant-rodriguesm6', name: 'RODRIGUESM6', role: UserRole.ASSISTANT, password: '1234', assistantType: AssistantType.INBOUND },
  { id: 'assistant-souzad1', name: 'SOUZAD1', role: UserRole.ASSISTANT, password: '1234', assistantType: AssistantType.INBOUND },
  // Outbound Users
  { id: 'assistant-benignor', name: 'BENIGNOR', role: UserRole.ASSISTANT, password: '1234', assistantType: AssistantType.OUTBOUND },
  { id: 'assistant-bileua', name: 'BILEUA', role: UserRole.ASSISTANT, password: '1234', assistantType: AssistantType.OUTBOUND },
  { id: 'assistant-reisp1', name: 'REISP1', role: UserRole.ASSISTANT, password: '1234', assistantType: AssistantType.OUTBOUND },
  { id: 'assistant-rochal', name: 'ROCHAL', role: UserRole.ASSISTANT, password: '1234', assistantType: AssistantType.OUTBOUND },
  { id: 'assistant-vidinhac', name: 'VIDINHAC', role: UserRole.ASSISTANT, password: '1234', assistantType: AssistantType.OUTBOUND },
  { id: 'assistant-boasl', name: 'BOASL', role: UserRole.ASSISTANT, password: '1234', assistantType: AssistantType.OUTBOUND },
  { id: 'assistant-custodioa1', name: 'CUSTODIOA1', role: UserRole.ASSISTANT, password: '1234', assistantType: AssistantType.OUTBOUND },
  { id: 'assistant-diasm21', name: 'DIASM21', role: UserRole.ASSISTANT, password: '1234', assistantType: AssistantType.OUTBOUND },
  { id: 'assistant-findal', name: 'FINDAL', role: UserRole.ASSISTANT, password: '1234', assistantType: AssistantType.OUTBOUND },
  { id: 'assistant-geadasa', name: 'GEADASA', role: UserRole.ASSISTANT, password: '1234', assistantType: AssistantType.OUTBOUND },
  { id: 'assistant-martinss', name: 'MARTINSS', role: UserRole.ASSISTANT, password: '1234', assistantType: AssistantType.OUTBOUND },
  { id: 'assistant-silveriom', name: 'SILVERIOM', role: UserRole.ASSISTANT, password: '1234', assistantType: AssistantType.OUTBOUND },
  { id: 'assistant-simoess1', name: 'SIMOESS1', role: UserRole.ASSISTANT, password: '1234', assistantType: AssistantType.OUTBOUND },
  { id: 'assistant-soaresm', name: 'SOARESM', role: UserRole.ASSISTANT, password: '1234', assistantType: AssistantType.OUTBOUND },
  { id: 'assistant-zacariasa1', name: 'ZACARIASA1', role: UserRole.ASSISTANT, password: '1234', assistantType: AssistantType.OUTBOUND },
  { id: 'assistant-barrosk', name: 'BARROSK', role: UserRole.ASSISTANT, password: '1234', assistantType: AssistantType.OUTBOUND },
  { id: 'assistant-diasb2', name: 'DIASB2', role: UserRole.ASSISTANT, password: '1234', assistantType: AssistantType.OUTBOUND },
  { id: 'assistant-moraesd', name: 'MoraesD', role: UserRole.ASSISTANT, password: '1234', assistantType: AssistantType.OUTBOUND },
  { id: 'assistant-rosad', name: 'RosaD', role: UserRole.ASSISTANT, password: '1234', assistantType: AssistantType.OUTBOUND },
  { id: 'assistant-palmilhar', name: 'PALMILHAR', role: UserRole.ASSISTANT, password: '1234', assistantType: AssistantType.OUTBOUND },
  { id: 'assistant-abilioa', name: 'ABILIOA', role: UserRole.ASSISTANT, password: '1234', assistantType: AssistantType.OUTBOUND },
  { id: 'assistant-silvav4', name: 'SILVAV4', role: UserRole.ASSISTANT, password: '1234', assistantType: AssistantType.OUTBOUND },
  { id: 'assistant-almeidaa12', name: 'ALMEIDAA12', role: UserRole.ASSISTANT, password: '1234', assistantType: AssistantType.OUTBOUND },
  { id: 'assistant-costaf1', name: 'COSTAF1', role: UserRole.ASSISTANT, password: '1234', assistantType: AssistantType.OUTBOUND },
  { id: 'assistant-cruzz', name: 'CRUZZ', role: UserRole.ASSISTANT, password: '1234', assistantType: AssistantType.OUTBOUND },
  { id: 'assistant-garridom1', name: 'GARRIDOM1', role: UserRole.ASSISTANT, password: '1234', assistantType: AssistantType.OUTBOUND },
  { id: 'assistant-gomesl', name: 'GOMESL', role: UserRole.ASSISTANT, password: '1234', assistantType: AssistantType.OUTBOUND },
  { id: 'assistant-goncalvest4', name: 'GONCALVEST4', role: UserRole.ASSISTANT, password: '1234', assistantType: AssistantType.OUTBOUND },
  { id: 'assistant-guimaraesm1', name: 'GUIMARAESM1', role: UserRole.ASSISTANT, password: '1234', assistantType: AssistantType.OUTBOUND },
  { id: 'assistant-marquesc5', name: 'MARQUESC5', role: UserRole.ASSISTANT, password: '1234', assistantType: AssistantType.OUTBOUND },
  { id: 'assistant-oliveirao', name: 'OLIVEIRAO', role: UserRole.ASSISTANT, password: '1234', assistantType: AssistantType.OUTBOUND },
  { id: 'assistant-passosm1', name: 'PASSOSM1', role: UserRole.ASSISTANT, password: '1234', assistantType: AssistantType.OUTBOUND },
  { id: 'assistant-ramose', name: 'RAMOSE', role: UserRole.ASSISTANT, password: '1234', assistantType: AssistantType.OUTBOUND },
  { id: 'assistant-silvan5', name: 'SILVAN5', role: UserRole.ASSISTANT, password: '1234', assistantType: AssistantType.OUTBOUND },
  { id: 'assistant-vallya', name: 'VALLYA', role: UserRole.ASSISTANT, password: '1234', assistantType: AssistantType.OUTBOUND },
  { id: 'assistant-almeidaa10', name: 'ALMEIDAA10', role: UserRole.ASSISTANT, password: '1234', assistantType: AssistantType.OUTBOUND },
  { id: 'assistant-almeidab1', name: 'ALMEIDAB1', role: UserRole.ASSISTANT, password: '1234', assistantType: AssistantType.OUTBOUND },
  { id: 'assistant-custodioc2', name: 'CUSTODIOC2', role: UserRole.ASSISTANT, password: '1234', assistantType: AssistantType.OUTBOUND },
  { id: 'assistant-fazendai', name: 'FAZENDAI', role: UserRole.ASSISTANT, password: '1234', assistantType: AssistantType.OUTBOUND },
  { id: 'assistant-fernandesd11', name: 'FERNANDESD11', role: UserRole.ASSISTANT, password: '1234', assistantType: AssistantType.OUTBOUND },
  { id: 'assistant-ferreirag', name: 'FERREIRAG', role: UserRole.ASSISTANT, password: '1234', assistantType: AssistantType.OUTBOUND },
  { id: 'assistant-fonsecal1', name: 'FONSECAL1', role: UserRole.ASSISTANT, password: '1234', assistantType: AssistantType.OUTBOUND },
  { id: 'assistant-leiriaov1', name: 'LEIRIAOV1', role: UserRole.ASSISTANT, password: '1234', assistantType: AssistantType.OUTBOUND },
  { id: 'assistant-pereisc4', name: 'PEREISC4', role: UserRole.ASSISTANT, password: '1234', assistantType: AssistantType.OUTBOUND },
  { id: 'assistant-ramosj3', name: 'RAMOSJ3', role: UserRole.ASSISTANT, password: '1234', assistantType: AssistantType.OUTBOUND },
  { id: 'assistant-teixeirag1', name: 'TEIXEIRAG1', role: UserRole.ASSISTANT, password: '1234', assistantType: AssistantType.OUTBOUND },
  { id: 'assistant-varelak', name: 'VARELAK', role: UserRole.ASSISTANT, password: '1234', assistantType: AssistantType.OUTBOUND },
  // Users for E2E testing
  { id: 'e2e-ana-silva', name: 'Ana Silva', role: UserRole.ASSISTANT, password: '1234', assistantType: AssistantType.INBOUND },
  { id: 'e2e-bruno-costa', name: 'Bruno Costa', role: UserRole.ASSISTANT, password: '1234', assistantType: AssistantType.OUTBOUND },
];

const initialSettings: AppSettings = {
  autoApprove: {
    [AssistantType.INBOUND]: true,
    [AssistantType.OUTBOUND]: true,
    [AssistantType.AMIGO]: true,
  },
  limits: {
    [AssistantType.INBOUND]: { maxOnBreak: 1, maxOnOther: 2 },
    [AssistantType.OUTBOUND]: { maxOnBreak: 1, maxOnOther: 1 },
    [AssistantType.AMIGO]: { maxOnBreak: 2, maxOnOther: 2 },
  },
  validationTimeout: 30, // seconds
};

// Initialize with default data if localStorage is empty
const initializeData = () => {
  if (!localStorage.getItem(USERS_KEY)) {
    localStorage.setItem(USERS_KEY, JSON.stringify(initialUsers));
  }
  if (!localStorage.getItem(SETTINGS_KEY)) {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(initialSettings));
  }
  if (!localStorage.getItem(REQUESTS_KEY)) {
    localStorage.setItem(REQUESTS_KEY, JSON.stringify([]));
  }
  if (!localStorage.getItem(SALES_KEY)) {
    localStorage.setItem(SALES_KEY, JSON.stringify([]));
  }
};

initializeData();

// --- Data Access Functions ---
const getFromStorage = <T,>(key: string): T => {
    const data = localStorage.getItem(key);
    // A simple migration for settings if old structure is found
    if (key === SETTINGS_KEY && data) {
        const parsed = JSON.parse(data);
        if (typeof parsed.autoApprove === 'boolean' || parsed.maxOnBreak !== undefined || !parsed.limits) {
            console.log("Old settings format detected, migrating...");
            localStorage.setItem(SETTINGS_KEY, JSON.stringify(initialSettings));
            return initialSettings as T;
        }
    }
    return data ? JSON.parse(data) : [];
}

const saveToStorage = <T,>(key: string, data: T) => {
    localStorage.setItem(key, JSON.stringify(data));
}

// --- API ---
export const api = {
  // Users
  getUsers: (): User[] => getFromStorage<User[]>(USERS_KEY),
  saveUsers: (users: User[]) => saveToStorage(USERS_KEY, users),
  login: (name: string, password_raw: string, role: UserRole): User | null => {
    const users = api.getUsers();
    // Allow ADMIN to log in via the MANAGER role selection
    const allowedRoles = role === UserRole.MANAGER ? [UserRole.MANAGER, UserRole.ADMIN] : [role];
    const user = users.find(u => 
        u.name.toLowerCase() === name.toLowerCase() && 
        allowedRoles.includes(u.role)
    );
    if (user && user.password === password_raw) {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    }
    return null;
  },
  changePassword: (userId: string, oldPassword_raw: string, newPassword_raw: string): boolean => {
    const users = api.getUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
      return false; // User not found
    }
    
    const user = users[userIndex];
    if (user.password !== oldPassword_raw) {
      return false; // Old password doesn't match
    }
    
    // Update password
    users[userIndex] = { ...user, password: newPassword_raw };
    api.saveUsers(users);
    
    return true;
  },

  // Requests
  getRequests: (): Request[] => getFromStorage<Request[]>(REQUESTS_KEY),
  saveRequests: (requests: Request[]) => saveToStorage(REQUESTS_KEY, requests),

  // Sales
  getSales: (): Sale[] => getFromStorage<Sale[]>(SALES_KEY),
  saveSales: (sales: Sale[]) => saveToStorage(SALES_KEY, sales),

  // Settings
  getSettings: (): AppSettings => getFromStorage<AppSettings>(SETTINGS_KEY),
  saveSettings: (settings: AppSettings) => saveToStorage(SETTINGS_KEY, settings),
};