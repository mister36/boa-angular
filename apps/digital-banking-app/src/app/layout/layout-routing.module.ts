import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard, MfaGuard } from '@boa/auth';

import { LayoutComponent } from './layout.component';
import {
  DashboardPlaceholderComponent,
  AccountDetailPlaceholderComponent,
  TransactionsPlaceholderComponent,
  TransferPlaceholderComponent,
  BillPayPlaceholderComponent,
  ProfilePlaceholderComponent
} from './placeholders/placeholder.components';

const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    canActivate: [AuthGuard, MfaGuard],
    children: [
      { path: 'dashboard', component: DashboardPlaceholderComponent },
      { path: 'accounts/:id', component: AccountDetailPlaceholderComponent },
      { path: 'transactions', component: TransactionsPlaceholderComponent },
      { path: 'transfer', component: TransferPlaceholderComponent },
      { path: 'bill-pay', component: BillPayPlaceholderComponent },
      { path: 'profile', component: ProfilePlaceholderComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LayoutRoutingModule {}
