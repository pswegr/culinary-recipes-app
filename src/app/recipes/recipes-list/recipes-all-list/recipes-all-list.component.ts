import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { RecipeModel } from 'src/app/shared/models/recipe.model';
import { RecipesListComponent } from '../recipes-list.component';

@Component({
    selector: 'app-recipes-all-list',
    templateUrl: '../recipes-list.component.html',
    styleUrls: ['../recipes-list.component.scss'],
    standalone: false
})
export class RecipesAllListComponent extends RecipesListComponent {
  override title: string = 'All Recipes';
  
  override getRecipes(tags: string[] | null = null, category: string | null = null , content: string | null = null): Observable<RecipeModel[]> {
    return this.recipeService.getAllRecipes(tags, category, content);
  }

  override getTags(): Observable<string[]> {
    return this.recipeService.getAllTags();
  }
}
