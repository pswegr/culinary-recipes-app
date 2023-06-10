import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RecipesListComponent } from './recipes-list/recipes-list.component';
import { SharedModule } from '../shared/shared.module';
import { RecipesListItemComponent } from './recipes-list/components/recipes-list-item/recipes-list-item.component';



@NgModule({
  declarations: [
    RecipesListComponent,
    RecipesListItemComponent
  ],
  imports: [
    CommonModule,
    SharedModule
  ]
})
export class RecipesModule { }
