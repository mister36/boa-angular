import { Component } from '@angular/core';

@Component({
  selector: 'boa-maintenance',
  templateUrl: './maintenance.component.html',
  styleUrls: ['./maintenance.component.scss']
})
export class MaintenanceComponent {
  onTryAgain(): void {
    window.location.reload();
  }
}
