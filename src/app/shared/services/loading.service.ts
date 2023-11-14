import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, catchError, concatMap, finalize, of, tap, throwError } from 'rxjs';
import { AlertService } from './alert.service';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {

  private loadingSubject = new BehaviorSubject<boolean>(false);

  loading$: Observable<boolean> = this.loadingSubject.asObservable();

  constructor(private alertService: AlertService) {
      console.log("Loading service created ...");
  }

  showLoaderUntilCompleted<T>(obs$: Observable<T>): Observable<T> {
      return of(null)
          .pipe(
              tap(() => this.loadingOn()),
              concatMap(() => obs$),
              finalize(() => this.loadingOff()),
              catchError(err => {
                const message = 'Could not load resources';
                this.alertService.openSnackBar(message, 'close')
                console.log(message, err);
                return throwError(() => new Error(err));
              })
          );
  }

  loadingOn() {
      this.loadingSubject.next(true);

  }

  loadingOff() {
      this.loadingSubject.next(false);
  }
}
