import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpErrorResponse, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private router: Router) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<any> {

    const hasStorage = typeof localStorage !== 'undefined';
    const token = hasStorage ? localStorage.getItem('token') : null;

    const cloned = token
      ? req.clone({ headers: req.headers.set('Authorization', `Bearer ${token}`) })
      : req;

    return next.handle(cloned).pipe(
      catchError((err: HttpErrorResponse) => {

        if (err.status === 401 && hasStorage) {
          localStorage.removeItem('token');
          this.router.navigate(['/login']);
        }
        return throwError(() => err);
      })
    );
  }
}
