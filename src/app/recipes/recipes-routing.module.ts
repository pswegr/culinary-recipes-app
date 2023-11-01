import { RouterModule, Routes } from "@angular/router";
import { RecipesListComponent } from "./recipes-list/recipes-list.component";
import { RecipeComponent } from "./recipe/recipe.component";
import { UpsertRecipeComponent } from "./upsert-recipe/upsert-recipe.component";
import { NgModule } from "@angular/core";
import { RecipesAllListComponent } from "./recipes-list/recipes-all-list/recipes-all-list.component";
import { TagDetailsComponent } from "./recipes-list/tag-details/tag-details.component";

const routes: Routes = [
  {
    path: '',
    component: RecipesListComponent,
    title: 'Recipes with passion',
    pathMatch: 'full'
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
    title: "Add recipe" 
  },
  {
    path: 'all',
    component: RecipesAllListComponent, 
    title: "All Recipes"
  },
  {
    path: 'tag/:tag',
    component: TagDetailsComponent, 
    title: "All Recipes"
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