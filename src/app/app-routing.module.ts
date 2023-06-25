import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RecipesListComponent } from './recipes/recipes-list/recipes-list.component';
import { UpsertRecipeComponent } from './recipes/upsert-recipe/upsert-recipe.component';

const routes: Routes = [
  {path: 'upsert/:id', component: UpsertRecipeComponent, title: "Edit recipe"},
  {path: 'upsert', component: UpsertRecipeComponent, title: "Add recipe"},
  {path: 'recipes', component: RecipesListComponent, title: "Recipes"},
  {path: '', redirectTo: '/recipes', pathMatch: 'full'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
