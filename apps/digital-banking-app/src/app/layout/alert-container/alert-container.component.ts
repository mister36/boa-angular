import { Component } from '@angular/core';

@Component({
  selector: 'boa-alert-container',
  templateUrl: './alert-container.component.html',
  styleUrls: ['./alert-container.component.scss']
})
export class AlertContainerComponent {
  alerts: Array<{ type: string; message: string }> = [];

  dismiss(index: number): void {
    this.alerts.splice(index, 1);
  }
}
