import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RecipesAllListComponent } from './recipes/recipes-list/recipes-all-list/recipes-all-list.component';
import { TermsComponent } from './terms/terms.component';
import { RecipeComponent } from './recipes/recipe/recipe.component';
import { PageNotFoundComponent } from './shared/components/page-not-found/page-not-found.component';

const routes: Routes = [
  {path: '', redirectTo: '/recipes', pathMatch: 'full'},
  {
    path: 'recipes', 
    loadChildren: () => import('./recipes/recipes.module').then(m => m.RecipesModule),
    data: {
      preload: false
    }
  },
  {path: 'policy-and-terms', component: TermsComponent, title: "Policy & terms"},
  {path: '**', pathMatch: 'full', component: PageNotFoundComponent, title: 'Page not found' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {useHash: true})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
