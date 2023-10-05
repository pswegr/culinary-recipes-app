import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { RecipeModel } from 'src/app/shared/models/recipe.model';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RecipesService {

  constructor(private http: HttpClient) { }

  getRecipes(){
    return this.http.get<RecipeModel[]>(environment.apiUrl + 'Recipes');
  }

  getCategories() {
    return this.http.get<string[]>(environment.apiUrl + 'Recipes/Categories');
  }

  getRecipe(id: string){
    return this.http.get<RecipeModel>(environment.apiUrl + `Recipes/${id}`);
  }

  getTags() {
    return this.http.get<string[]>(environment.apiUrl + 'Recipes/Tags');
  }
}
