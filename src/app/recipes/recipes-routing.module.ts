import { RouterModule, Routes } from "@angular/router";
import { RecipesListComponent } from "./recipes-list/recipes-list.component";
import { RecipeComponent } from "./recipe/recipe.component";
import { UpsertRecipeComponent } from "./upsert-recipe/upsert-recipe.component";
import { NgModule } from "@angular/core";
import { RecipesAllListComponent } from "./recipes-list/recipes-all-list/recipes-all-list.component";
import { TagDetailsComponent } from "./recipes-list/tag-details/tag-details.component";
import { CategoryDetailsComponent } from "./recipes-list/category-details/category-details.component";
import { authGuard } from "../core/guards/auth.guard";
import { YourRecipesListComponent } from "./recipes-list/your-recipes-list/your-recipes-list.component";
import { adminGuard } from "../core/guards/admin.guard";
import { FavoritesListComponent } from "./recipes-list/favorites-list/favorites-list.component";

const routes: Routes = [
  {
    path: '',
    component: RecipesListComponent,
    title: 'Netreci - Recipes with Passion',
    pathMatch: 'full'
  },
  {
    path: 'favorites',
    component: FavoritesListComponent,
    title: 'favorites - Netreci - Recipes with Passion',
    canActivate: [authGuard]
  },
  {
    path: 'details/:recipeId',
    component: RecipeComponent,
    title: 'Recipe detail',
  },
  { 
    path: 'upsert/:recipeId',
    component: UpsertRecipeComponent, 
    title: "Edit recipe" 
  },
  { 
    path: 'upsert', 
    component: UpsertRecipeComponent, 
    title: "Add recipe",
    canActivate: [authGuard]
  },
  {
    path: 'all',
    component: RecipesAllListComponent, 
    title: "All Recipes",
    canActivate: [adminGuard]
  },
  {
    path: 'yours',
    component: YourRecipesListComponent, 
    title: "Your recipes",
    canActivate: [authGuard]
  },
  {
    path: 'tag/:tag',
    component: TagDetailsComponent, 
    title: "Tag details"
  },
  {
    path: 'category/:category',
    component: CategoryDetailsComponent, 
    title: "Category details"
  }
]

@NgModule({
  imports: [
      RouterModule.forChild(routes)
  ],
  exports: [RouterModule]
})
export class RecipesRoutingModule {

}