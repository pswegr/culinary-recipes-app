export interface FinanceType {
  id: string;
  name: string;
  description: string;
}

export interface Expense {
  id: string;
  expenseTypeId: string;
  description: string;
  amount: number;
  date: string;
}

export interface Income {
  id: string;
  incomeTypeId: string;
  description: string;
  amount: number;
  date: string;
}

export interface MonthlyPlan {
  id: string;
  year: number;
  month: number;
  expenseLimit: number;
  savingsGoal: number;
}

export interface MonthSummary {
  year: number;
  month: number;
  totalIncome: number;
  totalExpenses: number;
  savings: number;
  expenseLimit: number;
  savingsGoal: number;
  remainingExpenseLimit: number;
  expenseLimitProgress: number;
  savingsGoalProgress: number;
}

export interface FinanceDashboard {
  summary: MonthSummary;
  expenses: Expense[];
  incomes: Income[];
  expenseTypes: FinanceType[];
  incomeTypes: FinanceType[];
  plan: MonthlyPlan | null;
}

export interface TransactionRequest {
  typeId: string;
  description: string;
  amount: number;
  date: string;
}

export interface FinanceTypeRequest {
  name: string;
  description: string;
}

export interface MonthlyPlanRequest {
  expenseLimit: number;
  savingsGoal: number;
}
