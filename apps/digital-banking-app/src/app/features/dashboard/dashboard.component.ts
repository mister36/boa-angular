import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import {
  AccountApiClient,
  TransactionApiClient,
  ProviderErrorMapper,
  Account,
  Transaction,
  AccountType,
  ProviderError
} from '@boa/financial-data';
import { AnalyticsService } from '@boa/analytics';

@Component({
  selector: 'boa-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent implements OnInit {
  accounts: Account[] = [];
  recentTransactions: Transaction[] = [];
  totalBalance = 0;
  loading = true;
  error: string | null = null;

  constructor(
    private accountApi: AccountApiClient,
    private transactionApi: TransactionApiClient,
    private providerErrorMapper: ProviderErrorMapper,
    private analyticsService: AnalyticsService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.analyticsService.trackPageView('/dashboard');
    this.loadDashboardData();
  }

  onAccountClick(account: Account): void {
    this.router.navigate(['/accounts', account.id]);
  }

  mapAccountType(type: AccountType): 'checking' | 'savings' | 'credit' | 'loan' {
    return type === 'credit_card' ? 'credit' : type;
  }

  private isProviderError(err: unknown): err is ProviderError {
    return typeof err === 'object' && err !== null && 'code' in err && 'technicalMessage' in err;
  }

  private loadDashboardData(): void {
    this.loading = true;
    this.error = null;

    forkJoin({
      accounts: this.accountApi.getAccounts(),
      transactions: this.transactionApi.getTransactions()
    }).subscribe({
      next: ({ accounts, transactions }) => {
        this.accounts = accounts;
        this.recentTransactions = transactions.slice(0, 5);
        this.totalBalance = accounts
          .filter(a => a.type === 'checking' || a.type === 'savings')
          .reduce((sum, a) => sum + a.availableBalance, 0);
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.error = this.isProviderError(err)
          ? this.providerErrorMapper.getErrorMessage(err)
          : 'An unexpected error occurred. Please try again later.';
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }
}
