import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
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
      catchError(err => {
        const message = err.status === 401? 'Unathorized': 'Could not load resources';
        this.alertService.openSnackBar(message, 'close');
        if(err.status === 401){
          this.accountService.logout();
          this.router.navigateByUrl(`/account/login?returnUrl=${this.router.url}`);
        }
        this.totalRequests--;
        if (this.totalRequests <= 0) {
          this.loadingService.loadingOff();
        }
        console.log(message, err);
        return throwError(() => new Error(err));
      })
    );
  }
}
