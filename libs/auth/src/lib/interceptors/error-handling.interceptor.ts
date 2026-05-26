import { Injectable } from '@angular/core';
import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest
} from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

export interface NormalizedHttpError {
  status: number;
  message: string;
  code: string;
  correlationId: string;
  timestamp: number;
}

@Injectable()
export class ErrorHandlingInterceptor implements HttpInterceptor {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        const normalized = this.normalizeError(error);

        if (error.status === 401) {
          this.authService.logout();
        } else if (error.status === 403) {
          this.router.navigate(['/dashboard']);
        } else if (error.status === 503) {
          this.router.navigate(['/maintenance']);
        }

        return throwError(() => normalized);
      })
    );
  }

  private normalizeError(error: HttpErrorResponse): NormalizedHttpError {
    let message: string;

    switch (error.status) {
      case 0:
        message = 'Unable to connect to the server. Please check your internet connection.';
        break;
      case 401:
        message = 'Your session has expired. Please sign in again.';
        break;
      case 403:
        message = 'You do not have permission to perform this action.';
        break;
      case 404:
        message = 'The requested resource was not found.';
        break;
      case 500:
        message = 'An internal server error occurred. Please try again later.';
        break;
      case 503:
        message = 'The service is temporarily unavailable. Please try again later.';
        break;
      default:
        message = error.message || 'An unexpected error occurred.';
    }

    return {
      status: error.status,
      message,
      code: `HTTP_${error.status}`,
      correlationId: this.authService.getCorrelationId(),
      timestamp: Date.now()
    };
  }
}
