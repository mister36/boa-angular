import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { AuthStatus } from '../models/auth.models';

@Injectable({ providedIn: 'root' })
export class MfaGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): Observable<boolean | UrlTree> {
    return this.authService.authState$.pipe(
      take(1),
      map(state => {
        if (state.status === AuthStatus.Authenticated) {
          return true;
        }

        if (state.status === AuthStatus.MfaPending) {
          return this.router.createUrlTree(['/mfa']);
        }

        return this.router.createUrlTree(['/login']);
      })
    );
  }
}
