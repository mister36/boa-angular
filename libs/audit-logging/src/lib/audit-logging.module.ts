import { NgModule } from '@angular/core';
import { AuditLogService } from './services/audit-log.service';

@NgModule({
  providers: [AuditLogService]
})
export class AuditLoggingModule {}
