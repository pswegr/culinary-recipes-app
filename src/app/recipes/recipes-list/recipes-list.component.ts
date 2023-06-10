import { Component, OnInit } from '@angular/core';
import { RecipeModel } from 'src/app/shared/models/recipe.model';
import { RecipesService } from '../services/recipes.service';

@Component({
  selector: 'app-recipes-list',
  templateUrl: './recipes-list.component.html',
  styleUrls: ['./recipes-list.component.scss']
})
export class RecipesListComponent implements OnInit{
  recipes: RecipeModel[] = [];

  constructor(private recipeService: RecipesService){}

  ngOnInit(): void {
    this.recipeService.getRecipes().subscribe(x => this.recipes = x);
  }

}
