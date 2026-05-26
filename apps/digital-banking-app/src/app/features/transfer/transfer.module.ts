import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { MatStepperModule } from '@angular/material/stepper';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';

import { BoaDesignSystemModule } from '@boa/design-system';

import { TransferRoutingModule } from './transfer-routing.module';
import { TransferComponent } from './transfer.component';
import { SelectSourceStepComponent } from './steps/select-source-step.component';
import { SelectDestinationStepComponent } from './steps/select-destination-step.component';
import { EnterAmountStepComponent } from './steps/enter-amount-step.component';
import { ReviewStepComponent } from './steps/review-step.component';
import { ConfirmStepComponent } from './steps/confirm-step.component';
import { SuccessStepComponent } from './steps/success-step.component';

@NgModule({
  declarations: [
    TransferComponent,
    SelectSourceStepComponent,
    SelectDestinationStepComponent,
    EnterAmountStepComponent,
    ReviewStepComponent,
    ConfirmStepComponent,
    SuccessStepComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TransferRoutingModule,
    MatStepperModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule,
    MatDialogModule,
    MatCardModule,
    MatIconModule,
    MatDividerModule,
    BoaDesignSystemModule
  ]
})
export class TransferModule {}
