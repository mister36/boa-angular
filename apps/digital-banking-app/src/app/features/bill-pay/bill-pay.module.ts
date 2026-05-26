import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';

import { BoaDesignSystemModule } from '@boa/design-system';

import { BillPayRoutingModule } from './bill-pay-routing.module';
import { BillPayComponent } from './bill-pay.component';
import { AddPayeeDialogComponent } from './add-payee-dialog/add-payee-dialog.component';

@NgModule({
  declarations: [
    BillPayComponent,
    AddPayeeDialogComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    BillPayRoutingModule,
    MatCardModule,
    MatListModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatChipsModule,
    BoaDesignSystemModule
  ]
})
export class BillPayModule {}
