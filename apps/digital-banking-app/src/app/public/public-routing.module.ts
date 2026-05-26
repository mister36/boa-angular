import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LoginComponent } from './login/login.component';
import { MfaChallengeComponent } from './mfa-challenge/mfa-challenge.component';
import { SessionExpiredComponent } from './session-expired/session-expired.component';
import { MaintenanceComponent } from './maintenance/maintenance.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'mfa', component: MfaChallengeComponent },
  { path: 'session-expired', component: SessionExpiredComponent },
  { path: 'maintenance', component: MaintenanceComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PublicRoutingModule {}
