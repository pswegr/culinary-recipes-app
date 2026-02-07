import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, finalize, throwError } from 'rxjs';
import { LoadingService } from 'src/app/shared/services/loading.service';
import { AlertService } from 'src/app/shared/services/alert.service';
import { Router } from '@angular/router';
import { AccountService } from 'src/app/shared/services/account.service';

@Injectable()
export class LoadingInterceptor implements HttpInterceptor {

  private totalRequests = 0;

  constructor(
    private loadingService: LoadingService,
    private alertService: AlertService,
    private router: Router,
    private accountService: AccountService
  ) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
   
    this.totalRequests++;
    this.loadingService.loadingOn();
    
    return next.handle(request).pipe(
      finalize(() => {
        this.totalRequests--;
        if (this.totalRequests <= 0) {
          this.loadingService.loadingOff();
        }
      }),
      catchError((err: HttpErrorResponse) => {
        const message = this.getErrorMessage(err);
        this.alertService.openSnackBar(message, 'close');
        if (err.status === 401) {
          this.accountService.logout();
          this.router.navigateByUrl(`/account/login?returnUrl=${this.router.url}`);
        }
        console.error('HTTP request failed', {
          method: request.method,
          url: request.urlWithParams,
          status: err.status,
          error: err.error
        });
        return throwError(() => err);
      })
    );
  }

  private getErrorMessage(err: HttpErrorResponse): string {
    if (err.status === 401) {
      return 'Unauthorized';
    }

    return this.extractApiMessage(err.error) ?? 'Could not load resources';
  }

  private extractApiMessage(error: unknown): string | null {
    if (typeof error === 'string' && error.trim()) {
      return error;
    }

    if (!error || typeof error !== 'object') {
      return null;
    }

    const payload = error as Record<string, unknown>;

    if (typeof payload['message'] === 'string' && payload['message'].trim()) {
      return payload['message'];
    }

    if (typeof payload['title'] === 'string' && payload['title'].trim()) {
      return payload['title'];
    }

    const errors = payload['errors'];
    if (errors && typeof errors === 'object' && !Array.isArray(errors)) {
      const firstField = Object.values(errors)[0];
      if (Array.isArray(firstField) && typeof firstField[0] === 'string') {
        return firstField[0];
      }
    }

    return null;
  }
}
