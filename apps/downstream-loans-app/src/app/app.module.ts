import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';

import { BoaDesignSystemModule } from '@boa/design-system';
import { FinancialDataModule } from '@boa/financial-data';

import { AppComponent } from './app.component';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    BoaDesignSystemModule,
    FinancialDataModule
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
