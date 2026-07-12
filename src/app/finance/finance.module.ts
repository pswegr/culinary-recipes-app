import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../shared/shared.module';
import { FinanceDashboardComponent } from './finance-dashboard/finance-dashboard.component';
import { FinanceRoutingModule } from './finance-routing.module';

@NgModule({
  declarations: [FinanceDashboardComponent],
  imports: [SharedModule, FormsModule, ReactiveFormsModule, FinanceRoutingModule],
})
export class FinanceModule {}
