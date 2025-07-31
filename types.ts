export enum UserRole {
  ASSISTANT = 'ASSISTANT',
  MANAGER = 'MANAGER',
  ADMIN = 'ADMIN',
}

export enum AssistantType {
  INBOUND = 'INBOUND',
  OUTBOUND = 'OUTBOUND',
  AMIGO = 'AMIGO',
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  assistantType?: AssistantType;
  password?: string;
}

export enum CodeType {
  BREAK = 'BREAK',
  FOLLOW_UP = 'FOLLOW UP',
  CAMPAIGN = 'CAMPANHA',
  LUNCH = 'LUNCH',
  OTHER = 'OUTROS',
}

export enum RequestStatus {
  PENDING = 'PENDENTE',
  APPROVED = 'APROVADO',
  REJECTED = 'RECUSADO',
  ACTIVE = 'ATIVO',
  COMPLETED = 'CONCLUÍDO',
  CANCELLED = 'CANCELADO',
  EXPIRED = 'EXPIRADO',
}

export interface Request {
  id: string;
  userId: string;
  userName: string;
  codeType: CodeType;
  duration: number; // in minutes
  status: RequestStatus;
  requestedAt: string; // ISO string
  handledAt?: string; // ISO string
  startedAt?: string; // ISO string
  endsAt?: string; // ISO string
  validationExpiresAt?: string; // ISO string for pending approval validation
}

export interface AppSettings {
  autoApprove: {
    [key in AssistantType]: boolean;
  };
  limits: {
    [key in AssistantType]: {
      maxOnBreak: number;
      maxOnOther: number;
    }
  };
  validationTimeout: number; // in seconds
}

export interface AppNotification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

export interface GamificationScore {
  userId: string;
  userName: string;
  assistantType?: AssistantType;
  score: number;
  rank: number;
  stats: {
    completed: number;
    rejected: number;
    cancelled: number;
    expired: number;
  };
}

export interface Sale {
  id: string;
  userId: string;
  saleCount: number;
  reportedAt: string; // ISO string
}

export interface SalesRanking {
  userId: string;
  userName: string;
  assistantType?: AssistantType;
  totalSales: number;
  rank: number;
}