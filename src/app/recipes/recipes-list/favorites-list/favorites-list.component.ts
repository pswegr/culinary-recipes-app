import { CdkConnectedOverlay } from '@angular/cdk/overlay';
import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatChipListboxChange } from '@angular/material/chips';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, combineLatest, Observable, Subscription, switchMap, tap } from 'rxjs';
import { RecipeModel } from 'src/app/shared/models/recipe.model';
import { LoadingService } from 'src/app/shared/services/loading.service';
import { RecipesService } from 'src/app/shared/services/recipes.service';
import { SearchBarService } from 'src/app/shared/services/search-bar.service';

@Component({
  selector: 'app-favorites-list',
  templateUrl: './favorites-list.component.html',
  styleUrl: './favorites-list.component.scss'
})
export class FavoritesListComponent {
  searchText = new FormControl('');
  overlayOpen = this.searchBarService.overlayoppen;

  refreshToken: BehaviorSubject<null> = new BehaviorSubject(null);
  chosenTags: BehaviorSubject<string[]> = new BehaviorSubject([''])
  recipes$: Observable<RecipeModel[]> = combineLatest([this.route.queryParamMap, this.refreshToken.asObservable() ]).pipe(
    tap(([params]) => {
      this.chosenTags.next(params.getAll('tags'));
      this.searchText.setValue(params.get('content'));
    }),
    switchMap(([params]) => this.recipeService.getFavorites(params.getAll('tags'), null, params.get('content')))
  );

  tags$: Observable<string[]> = this.recipeService.getFavoritesTags();

  likeToggleSub = Subscription.EMPTY;

  constructor(private recipeService: RecipesService, private router: Router, private route: ActivatedRoute, private loadingService: LoadingService, private searchBarService: SearchBarService) {
  }

  chipsChanged(event: MatChipListboxChange) {
    this.chosenTags.next(event.value);
    const tagsObj = { tags: this.chosenTags.value, content: this.searchText.value }
    this.router.navigate(['/recipes/favorites'], {
      queryParams: tagsObj
    })
  }

  clickTagOnItem(event: string){
    this.router.navigateByUrl(`recipes/tag/${event}`)
  }

  selected(tag: string){
    return this.chosenTags.value.filter(x => x === tag).length > 0;
  }

  clickLikeToggle(recipeId: string){
     this.recipeService.likeToggle(recipeId).subscribe(
      x => this.refreshToken.next(null)
    );
  }

  disableCombination(recipes: RecipeModel[], tag: string){
    return recipes.filter(x => x.tags.includes(tag)).length === 0;
  }

  public readonly overlayOptions: Partial<CdkConnectedOverlay> = {
    hasBackdrop: true,
    positions: [
      { originX: 'end', originY: 'bottom', overlayX: 'start',  overlayY: 'top'}
    ]
  };
  
  handleSearch(){
    const tagsObj = { tags: this.chosenTags.value, content: this.searchText.value }
    this.router.navigate(['/recipes'], {
      queryParams: tagsObj
    })
  }

  resetSearchText() {
    this.searchText.reset();
    const tagsObj = { tags: this.chosenTags.value }
    this.router.navigate(['/recipes'], {
      queryParams: tagsObj
    })
  }
}
