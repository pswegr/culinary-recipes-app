import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { RecipeModel } from 'src/app/shared/models/recipe.model';
import { RecipesService } from '../../../shared/services/recipes.service';

@Component({
  selector: 'app-recipes-all-list',
  templateUrl: './recipes-all-list.component.html',
  styleUrls: ['./recipes-all-list.component.scss']
})
export class RecipesAllListComponent {
  recipesAll$: Observable<RecipeModel[]> = this.recipeService.getAllRecipes();

  constructor(private recipeService: RecipesService){}
}
