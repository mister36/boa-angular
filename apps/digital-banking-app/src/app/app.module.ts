import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import {
  AuthModule,
  AuthTokenInterceptor,
  CorrelationIdInterceptor,
  ErrorHandlingInterceptor,
  SessionTimeoutInterceptor
} from '@boa/auth';
import { BoaDesignSystemModule } from '@boa/design-system';
import { FinancialDataModule } from '@boa/financial-data';
import { SharedUtilsModule } from '@boa/shared-utils';
import { FeatureFlagsModule } from '@boa/feature-flags';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    AuthModule,
    BoaDesignSystemModule,
    FinancialDataModule,
    SharedUtilsModule,
    FeatureFlagsModule,
    AppRoutingModule
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthTokenInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: CorrelationIdInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorHandlingInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: SessionTimeoutInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
