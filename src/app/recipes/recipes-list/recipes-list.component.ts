import { Component, OnInit } from '@angular/core';
import { RecipeModel } from 'src/app/shared/models/recipe.model';
import { RecipesService } from '../services/recipes.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-recipes-list',
  templateUrl: './recipes-list.component.html',
  styleUrls: ['./recipes-list.component.scss']
})
export class RecipesListComponent{
  recipes$: Observable<RecipeModel[]> = this.recipeService.getRecipes();

  constructor(private recipeService: RecipesService){}
}
