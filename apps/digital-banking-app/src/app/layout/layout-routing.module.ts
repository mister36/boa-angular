import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard, MfaGuard } from '@boa/auth';

import { LayoutComponent } from './layout.component';

const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    canActivate: [AuthGuard, MfaGuard],
    children: [
      {
        path: 'dashboard',
        loadChildren: () => import('../features/dashboard/dashboard.module').then(m => m.DashboardModule)
      },
      {
        path: 'accounts/:id',
        loadChildren: () => import('../features/account-detail/account-detail.module').then(m => m.AccountDetailModule)
      },
      {
        path: 'transactions',
        loadChildren: () => import('../features/transactions/transactions.module').then(m => m.TransactionsModule)
      },
      {
        path: 'transfer',
        loadChildren: () => import('../features/transfer/transfer.module').then(m => m.TransferModule)
      },
      {
        path: 'bill-pay',
        loadChildren: () => import('../features/bill-pay/bill-pay.module').then(m => m.BillPayModule)
      },
      {
        path: 'profile',
        loadChildren: () => import('../features/profile/profile.module').then(m => m.ProfileModule)
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LayoutRoutingModule {}
