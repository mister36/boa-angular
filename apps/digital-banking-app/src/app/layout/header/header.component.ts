import { Component, EventEmitter, Output } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'boa-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  @Output() toggleSidenav = new EventEmitter<void>();

  userName = 'John D.';

  constructor(private router: Router) {}

  onSignOut(): void {
    this.router.navigate(['/login']);
  }
}
