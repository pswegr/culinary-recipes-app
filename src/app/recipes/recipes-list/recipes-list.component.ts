import { Component } from '@angular/core';
import { RecipeModel } from 'src/app/shared/models/recipe.model';
import { RecipesService } from '../../shared/services/recipes.service';
import { BehaviorSubject, Observable, map, switchMap, tap } from 'rxjs';
import { MatChipListboxChange } from '@angular/material/chips';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-recipes-list',
  templateUrl: './recipes-list.component.html',
  styleUrls: ['./recipes-list.component.scss']
})
export class RecipesListComponent {
  chosenTags: BehaviorSubject<string[]> = new BehaviorSubject([''])
  recipes$: Observable<RecipeModel[]> = this.route.queryParamMap.pipe(
    tap(params => this.chosenTags.next(params.getAll('tags'))),
    switchMap(params => this.recipeService.getRecipes(params.getAll('tags')))
  );

  tags$: Observable<string[]> = this.recipeService.getTags();

  constructor(private recipeService: RecipesService, private router: Router, private route: ActivatedRoute) {
  }

  chipsChanged(event: MatChipListboxChange) {
    this.chosenTags.next(event.value);
    const tagsObj = { tags: this.chosenTags.value }
    this.router.navigate(['/recipes'], {
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
