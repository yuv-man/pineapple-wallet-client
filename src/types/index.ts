export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  displayCurrency?: string;
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
  addedByUserId?: string;
  addedBy?: { id: string; name: string; avatar?: string };
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

// ==================== PROPERTY TYPES ====================

export enum TransactionType {
  EXPENSE = 'EXPENSE',
  PROFIT = 'PROFIT',
}

export enum PropertyType {
  APARTMENT = 'APARTMENT',
  HOUSE = 'HOUSE',
  LAND = 'LAND',
  COMMERCIAL = 'COMMERCIAL',
  OTHER = 'OTHER',
}

export enum SizeUnit {
  SQM = 'SQM',
  SQFT = 'SQFT',
}

export const PROPERTY_TYPE_LABELS: Record<PropertyType, string> = {
  [PropertyType.APARTMENT]: 'Apartment',
  [PropertyType.HOUSE]: 'House',
  [PropertyType.LAND]: 'Land',
  [PropertyType.COMMERCIAL]: 'Commercial',
  [PropertyType.OTHER]: 'Other',
};

export const SIZE_UNIT_LABELS: Record<SizeUnit, string> = {
  [SizeUnit.SQM]: 'sqm',
  [SizeUnit.SQFT]: 'sqft',
};

export enum CategoryType {
  EXPENSE = 'EXPENSE',
  PROFIT = 'PROFIT',
}

export interface PropertyCategory {
  id: string;
  name: string;
  type: CategoryType;
  isSystem: boolean;
  userId?: string;
  createdAt: string;
}

export interface PropertyTransaction {
  id: string;
  propertyId: string;
  categoryId: string;
  category: PropertyCategory;
  type: TransactionType;
  amount: number;
  currency: string;
  date: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PropertyShare {
  id: string;
  propertyId: string;
  sharedWithUserId: string;
  sharedWithUser: User;
  permission: Permission;
  status: ShareStatus;
  createdAt: string;
}

export interface Property {
  id: string;
  name: string;
  address?: string;
  description?: string;
  userId: string;
  user: User;
  transactions: PropertyTransaction[];
  shares: PropertyShare[];
  isOwner: boolean;
  permission?: Permission;
  totalProfit: number;
  totalExpenses: number;
  netBalance: number;
  createdAt: string;
  updatedAt: string;
  // Valuation fields
  propertyType?: PropertyType;
  size?: number;
  sizeUnit?: SizeUnit;
  country?: string;
  city?: string;
  estimatedValue?: number;
  estimatedValueCurrency?: string;
  estimatedValueDate?: string;
  valuationSource?: 'gemini' | 'zillow' | 'fallback';
}

export interface ValuationResult {
  estimatedValue: number;
  currency: string;
  source: 'gemini' | 'zillow' | 'fallback';
  lastUpdated: string;
  confidence: 'high' | 'medium' | 'low';
}

export interface Country {
  code: string;
  name: string;
}

export interface PropertyInvitation {
  id: string;
  propertyId: string;
  property: {
    id: string;
    name: string;
    address?: string;
    user: User;
  };
  permission: Permission;
  status: ShareStatus;
  createdAt: string;
}

export const EXPENSE_CATEGORY_ICONS: Record<string, string> = {
  Design: 'Palette',
  Build: 'Hammer',
  Lawyer: 'Scale',
  Maintenance: 'Wrench',
  Taxes: 'Receipt',
  Insurance: 'Shield',
  'Management Fees': 'Users',
};

export const PROFIT_CATEGORY_ICONS: Record<string, string> = {
  Rent: 'Home',
  Sale: 'DollarSign',
  'Other Income': 'Plus',
};

// ==================== LIABILITY TYPES ====================

export enum LiabilityType {
  CREDIT_CARD = 'CREDIT_CARD',
  MORTGAGE = 'MORTGAGE',
  STUDENT_LOAN = 'STUDENT_LOAN',
  PERSONAL_LOAN = 'PERSONAL_LOAN',
  AUTO_LOAN = 'AUTO_LOAN',
  HOME_EQUITY_LOAN = 'HOME_EQUITY_LOAN',
  MEDICAL_DEBT = 'MEDICAL_DEBT',
  OTHER = 'OTHER',
}

export const LIABILITY_TYPE_LABELS: Record<LiabilityType, string> = {
  [LiabilityType.CREDIT_CARD]: 'Credit Card',
  [LiabilityType.MORTGAGE]: 'Mortgage',
  [LiabilityType.STUDENT_LOAN]: 'Student Loan',
  [LiabilityType.PERSONAL_LOAN]: 'Personal Loan',
  [LiabilityType.AUTO_LOAN]: 'Auto Loan',
  [LiabilityType.HOME_EQUITY_LOAN]: 'Home Equity Loan',
  [LiabilityType.MEDICAL_DEBT]: 'Medical Debt',
  [LiabilityType.OTHER]: 'Other',
};

export interface Liability {
  id: string;
  userId: string;
  type: LiabilityType;
  name: string;
  balance: number;
  currency: string;
  interestRate?: number;
  minimumPayment?: number;
  dueDate?: string;
  notes?: string;
  details?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  balanceHistory?: Array<{ id: string; balance: number; recordedAt: string }>;
}

export interface NetWorthDataPoint {
  date: string;
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
}

export interface NetWorthHistory {
  currency: string;
  data: NetWorthDataPoint[];
}
