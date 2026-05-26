import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatStepperModule } from '@angular/material/stepper';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { BoaButtonComponent } from './components/button/boa-button.component';
import { AccountCardComponent } from './components/account-card/account-card.component';
import { MoneyDisplayComponent } from './components/money-display/money-display.component';
import { AlertBannerComponent } from './components/alert-banner/alert-banner.component';
import { DataTableComponent } from './components/data-table/data-table.component';
import { DialogWrapperComponent } from './components/dialog-wrapper/dialog-wrapper.component';
import { FormFieldComponent } from './components/form-field/form-field.component';
import { LoadingSkeletonComponent } from './components/loading-skeleton/loading-skeleton.component';
import { EmptyStateComponent } from './components/empty-state/empty-state.component';
import { StepperComponent } from './components/stepper/stepper.component';
import { GlobalHeaderComponent } from './components/global-header/global-header.component';
import { SideNavComponent } from './components/side-nav/side-nav.component';

const MATERIAL_MODULES = [
  MatButtonModule,
  MatCardModule,
  MatIconModule,
  MatTableModule,
  MatPaginatorModule,
  MatSortModule,
  MatDialogModule,
  MatFormFieldModule,
  MatInputModule,
  MatSelectModule,
  MatStepperModule,
  MatToolbarModule,
  MatSidenavModule,
  MatListModule,
  MatMenuModule,
  MatBadgeModule,
  MatDividerModule,
  MatProgressSpinnerModule
];

const COMPONENTS = [
  BoaButtonComponent,
  AccountCardComponent,
  MoneyDisplayComponent,
  AlertBannerComponent,
  DataTableComponent,
  DialogWrapperComponent,
  FormFieldComponent,
  LoadingSkeletonComponent,
  EmptyStateComponent,
  StepperComponent,
  GlobalHeaderComponent,
  SideNavComponent
];

@NgModule({
  declarations: [...COMPONENTS],
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    ...MATERIAL_MODULES
  ],
  exports: [
    ...COMPONENTS,
    ...MATERIAL_MODULES
  ]
})
export class BoaDesignSystemModule {}
