import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean | UrlTree> {
    const requiredRoles: string[] = route.data['roles'] || [];

    return this.authService.currentUser$.pipe(
      take(1),
      map(user => {
        if (!user) {
          return this.router.createUrlTree(['/login']);
        }

        if (requiredRoles.length === 0) {
          return true;
        }

        const hasRole = requiredRoles.some(role => user.roles.includes(role));
        if (hasRole) {
          return true;
        }

        return this.router.createUrlTree(['/dashboard']);
      })
    );
  }
}
