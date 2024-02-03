import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {

  loading = new BehaviorSubject<boolean>(false);

  loadingOn() {
    this.loading.next(true);
  }

  loadingOff() {
    this.loading.next(false);
  }
}
