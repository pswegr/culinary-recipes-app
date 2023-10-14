import { NgModule } from '@angular/core';
import { RecipesListComponent } from './recipes-list/recipes-list.component';
import { SharedModule } from '../shared/shared.module';
import { RecipesListItemComponent } from './recipes-list/components/recipes-list-item/recipes-list-item.component';
import { UpsertRecipeComponent } from './upsert-recipe/upsert-recipe.component';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { FileInputComponent } from './upsert-recipe/custom-controls/file-input/file-input.component';
import { RecipesAllListComponent } from './recipes-list/recipes-all-list/recipes-all-list.component';



@NgModule({
  declarations: [
    RecipesListComponent,
    RecipesListItemComponent,
    UpsertRecipeComponent,
    FileInputComponent,
    RecipesAllListComponent
  ],
  imports: [
    SharedModule,
    RouterModule,
    FormsModule
  ]
})
export class RecipesModule { }
