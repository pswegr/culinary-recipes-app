import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, catchError, concatMap, finalize, of, tap, throwError } from 'rxjs';
import { AlertService } from './alert.service';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {

  private loadingSubject = new BehaviorSubject<boolean>(false);

  loading$: Observable<boolean> = this.loadingSubject.asObservable();

  loadingOn() {
    this.loadingSubject.next(true);
  }

  loadingOff() {
    this.loadingSubject.next(false);
  }
}
