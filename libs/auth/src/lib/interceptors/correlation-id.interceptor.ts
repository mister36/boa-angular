import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable()
export class CorrelationIdInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const correlationId = this.authService.getCorrelationId();

    const cloned = req.clone({
      setHeaders: {
        'X-Correlation-ID': correlationId
      }
    });

    return next.handle(cloned);
  }
}
