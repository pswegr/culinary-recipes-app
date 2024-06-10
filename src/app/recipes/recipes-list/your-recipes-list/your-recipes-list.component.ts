import { Component } from '@angular/core';
import { MatChipListboxChange } from '@angular/material/chips';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, Observable, switchMap, tap } from 'rxjs';
import { RecipeModel } from 'src/app/shared/models/recipe.model';
import { LoadingService } from 'src/app/shared/services/loading.service';
import { RecipesService } from 'src/app/shared/services/recipes.service';

@Component({
  selector: 'app-your-recipes-list',
  templateUrl: './your-recipes-list.component.html',
  styleUrl: './your-recipes-list.component.scss'
})
export class YourRecipesListComponent {
  chosenTags: BehaviorSubject<string[]> = new BehaviorSubject([''])
  recipesAll$: Observable<RecipeModel[]> = this.route.queryParamMap.pipe(
    tap(params => this.chosenTags.next(params.getAll('tags'))),
    switchMap(params => this.recipeService.getAllRecipesCreatedByUser(params.getAll('tags')))
  );

  allTags$: Observable<string[]> = this.recipeService.getAllTagsCreatedByUser();

  constructor(private recipeService: RecipesService, private router: Router, private route: ActivatedRoute, private loadingService: LoadingService) {
  }

  chipsChanged(event: MatChipListboxChange) {
    this.chosenTags.next(event.value);
    const tagsObj = { tags: this.chosenTags.value }
    this.router.navigate(['/recipes/yours'], {
      queryParams: tagsObj
    })
  }

  clickTagOnItem(event: string){
    this.router.navigateByUrl(`recipes/tag/${event}`)
  }

  selected(tag: string){
    return this.chosenTags.value.filter(x => x === tag).length > 0;
  }
}
