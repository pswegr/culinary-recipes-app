import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { filter, map, share, switchMap } from 'rxjs';
import { RecipesService } from 'src/app/shared/services/recipes.service';

@Component({
  selector: 'app-category-details',
  templateUrl: './category-details.component.html',
  styleUrls: ['./category-details.component.scss']
})
export class CategoryDetailsComponent {
  categoryName$ = this.route.params.pipe(filter(p => p['category'] !== null), map(p => p['category']));
  recipesByCategory$ = this.categoryName$.pipe(
    switchMap(category => this.recipesService.getRecipes(undefined, category)),
  ).pipe(share());

  constructor(private route: ActivatedRoute, private recipesService: RecipesService) { }
}
