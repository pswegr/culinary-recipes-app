import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { RecipeModel } from 'src/app/shared/models/recipe.model';
import { RecipesListComponent } from '../recipes-list.component';

@Component({
    selector: 'app-your-recipes-list',
    templateUrl: '../recipes-list.component.html',
    styleUrl: '../recipes-list.component.scss',
    standalone: false
})
export class YourRecipesListComponent extends RecipesListComponent {
  override title: string = 'Your Recipes';

  override getRecipes(tags: string[] | null = null, category: string | null = null , content: string | null = null): Observable<RecipeModel[]> {
    return this.recipeService.getAllRecipesCreatedByUser(tags, category, content);
  }
  
  override getTags(): Observable<string[]> {
    return this.recipeService.getAllTagsCreatedByUser();
  }
}
