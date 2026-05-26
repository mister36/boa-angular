import { Component, Input, ChangeDetectionStrategy, ViewChild } from '@angular/core';
import { MatStepper } from '@angular/material/stepper';

@Component({
  selector: 'boa-stepper',
  templateUrl: './stepper.component.html',
  styleUrls: ['./stepper.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StepperComponent {
  @Input() linear = true;
  @Input() orientation: 'horizontal' | 'vertical' = 'horizontal';

  @ViewChild(MatStepper) stepper!: MatStepper;

  next(): void {
    this.stepper?.next();
  }

  previous(): void {
    this.stepper?.previous();
  }

  reset(): void {
    this.stepper?.reset();
  }
}
