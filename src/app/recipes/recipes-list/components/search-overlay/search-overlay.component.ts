import { Component, Signal, input, model, output } from '@angular/core';
import { Router } from '@angular/router';
import { concat, distinctUntilChanged, of, startWith, switchMap, timer } from 'rxjs';
import { RecipeModel } from 'src/app/shared/models/recipe.model';
import { LoadingService } from 'src/app/shared/services/loading.service';
import { ThemeModeService } from 'src/app/shared/services/theme-mode.service';

@Component({
    selector: 'app-search-overlay',
    templateUrl: './search-overlay.component.html',
    styleUrl: './search-overlay.component.scss',
    standalone: false
})
export class SearchOverlayComponent {
  filteredRecipesList = input.required<RecipeModel[]>();
  recentSearches = model.required<string[]>();
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
  
  constructor(private themeModeService: ThemeModeService, private router: Router, private loadingService: LoadingService){
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
