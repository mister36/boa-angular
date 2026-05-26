import { ModuleWithProviders, NgModule } from '@angular/core';
import { AnalyticsDirective } from './directives/analytics.directive';
import { AnalyticsService } from './services/analytics.service';
import { RouteAnalyticsService } from './services/route-analytics.service';

@NgModule({
  declarations: [AnalyticsDirective],
  exports: [AnalyticsDirective]
})
export class AnalyticsModule {
  constructor(private routeAnalytics: RouteAnalyticsService) {
    this.routeAnalytics.initialize();
  }

  static forRoot(): ModuleWithProviders<AnalyticsModule> {
    return {
      ngModule: AnalyticsModule,
      providers: [
        AnalyticsService,
        RouteAnalyticsService
      ]
    };
  }
}
