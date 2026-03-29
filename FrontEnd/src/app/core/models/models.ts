export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  enabled: boolean;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Transaction {
  id: number;
  amount: number;
  type: 'INCOME' | 'EXPENSE';
  date: string;
  description: string;
  recurring: boolean;
  category: string;
  userId: number;
}

export interface SavingGoal {
  id: number;
  title: string;
  targetAmount: number;
  contributedAmount: number;
  remainingAmount: number;
  deadline: string;
  monthlyContribution: number;
  progressPercentage: number;
  daysRemaining: number;
  monthsRemaining: number;
  isAchieved: boolean;
  userId: number;
}

export interface VariableExpense {
  id: number;
  title: string;
  amount: number;
  description: string;
  expenseDate: string;
  category: string;
  userId: number;
}

export interface FixedExpense {
  id: number;
  title: string;
  amount: number;
  description: string;
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
  startDate: string;
  endDate: string;
  category: string;
  userId: number;
}

export interface Need {
  id: number;
  title: string;
  estimatedPrice: number;
  status: 'PENDING' | 'IN_PROGRESS' | 'FULFILLED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  userId: number;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

export const CATEGORY_LABELS: Record<string, string> = {
  SALARY: 'Salaire', FOOD: 'Alimentation', TRANSPORT: 'Transport',
  HEALTH: 'Santé', ENTERTAINMENT: 'Loisirs', EDUCATION: 'Éducation',
  SHOPPING: 'Shopping', HOUSING: 'Logement', SAVINGS: 'Épargne', OTHER: 'Autre'
};

export const CATEGORY_ICONS: Record<string, string> = {
  SALARY: '💰', FOOD: '🛒', TRANSPORT: '🚗', HEALTH: '💊',
  ENTERTAINMENT: '🎬', EDUCATION: '📚', SHOPPING: '🛍️', HOUSING: '🏠',
  SAVINGS: '🏦', OTHER: '📦'
};
