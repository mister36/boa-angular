import { NgModule } from '@angular/core';
import { AuthService } from './services/auth.service';
import { MockSsoProvider } from './services/mock-sso.provider';

@NgModule({
  providers: [
    AuthService,
    MockSsoProvider
  ]
})
export class AuthModule {}
