export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export enum AssetType {
  BANK_ACCOUNT = 'BANK_ACCOUNT',
  REAL_ESTATE = 'REAL_ESTATE',
  CRYPTO = 'CRYPTO',
  STOCK = 'STOCK',
  INVESTMENT = 'INVESTMENT',
}

export interface Asset {
  id: string;
  portfolioId: string;
  type: AssetType;
  name: string;
  value: number;
  currency: string;
  notes?: string;
  details?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  valueHistory?: AssetValueHistory[];
}

export interface AssetValueHistory {
  id: string;
  assetId: string;
  value: number;
  recordedAt: string;
}

export enum Permission {
  VIEW = 'VIEW',
  EDIT = 'EDIT',
}

export enum ShareStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  DECLINED = 'DECLINED',
}

export interface PortfolioShare {
  id: string;
  portfolioId: string;
  sharedWithUserId: string;
  sharedWithUser: User;
  permission: Permission;
  status: ShareStatus;
  createdAt: string;
}

export interface Portfolio {
  id: string;
  name: string;
  description?: string;
  userId: string;
  user: User;
  assets: Asset[];
  shares: PortfolioShare[];
  isOwner: boolean;
  permission?: Permission;
  totalValue: number;
  createdAt: string;
  updatedAt: string;
}

export interface Invitation {
  id: string;
  portfolioId: string;
  portfolio: {
    id: string;
    name: string;
    user: User;
  };
  permission: Permission;
  status: ShareStatus;
  createdAt: string;
}

export const ASSET_TYPE_LABELS: Record<AssetType, string> = {
  [AssetType.BANK_ACCOUNT]: 'Bank Account',
  [AssetType.REAL_ESTATE]: 'Real Estate',
  [AssetType.CRYPTO]: 'Cryptocurrency',
  [AssetType.STOCK]: 'Stock',
  [AssetType.INVESTMENT]: 'Investment',
};

export const ASSET_TYPE_ICONS: Record<AssetType, string> = {
  [AssetType.BANK_ACCOUNT]: 'Landmark',
  [AssetType.REAL_ESTATE]: 'Home',
  [AssetType.CRYPTO]: 'Bitcoin',
  [AssetType.STOCK]: 'TrendingUp',
  [AssetType.INVESTMENT]: 'PiggyBank',
};
