import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SearchBarService {
  overlayoppen = signal(false);
  recentSearches = signal<string[]>(JSON.parse(localStorage.getItem('recentSearches') || '[]'));

  constructor() { }
}
