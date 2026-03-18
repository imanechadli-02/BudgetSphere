export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
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
  currentAmount: number;
  remainingAmount: number;
  deadline: string;
  monthlyContribution: number;
  progressPercentage: number;
  daysRemaining: number;
  monthsRemaining: number;
  isAchieved: boolean;
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
