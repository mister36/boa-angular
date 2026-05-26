import { NgModule } from '@angular/core';
import { FeatureFlagService } from './services/feature-flag.service';
import { FeatureFlagDirective } from './directives/feature-flag.directive';

@NgModule({
  declarations: [
    FeatureFlagDirective
  ],
  exports: [
    FeatureFlagDirective
  ],
  providers: [
    FeatureFlagService
  ]
})
export class FeatureFlagsModule {}
