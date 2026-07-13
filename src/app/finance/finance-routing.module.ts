import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { authGuard } from '../core/guards/auth.guard';
import { FinanceDashboardComponent } from './finance-dashboard/finance-dashboard.component';

const routes: Routes = [
  {
    path: '',
    component: FinanceDashboardComponent,
    canActivate: [authGuard],
    title: 'Financial manager',
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FinanceRoutingModule {}
