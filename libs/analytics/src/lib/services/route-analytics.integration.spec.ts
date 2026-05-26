import { TestBed } from '@angular/core/testing';
import { Router, NavigationEnd } from '@angular/router';
import { Subject } from 'rxjs';
import { RouteAnalyticsService } from './route-analytics.service';
import { AnalyticsService } from './analytics.service';

describe('RouteAnalytics Integration', () => {
  let service: RouteAnalyticsService;
  let analyticsService: jasmine.SpyObj<AnalyticsService>;
  let routerEvents$: Subject<any>;

  beforeEach(() => {
    routerEvents$ = new Subject();
    analyticsService = jasmine.createSpyObj('AnalyticsService', ['trackPageView']);

    TestBed.configureTestingModule({
      providers: [
        RouteAnalyticsService,
        { provide: AnalyticsService, useValue: analyticsService },
        {
          provide: Router,
          useValue: { events: routerEvents$.asObservable() }
        }
      ]
    });

    service = TestBed.inject(RouteAnalyticsService);
  });

  afterEach(() => {
    service.ngOnDestroy();
  });

  it('should track page view on NavigationEnd', () => {
    service.initialize();
    routerEvents$.next(new NavigationEnd(1, '/dashboard', '/dashboard'));

    expect(analyticsService.trackPageView).toHaveBeenCalledWith(
      '/dashboard',
      jasmine.objectContaining({
        routePath: '/dashboard',
        routeName: 'dashboard'
      })
    );
  });

  it('should strip query params from URL', () => {
    service.initialize();
    routerEvents$.next(new NavigationEnd(1, '/accounts?id=123', '/accounts?id=123'));

    expect(analyticsService.trackPageView).toHaveBeenCalledWith(
      '/accounts',
      jasmine.objectContaining({ routePath: '/accounts' })
    );
  });

  it('should track previous route', () => {
    service.initialize();
    routerEvents$.next(new NavigationEnd(1, '/login', '/login'));
    routerEvents$.next(new NavigationEnd(2, '/dashboard', '/dashboard'));

    const secondCall = analyticsService.trackPageView.calls.argsFor(1);
    expect(secondCall[1]).toEqual(jasmine.objectContaining({ previousRoute: '/login' }));
  });

  it('should not track non-NavigationEnd events', () => {
    service.initialize();
    routerEvents$.next({ id: 1, url: '/test' });

    expect(analyticsService.trackPageView).not.toHaveBeenCalled();
  });

  it('should handle root path', () => {
    service.initialize();
    routerEvents$.next(new NavigationEnd(1, '/', '/'));

    expect(analyticsService.trackPageView).toHaveBeenCalledWith(
      '/',
      jasmine.objectContaining({ routeName: 'root' })
    );
  });
});
