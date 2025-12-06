import { NgModule } from '@angular/core';
import { RecipesListComponent } from './recipes-list/recipes-list.component';
import { SharedModule } from '../shared/shared.module';
import { RecipesListItemComponent } from './recipes-list/components/recipes-list-item/recipes-list-item.component';
import { UpsertRecipeComponent } from './upsert-recipe/upsert-recipe.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FileInputComponent } from './upsert-recipe/custom-controls/file-input/file-input.component';
import { RecipesAllListComponent } from './recipes-list/recipes-all-list/recipes-all-list.component';
import { RecipeComponent } from './recipe/recipe.component';
import { RecipesRoutingModule } from './recipes-routing.module';
import { TagDetailsComponent } from './recipes-list/tag-details/tag-details.component';
import { NgOptimizedImage } from '@angular/common';
import { CategoryDetailsComponent } from './recipes-list/category-details/category-details.component';
import { RecipeCartComponent } from './components/recipe-cart/recipe-cart.component';
import { YourRecipesListComponent } from './recipes-list/your-recipes-list/your-recipes-list.component';
import { OverlayModule } from '@angular/cdk/overlay';
import { SearchOverlayComponent } from './recipes-list/components/search-overlay/search-overlay.component';
import { FavoritesListComponent } from './recipes-list/favorites-list/favorites-list.component';
import { MainRecipesListComponent } from './recipes-list/main-recipes-list/main-recipes-list.component';



@NgModule({
  declarations: [
    RecipesListComponent,
    RecipesListItemComponent,
    MainRecipesListComponent,
    UpsertRecipeComponent,
    FileInputComponent,
    RecipesAllListComponent,
    RecipeComponent,
    TagDetailsComponent,
    CategoryDetailsComponent,
    RecipeCartComponent,
    YourRecipesListComponent,
    SearchOverlayComponent,
    FavoritesListComponent
  ],
  imports: [
    RecipesRoutingModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    NgOptimizedImage,
    OverlayModule,
  ]
})
export class RecipesModule { }
