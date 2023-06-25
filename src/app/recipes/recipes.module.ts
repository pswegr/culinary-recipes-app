import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RecipesListComponent } from './recipes-list/recipes-list.component';
import { SharedModule } from '../shared/shared.module';
import { RecipesListItemComponent } from './recipes-list/components/recipes-list-item/recipes-list-item.component';
import { UpsertRecipeComponent } from './upsert-recipe/upsert-recipe.component';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UploadPhotoComponent } from './upsert-recipe/components/upload-photo/upload-photo.component';



@NgModule({
  declarations: [
    RecipesListComponent,
    RecipesListItemComponent,
    UpsertRecipeComponent,
    UploadPhotoComponent
  ],
  imports: [
    SharedModule,
    RouterModule,
    FormsModule
  ]
})
export class RecipesModule { }
