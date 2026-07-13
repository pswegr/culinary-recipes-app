import { LiveAnnouncer } from '@angular/cdk/a11y';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { I18nService } from 'src/app/shared/services/i18n.service';
import { Expense, FinanceDashboard, Income, MonthSummary } from '../finance.models';
import { FinanceService } from '../finance.service';

interface CalendarDay {
  day: number;
  date: Date;
  expenses: Expense[];
  incomes: Income[];
  totalExpenses: number;
  totalIncome: number;
}

interface TypeBreakdown {
  id: string;
  name: string;
  total: number;
  share: number;
  barWidth: number;
}

@Component({
  selector: 'app-finance-dashboard',
  templateUrl: './finance-dashboard.component.html',
  styleUrls: ['./finance-dashboard.component.scss'],
  standalone: false,
})
export class FinanceDashboardComponent implements OnInit {
  private readonly finance = inject(FinanceService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly liveAnnouncer = inject(LiveAnnouncer);
  readonly i18n = inject(I18nService);

  readonly today = new Date();
  selectedYear = this.today.getFullYear();
  selectedMonth = this.today.getMonth() + 1;
  dashboard: FinanceDashboard | null = null;
  yearSummary: MonthSummary[] = [];
  isLoading = true;
  chartView: 'bar' | 'radial' = 'bar';

  private readonly expenseChartColors = ['#c85d4b', '#e07b65', '#f0a071', '#b74f72', '#875b9d', '#d3a93f', '#9c5947', '#e6bf83'];
  private readonly incomeChartColors = ['#278b68', '#48b58b', '#63c9a3', '#2e8f9b', '#4d72b8', '#79a84b', '#3d9f82', '#8ecf9d'];

  readonly expenseForm = this.formBuilder.nonNullable.group({
    typeId: ['', Validators.required],
    description: ['', Validators.maxLength(500)],
    amount: [0, [Validators.required, Validators.min(0.01)]],
    date: [this.today, Validators.required],
  });

  readonly incomeForm = this.formBuilder.nonNullable.group({
    typeId: ['', Validators.required],
    description: ['', Validators.maxLength(500)],
    amount: [0, [Validators.required, Validators.min(0.01)]],
    date: [this.today, Validators.required],
  });

  readonly planForm = this.formBuilder.nonNullable.group({
    expenseLimit: [0, [Validators.required, Validators.min(0)]],
    savingsGoal: [0, [Validators.required, Validators.min(0)]],
  });

  readonly expenseTypeForm = this.formBuilder.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(80)]],
    description: ['', Validators.maxLength(300)],
  });

  readonly incomeTypeForm = this.formBuilder.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(80)]],
    description: ['', Validators.maxLength(300)],
  });

  readonly weekDays = ['finance.calendar.mon', 'finance.calendar.tue', 'finance.calendar.wed', 'finance.calendar.thu', 'finance.calendar.fri', 'finance.calendar.sat', 'finance.calendar.sun'];

  ngOnInit(): void {
    this.loadData();
  }

  get selectedMonthName(): string {
    return this.monthName(this.selectedMonth);
  }

  get expenseBreakdown(): TypeBreakdown[] {
    const dashboard = this.dashboard;
    if (!dashboard) return [];

    return this.buildTypeBreakdown(
      dashboard.expenses,
      dashboard.expenseTypes,
      item => item.expenseTypeId,
    );
  }

  get incomeBreakdown(): TypeBreakdown[] {
    const dashboard = this.dashboard;
    if (!dashboard) return [];

    return this.buildTypeBreakdown(
      dashboard.incomes,
      dashboard.incomeTypes,
      item => item.incomeTypeId,
    );
  }

  get calendarWeeks(): (CalendarDay | null)[][] {
    const dashboard = this.dashboard;
    if (!dashboard) return [];

    const firstDay = new Date(this.selectedYear, this.selectedMonth - 1, 1);
    const emptyDays = (firstDay.getDay() + 6) % 7;
    const daysInMonth = new Date(this.selectedYear, this.selectedMonth, 0).getDate();
    const cells: (CalendarDay | null)[] = Array.from({ length: emptyDays }, () => null);

    for (let day = 1; day <= daysInMonth; day++) {
      const expenses = dashboard.expenses.filter(item => new Date(item.date).getUTCDate() === day);
      const incomes = dashboard.incomes.filter(item => new Date(item.date).getUTCDate() === day);
      cells.push({
        day,
        date: new Date(this.selectedYear, this.selectedMonth - 1, day),
        expenses,
        incomes,
        totalExpenses: expenses.reduce((sum, item) => sum + item.amount, 0),
        totalIncome: incomes.reduce((sum, item) => sum + item.amount, 0),
      });
    }

    while (cells.length % 7) cells.push(null);
    return Array.from({ length: cells.length / 7 }, (_, index) => cells.slice(index * 7, index * 7 + 7));
  }

  loadData(): void {
    this.isLoading = true;
    forkJoin({
      dashboard: this.finance.getDashboard(this.selectedYear, this.selectedMonth),
      year: this.finance.getYearSummary(this.selectedYear),
    }).subscribe({
      next: ({ dashboard, year }) => {
        this.dashboard = dashboard;
        this.yearSummary = year;
        this.planForm.setValue({
          expenseLimit: dashboard.plan?.expenseLimit ?? 0,
          savingsGoal: dashboard.plan?.savingsGoal ?? 0,
        });
        if (!this.expenseForm.controls.typeId.value && dashboard.expenseTypes[0]) {
          this.expenseForm.controls.typeId.setValue(dashboard.expenseTypes[0].id);
        }
        if (!this.incomeForm.controls.typeId.value && dashboard.incomeTypes[0]) {
          this.incomeForm.controls.typeId.setValue(dashboard.incomeTypes[0].id);
        }
        this.isLoading = false;
      },
      error: () => (this.isLoading = false),
    });
  }

  previousMonth(): void {
    this.selectedMonth--;
    if (this.selectedMonth === 0) {
      this.selectedMonth = 12;
      this.selectedYear--;
    }
    this.loadData();
  }

  nextMonth(): void {
    this.selectedMonth++;
    if (this.selectedMonth === 13) {
      this.selectedMonth = 1;
      this.selectedYear++;
    }
    this.loadData();
  }

  selectMonth(summary: MonthSummary): void {
    this.selectedYear = summary.year;
    this.selectedMonth = summary.month;
    this.loadData();
  }

  addExpense(): void {
    if (this.expenseForm.invalid) return;
    const value = this.expenseForm.getRawValue();
    this.finance.createExpense({ ...value, date: this.toApiDate(value.date) }).subscribe({
      next: () => {
        const typeId = value.typeId;
        this.expenseForm.reset({ typeId, description: '', amount: 0, date: this.today });
        void this.liveAnnouncer.announce(this.i18n.translate('finance.announcements.expenseAdded'));
        this.loadData();
      },
      error: () => undefined,
    });
  }

  addIncome(): void {
    if (this.incomeForm.invalid) return;
    const value = this.incomeForm.getRawValue();
    this.finance.createIncome({ ...value, date: this.toApiDate(value.date) }).subscribe({
      next: () => {
        const typeId = value.typeId;
        this.incomeForm.reset({ typeId, description: '', amount: 0, date: this.today });
        void this.liveAnnouncer.announce(this.i18n.translate('finance.announcements.incomeAdded'));
        this.loadData();
      },
      error: () => undefined,
    });
  }

  savePlan(): void {
    if (this.planForm.invalid) return;
    this.finance.savePlan(this.selectedYear, this.selectedMonth, this.planForm.getRawValue()).subscribe({
      next: () => {
        void this.liveAnnouncer.announce(this.i18n.translate('finance.announcements.planSaved'));
        this.loadData();
      },
      error: () => undefined,
    });
  }

  addExpenseType(): void {
    if (this.expenseTypeForm.invalid) return;
    this.finance.createExpenseType(this.expenseTypeForm.getRawValue()).subscribe({
      next: type => {
        this.expenseTypeForm.reset();
        this.expenseForm.controls.typeId.setValue(type.id);
        this.loadData();
      },
      error: () => undefined,
    });
  }

  addIncomeType(): void {
    if (this.incomeTypeForm.invalid) return;
    this.finance.createIncomeType(this.incomeTypeForm.getRawValue()).subscribe({
      next: type => {
        this.incomeTypeForm.reset();
        this.incomeForm.controls.typeId.setValue(type.id);
        this.loadData();
      },
      error: () => undefined,
    });
  }

  deleteExpense(expense: Expense): void {
    if (!window.confirm(this.i18n.translate('finance.confirmDelete'))) return;
    this.finance.deleteExpense(expense.id).subscribe({
      next: () => this.loadData(),
      error: () => undefined,
    });
  }

  deleteIncome(income: Income): void {
    if (!window.confirm(this.i18n.translate('finance.confirmDelete'))) return;
    this.finance.deleteIncome(income.id).subscribe({
      next: () => this.loadData(),
      error: () => undefined,
    });
  }

  expenseTypeName(typeId: string): string {
    return this.dashboard?.expenseTypes.find(item => item.id === typeId)?.name ?? this.i18n.translate('finance.unknownType');
  }

  incomeTypeName(typeId: string): string {
    return this.dashboard?.incomeTypes.find(item => item.id === typeId)?.name ?? this.i18n.translate('finance.unknownType');
  }

  monthName(month: number): string {
    const locale = this.i18n.currentLanguage() === 'pl' ? 'pl-PL' : 'en-US';
    return new Intl.DateTimeFormat(locale, { month: 'long' }).format(new Date(2026, month - 1, 1));
  }

  progress(value: number): number {
    return Math.max(0, Math.min(value, 100));
  }

  setChartView(view: 'bar' | 'radial'): void {
    if (this.chartView === view) return;

    this.chartView = view;
    void this.liveAnnouncer.announce(this.i18n.translate('finance.chart.viewChanged', {
      view: this.i18n.translate(`finance.chart.views.${view}`),
    }));
  }

  chartColor(index: number, kind: 'expense' | 'income'): string {
    const colors = kind === 'expense' ? this.expenseChartColors : this.incomeChartColors;
    return colors[index % colors.length];
  }

  radialGradient(items: TypeBreakdown[], kind: 'expense' | 'income'): string {
    let start = 0;
    const segments = items.map((item, index) => {
      const end = start + item.share;
      const segment = `${this.chartColor(index, kind)} ${start}% ${end}%`;
      start = end;
      return segment;
    });

    return `conic-gradient(from -90deg, ${segments.join(', ')})`;
  }

  calendarDayLabel(day: CalendarDay): string {
    return `${day.date.toLocaleDateString()}, ${this.i18n.translate('finance.income')}: ${day.totalIncome}, ${this.i18n.translate('finance.expenses')}: ${day.totalExpenses}`;
  }

  breakdownLabel(item: TypeBreakdown): string {
    return this.i18n.translate('finance.chart.itemLabel', {
      type: item.name,
      amount: new Intl.NumberFormat(this.i18n.currentLanguage() === 'pl' ? 'pl-PL' : 'en-US', {
        style: 'currency',
        currency: 'PLN',
      }).format(item.total),
      share: item.share.toFixed(1),
    });
  }

  private buildTypeBreakdown<T extends { amount: number }>(
    transactions: T[],
    types: { id: string; name: string }[],
    typeId: (transaction: T) => string,
  ): TypeBreakdown[] {
    const totals = new Map<string, number>();
    for (const transaction of transactions) {
      const id = typeId(transaction);
      const amount = Number(transaction.amount) || 0;
      totals.set(id, (totals.get(id) ?? 0) + amount);
    }

    const totalAmount = Array.from(totals.values()).reduce((sum, amount) => sum + amount, 0);
    const maximum = Math.max(0, ...totals.values());

    return Array.from(totals.entries())
      .map(([id, total]) => ({
        id,
        name: types.find(type => type.id === id)?.name ?? this.i18n.translate('finance.unknownType'),
        total,
        share: totalAmount > 0 ? (total / totalAmount) * 100 : 0,
        barWidth: maximum > 0 ? (total / maximum) * 100 : 0,
      }))
      .sort((left, right) => right.total - left.total);
  }

  private toApiDate(value: Date): string {
    return new Date(Date.UTC(value.getFullYear(), value.getMonth(), value.getDate())).toISOString();
  }
}
