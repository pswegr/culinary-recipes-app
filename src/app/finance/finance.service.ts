import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from 'src/environments/environment';
import {
  Expense,
  FinanceDashboard,
  FinanceType,
  FinanceTypeRequest,
  Income,
  MonthSummary,
  MonthlyPlan,
  MonthlyPlanRequest,
  TransactionRequest,
} from './finance.models';

@Injectable({ providedIn: 'root' })
export class FinanceService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}finance`;

  getDashboard(year: number, month: number) {
    const params = new HttpParams().set('year', year).set('month', month);
    return this.http.get<FinanceDashboard>(`${this.baseUrl}/dashboard`, { params });
  }

  getYearSummary(year: number) {
    return this.http.get<MonthSummary[]>(`${this.baseUrl}/calendar/${year}`);
  }

  createExpense(request: TransactionRequest) {
    return this.http.post<Expense>(`${this.baseUrl}/expenses`, request);
  }

  deleteExpense(id: string) {
    return this.http.delete<void>(`${this.baseUrl}/expenses/${id}`);
  }

  createIncome(request: TransactionRequest) {
    return this.http.post<Income>(`${this.baseUrl}/incomes`, request);
  }

  deleteIncome(id: string) {
    return this.http.delete<void>(`${this.baseUrl}/incomes/${id}`);
  }

  createExpenseType(request: FinanceTypeRequest) {
    return this.http.post<FinanceType>(`${this.baseUrl}/expense-types`, request);
  }

  createIncomeType(request: FinanceTypeRequest) {
    return this.http.post<FinanceType>(`${this.baseUrl}/income-types`, request);
  }

  savePlan(year: number, month: number, request: MonthlyPlanRequest) {
    return this.http.put<MonthlyPlan>(`${this.baseUrl}/plans/${year}/${month}`, request);
  }
}
