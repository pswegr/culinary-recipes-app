import { Component } from '@angular/core';
import { RecipeModel } from 'src/app/shared/models/recipe.model';
import { RecipesService } from '../../shared/services/recipes.service';
import { BehaviorSubject, Observable, Subscription, catchError, combineLatest, debounceTime, of, switchMap, tap } from 'rxjs';
import { MatChipListboxChange } from '@angular/material/chips';
import { ActivatedRoute, Router } from '@angular/router';
import { LoadingService } from 'src/app/shared/services/loading.service';
import { SearchBarService } from 'src/app/shared/services/search-bar.service';
import { CdkConnectedOverlay } from '@angular/cdk/overlay';
import { FormControl } from '@angular/forms';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { MessagingService } from 'src/app/shared/services/messaging.service';

@Component({
  selector: 'app-recipes-list',
  templateUrl: './recipes-list.component.html',
  styleUrls: ['./recipes-list.component.scss'],
  standalone: false
})
export class RecipesListComponent {
  titleKey = 'recipes.titles.recipes';
  searchText = new FormControl('');
  category: string | null = null;
  loadFailed = false;
  overlayOpen = this.searchBarService.overlayoppen;
  recentSearches = this.searchBarService.recentSearches;
  skeletonCards = Array.from({ length: 6 });
  skeletonChips = Array.from({ length: 6 });

  refreshToken: BehaviorSubject<null> = new BehaviorSubject(null);
  chosenTags: BehaviorSubject<string[]> = new BehaviorSubject([''])
  recipes$: Observable<RecipeModel[]> = combineLatest([this.route.queryParamMap, this.refreshToken.asObservable()]).pipe(
    tap(([params]) => {
      this.loadFailed = false;
      this.chosenTags.next(params.getAll('tag'));
      this.searchText.setValue(params.get('content'));
      this.category = params.get('category');
    }),
    switchMap(([params]) => this.getRecipes(params.getAll('tag'), params.get('category'), params.get('content')).pipe(
      catchError(() => {
        this.loadFailed = true;
        return of([]);
      })
    ))
  );

  filteredRecipesList = toSignal(combineLatest([this.route.queryParamMap, this.searchText.valueChanges]).pipe(
    debounceTime(2000),
    switchMap(([params, searchText]) => {
      let recentSearches = JSON.parse(localStorage.getItem('recentSearches') || '[]');
      if (searchText && !recentSearches.includes(searchText)) {
        recentSearches.push(searchText);
      }

      if (recentSearches.length > 5) {
        recentSearches.shift();
      }

      localStorage.setItem('recentSearches', JSON.stringify(recentSearches));
      this.recentSearches.set(recentSearches);
      return this.getRecipes(params.getAll('tag'), params.get('category'), searchText).pipe(catchError(() => of([])))
    })
  ));

  getRecipes(tags: string[] | null = null, category: string | null = null, content: string | null = null): Observable<RecipeModel[]> {
    return this.recipeService.getRecipes(tags, category, content);
  }

  getTags(): Observable<string[]> {
    return this.recipeService.getTags();
  }

  tags$: Observable<string[]> = this.getTags().pipe(catchError(() => of([])));

  likeToggleSub = Subscription.EMPTY;

  constructor(
    protected recipeService: RecipesService,
    private router: Router,
    protected route: ActivatedRoute,
    private loadingService: LoadingService,
    private searchBarService: SearchBarService,
    private messagingService: MessagingService
  ) {
  }

  chipsChanged(event: MatChipListboxChange) {
    this.chosenTags.next(event.value);
    this.updateQueryParams({ tag: event.value.length ? event.value : null});
  }

  clickTagOnItem(event: string) {
    this.chosenTags.next([event]);;
    this.updateQueryParams({ tag: event});
  }

  selected(tag: string) {
    return this.chosenTags.value.filter(x => x === tag).length > 0;
  }

  clickLikeToggle(recipeId: string) {
    this.recipeService.likeToggle(recipeId).subscribe(
      x => this.refreshToken.next(null)
    );
  }

  openMessaging(recipientUserId: string, recipientLabel?: string): void {
    this.messagingService.openWidget(recipientUserId, recipientLabel);
  }

  disableCombination(recipes: RecipeModel[], tag: string) {
    return recipes.filter(x => x.tags.includes(tag)).length === 0;
  }

  public readonly overlayOptions: Partial<CdkConnectedOverlay> = {
    hasBackdrop: false,
    positions: [
      { originX: 'end', originY: 'bottom', overlayX: 'start', overlayY: 'top' }
    ]
  };

  handleSearch() {
    this.overlayOpen.set(false);
    this.updateQueryParams({ tag: this.chosenTags.value, content: this.searchText.value || null });
  }

  chooseRecentSearch(search: string) {
    this.searchText.setValue(search);
    this.handleSearch();
  }

  clearFilters() {
    this.searchText.reset();
    this.overlayOpen.set(false);
    this.updateQueryParams({ tag: null, category: null, content: null });
  }

  trackByRecipe(_index: number, recipe: RecipeModel) {
    return recipe.id;
  }

  resetSearchText() {
    this.searchText.reset();
    this.updateQueryParams({tag: this.chosenTags.value, content: null});
  }

  updateQueryParams(
    changes: Record<string, string | number | boolean | string[] | null | undefined>
  ) {
    const queryParams: Record<string, any> = {};

    Object.entries(changes).forEach(([key, value]) => {
      if (value === null || value === undefined) {
        queryParams[key] = null; // remove param
        return;
      }

      if (Array.isArray(value)) {
        queryParams[key] = value.length ? value : null;
        return;
      }
      
      if(typeof value === 'string'){
        queryParams[key] = value.replace(/[\r\n]+/g, '');
        return;
      }
        
      queryParams[key] = value;
    });

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      queryParamsHandling: 'merge'
    });
  }
}
