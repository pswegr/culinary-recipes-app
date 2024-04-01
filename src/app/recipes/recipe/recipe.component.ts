import { Component, Signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { filter, map, share, switchMap, tap } from 'rxjs';
import { RecipesService } from '../../shared/services/recipes.service';
import { ThemeModeService } from 'src/app/shared/services/theme-mode.service';
import { LoadingService } from 'src/app/shared/services/loading.service';
import { Meta, Title } from '@angular/platform-browser';

@Component({
  selector: 'app-recipe',
  templateUrl: './recipe.component.html',
  styleUrls: ['./recipe.component.scss']
})
export class RecipeComponent {
  isDark: Signal<boolean> = this.themeModeService.isDark;
  recipe$ = this.route.params.pipe(
    filter(p => p['recipeId'] !== null),
    map(p => p['recipeId']),
    switchMap(recipeId => this.recipesService.getRecipe(recipeId)),
    tap(recipe => {
      this.titleService.setTitle(`${recipe.title} - Recipes with Passion / przepisy kulinarne`);
      this.metaService.updateTag({ name: 'decription', content: `${recipe.title} - ${recipe.description} - Recipes with Passion` })
    })
  ).pipe(share());

  constructor(private route: ActivatedRoute, private recipesService: RecipesService, private themeModeService: ThemeModeService, private titleService: Title, private metaService: Meta) { }
}
