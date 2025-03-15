import { Component, Signal, input, output } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { concat, debounceTime, delay, distinctUntilChanged, map, mapTo, of, startWith, switchMap, timer } from 'rxjs';
import { LoadingService } from 'src/app/shared/services/loading.service';
import { RecipesService } from 'src/app/shared/services/recipes.service';
import { SearchBarService } from 'src/app/shared/services/search-bar.service';
import { ThemeModeService } from 'src/app/shared/services/theme-mode.service';

@Component({
    selector: 'app-search-overlay',
    templateUrl: './search-overlay.component.html',
    styleUrl: './search-overlay.component.scss',
    standalone: false
})
export class SearchOverlayComponent {
  searchText = input.required<string>();
  onHistoryItemChoosen = output<string>();
  isLoading$ = concat(
    of(true),
    timer(2000).pipe(
      switchMap(() =>
        this.loadingService.isLoading$.pipe(
          startWith(true),
          distinctUntilChanged(),
        )
      )
    )
  );

  isDark: Signal<boolean> = this.themeModeService.isDark;

  recentSearches = this.searchBarService.recentSearches;

  filteredRecipesList$ = toObservable(this.searchText).pipe(
    debounceTime(2000),
    switchMap(x => {
      let recentSearches = JSON.parse(localStorage.getItem('recentSearches')  || '[]');
      if(x && !recentSearches.includes(x)){
        recentSearches.push(x);
      }
    
      if(recentSearches.length > 5){
        recentSearches.shift();
      }

      localStorage.setItem('recentSearches', JSON.stringify(recentSearches));
      this.recentSearches.set(recentSearches);
      return this.recipesService.getRecipes(null,null,x)})
  );
  
  constructor(private searchBarService: SearchBarService, private recipesService: RecipesService, private themeModeService: ThemeModeService, private router: Router, private loadingService: LoadingService){
   }

   navigateToDetails(recipeId: string) {
    this.router.navigateByUrl(`recipes/details/${recipeId}`)
  }

  deleteHistoryItem(event: MouseEvent, search: string) {
    event.preventDefault();

    let recentSearches = JSON.parse(localStorage.getItem('recentSearches')  || '[]');
      if(search){
        recentSearches.pop(search);
      }
    
      if(recentSearches.length > 5){
        recentSearches.shift();
      }

      localStorage.setItem('recentSearches', JSON.stringify(recentSearches));
      this.recentSearches.set(recentSearches);
  }
}
