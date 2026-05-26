import { Component } from '@angular/core';

interface NavItem {
  label: string;
  route: string;
  icon: string;
}

@Component({
  selector: 'boa-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss']
})
export class SidenavComponent {
  navItems: NavItem[] = [
    { label: 'Dashboard', route: '/dashboard', icon: 'dashboard' },
    { label: 'Accounts', route: '/accounts/summary', icon: 'account_balance' },
    { label: 'Transactions', route: '/transactions', icon: 'receipt_long' },
    { label: 'Transfers', route: '/transfer', icon: 'swap_horiz' },
    { label: 'Bill Pay', route: '/bill-pay', icon: 'payment' },
    { label: 'Profile & Security', route: '/profile', icon: 'security' }
  ];
}
