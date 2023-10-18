import { Component, WritableSignal, signal } from '@angular/core';
import { RecipeModel } from 'src/app/shared/models/recipe.model';
import { RecipesService } from '../services/recipes.service';
import { Observable, switchMap } from 'rxjs';
import { MatChipListboxChange } from '@angular/material/chips';
import { toObservable } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-recipes-list',
  templateUrl: './recipes-list.component.html',
  styleUrls: ['./recipes-list.component.scss']
})
export class RecipesListComponent{
  chosenTags: WritableSignal<string[]> = signal([]);
  recipes$: Observable<RecipeModel[]> =  
    toObservable(this.chosenTags)
      .pipe(
        switchMap((pickedTags) => 
          this.recipeService.getRecipes(pickedTags) 
        )
      );

  tags$: Observable<string[]> = this.recipeService.getTags();

  constructor(private recipeService: RecipesService){}

  chipsChanged(event: MatChipListboxChange){
    this.chosenTags.set(event.value);
  }
}
