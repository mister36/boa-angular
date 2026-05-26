import { Injectable, OnDestroy } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { AnalyticsService } from './analytics.service';

@Injectable()
export class RouteAnalyticsService implements OnDestroy {
  private destroy$ = new Subject<void>();
  private previousRoute: string | undefined;

  constructor(
    private router: Router,
    private analyticsService: AnalyticsService
  ) {}

  initialize(): void {
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe(event => {
        const routePath = this.stripQueryParams(event.urlAfterRedirects || event.url);

        this.analyticsService.trackPageView(routePath, {
          routePath,
          routeName: this.extractRouteName(routePath),
          previousRoute: this.previousRoute
        });

        this.previousRoute = routePath;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private stripQueryParams(url: string): string {
    const queryIndex = url.indexOf('?');
    return queryIndex > -1 ? url.substring(0, queryIndex) : url;
  }

  private extractRouteName(routePath: string): string {
    const segments = routePath.split('/').filter(Boolean);
    return segments.length > 0 ? segments[segments.length - 1] : 'root';
  }
}
