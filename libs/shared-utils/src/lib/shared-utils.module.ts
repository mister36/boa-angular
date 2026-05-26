import { NgModule } from '@angular/core';
import { EnvironmentConfigService } from './config/environment-config.util';

@NgModule({
  providers: [
    EnvironmentConfigService
  ]
})
export class SharedUtilsModule {}
