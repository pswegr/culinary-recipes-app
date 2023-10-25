import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RecipesListComponent } from './recipes/recipes-list/recipes-list.component';
import { UpsertRecipeComponent } from './recipes/upsert-recipe/upsert-recipe.component';
import { RecipesAllListComponent } from './recipes/recipes-list/recipes-all-list/recipes-all-list.component';
import { TermsComponent } from './terms/terms.component';

const routes: Routes = [
  {path: 'upsert/:id', component: UpsertRecipeComponent, title: "Edit recipe"},
  {path: 'upsert', component: UpsertRecipeComponent, title: "Add recipe"},
  {path: 'recipes', component: RecipesListComponent, title: "Recipes"},
  {path: 'all-recipes', component: RecipesAllListComponent, title: "AllRecipes"},
  {path: 'policy-and-terms', component: TermsComponent, title: "Policy & terms"},
  {path: '', redirectTo: '/recipes', pathMatch: 'full'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {useHash: true})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
