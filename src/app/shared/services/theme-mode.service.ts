import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThemeModeService {
  private isDarkModeSource = new Subject<boolean>();
  isDarkMode$ = this.isDarkModeSource.asObservable();
  
  setIsDarkMode(isDark : boolean) {
    this.isDarkModeSource.next(isDark);
  }
}
