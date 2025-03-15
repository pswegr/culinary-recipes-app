import { Component } from '@angular/core';
import { BehaviorSubject, Observable, switchMap, tap } from 'rxjs';
import { RecipeModel } from 'src/app/shared/models/recipe.model';
import { RecipesService } from '../../../shared/services/recipes.service';
import { ActivatedRoute, Router } from '@angular/router';
import { LoadingService } from 'src/app/shared/services/loading.service';
import { MatChipListboxChange } from '@angular/material/chips';

@Component({
    selector: 'app-recipes-all-list',
    templateUrl: './recipes-all-list.component.html',
    styleUrls: ['./recipes-all-list.component.scss'],
    standalone: false
})
export class RecipesAllListComponent {
  chosenTags: BehaviorSubject<string[]> = new BehaviorSubject([''])
  recipesAll$: Observable<RecipeModel[]> = this.route.queryParamMap.pipe(
    tap(params => this.chosenTags.next(params.getAll('tags'))),
    switchMap(params => this.recipeService.getAllRecipes(params.getAll('tags')))
  );

  allTags$: Observable<string[]> = this.recipeService.getAllTags();

  constructor(private recipeService: RecipesService, private router: Router, private route: ActivatedRoute, private loadingService: LoadingService) {
  }

  chipsChanged(event: MatChipListboxChange) {
    this.chosenTags.next(event.value);
    const tagsObj = { tags: this.chosenTags.value }
    this.router.navigate(['/recipes/all'], {
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
