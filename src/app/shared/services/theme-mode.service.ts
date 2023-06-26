import { Injectable, WritableSignal, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeModeService {
  isDark: WritableSignal<boolean> = signal(false);
}
