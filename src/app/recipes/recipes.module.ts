import { NgModule } from '@angular/core';
import { RecipesListComponent } from './recipes-list/recipes-list.component';
import { SharedModule } from '../shared/shared.module';
import { RecipesListItemComponent } from './recipes-list/components/recipes-list-item/recipes-list-item.component';
import { UpsertRecipeComponent } from './upsert-recipe/upsert-recipe.component';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FileInputComponent } from './upsert-recipe/custom-controls/file-input/file-input.component';
import { RecipesAllListComponent } from './recipes-list/recipes-all-list/recipes-all-list.component';
import { RecipeComponent } from './recipe/recipe.component';
import { RecipesRoutingModule } from './recipes-routing.module';
import { TagDetailsComponent } from './recipes-list/tag-details/tag-details.component';



@NgModule({
  declarations: [
    RecipesListComponent,
    RecipesListItemComponent,
    UpsertRecipeComponent,
    FileInputComponent,
    RecipesAllListComponent,
    RecipeComponent,
    TagDetailsComponent
  ],
  imports: [
    RecipesRoutingModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class RecipesModule { }
