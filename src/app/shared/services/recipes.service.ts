import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, retry } from 'rxjs';
import { RecipeModel } from 'src/app/shared/models/recipe.model';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RecipesService {

  constructor(private http: HttpClient) { }

  getRecipes(pickedTags: string[] | null = null, category: string | null = null, content: string | null = null){
    const searchParams = new URLSearchParams();
    if(category){
      searchParams.append('category', category)
    }
    if(content){
      searchParams.append('content', content);
    }
    pickedTags?.forEach((tag) =>{ 
      if(tag){
        searchParams.append('tags', tag)
      } 
    });
    if(pickedTags?.length === 0 && !category && !content){
      return this.http.get<RecipeModel[]>(environment.apiUrl + 'Recipes');
    }
    return this.http.get<RecipeModel[]>(environment.apiUrl + 'Recipes?' + searchParams.toString());
  }

  getFavorites(pickedTags: string[] | null = null, category: string | null = null, content: string | null = null){
    const searchParams = new URLSearchParams();
    if(category){
      searchParams.append('category', category)
    }
    if(content){
      searchParams.append('content', content);
    }
    pickedTags?.forEach((tag) =>{ 
      if(tag){
        searchParams.append('tags', tag)
      } 
    });
    if(pickedTags?.length === 0 && !category && !content){
      return this.http.get<RecipeModel[]>(environment.apiUrl + 'Recipes/GetFavorites');
    }
    return this.http.get<RecipeModel[]>(environment.apiUrl + 'Recipes/GetFavorites?' + searchParams.toString());
  }

  getAllRecipes(pickedTags: string[] | null = null, category: string | null = null){
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
      return this.http.get<RecipeModel[]>(environment.apiUrl + 'Recipes/GetAll');
    }

    return this.http.get<RecipeModel[]>(environment.apiUrl + 'Recipes/GetAll?' + searchParams.toString());
  }

  getAllRecipesCreatedByUser(pickedTags: string[] | null = null, category: string | null = null){
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
      return this.http.get<RecipeModel[]>(environment.apiUrl + 'Recipes/GetAllCreatedByUser');
    }

    return this.http.get<RecipeModel[]>(environment.apiUrl + 'Recipes/GetAllCreatedByUser?' + searchParams.toString());
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

  getFavoritesTags() {
    return this.http.get<string[]>(environment.apiUrl + 'Recipes/FavoritesTags');
  }

  getAllTags() {
    return this.http.get<string[]>(environment.apiUrl + 'Recipes/AllTags');
  }

  getAllTagsCreatedByUser() {
    return this.http.get<string[]>(environment.apiUrl + 'Recipes/AllTagsCreatedByUser');
  }

  upsertRecipe(formData: FormData){
    return this.http.post(environment.apiUrl + "Recipes/UpsertWithImage", formData, {
      reportProgress: true,
      observe: 'events'
    });
  }

  likeToggle(recipeId: string): Observable<boolean>{
    return this.http.post<boolean>(environment.apiUrl + `Recipes/${recipeId}/likeToggle`, recipeId);
  }
}
