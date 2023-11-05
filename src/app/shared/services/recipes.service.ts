import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { RecipeModel } from 'src/app/shared/models/recipe.model';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RecipesService {

  constructor(private http: HttpClient) { }

  getRecipes(pickedTags: string[] | null = null, category: string | null = null){
    const searchParams = new URLSearchParams();
    if(category){
      searchParams.append('category', category)
    }
    pickedTags?.forEach((tag) =>{ 
      if(tag){
        searchParams.append('tags', tag)
      } 
    });
    if(pickedTags?.length === 0 && !category){
      return this.http.get<RecipeModel[]>(environment.apiUrl + 'Recipes');
    }
    return this.http.get<RecipeModel[]>(environment.apiUrl + 'Recipes?' + searchParams.toString());
  }

  getAllRecipes(){
    return this.http.get<RecipeModel[]>(environment.apiUrl + 'Recipes/GetAll');
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

  upsertRecipe(formData: FormData){
    return this.http.post(environment.apiUrl + "Recipes/UpsertWithImage", formData, {
      reportProgress: true,
      observe: 'events'
    });
  }
}
