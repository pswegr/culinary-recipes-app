
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AccountService } from 'src/app/shared/services/account.service';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  constructor(
    private accountService: AccountService,
  ) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    if (this.accountService.currentUser()) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${this.accountService.currentUser()?.token}`
        }
      })
    }

    return next.handle(request)
  }
}
