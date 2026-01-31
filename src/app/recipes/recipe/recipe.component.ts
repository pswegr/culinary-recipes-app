import { Component, Signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, combineLatest, filter, map, share, switchMap, tap } from 'rxjs';
import { RecipesService } from '../../shared/services/recipes.service';
import { ThemeModeService } from 'src/app/shared/services/theme-mode.service';
import { Meta, Title } from '@angular/platform-browser';

@Component({
    selector: 'app-recipe',
    templateUrl: './recipe.component.html',
    styleUrls: ['./recipe.component.scss'],
    standalone: false
})
export class RecipeComponent {
  isDark: Signal<boolean> = this.themeModeService.isDark;
  refreshToken: BehaviorSubject<null> = new BehaviorSubject(null);
  recipe$ = combineLatest([this.refreshToken, this.route.params]).pipe(
    filter(p => p[1]['recipeId'] !== null),
    map(p => p[1]['recipeId']),
    switchMap(recipeId => this.recipesService.getRecipe(recipeId)),
    tap(recipe => {
      this.titleService.setTitle(`${recipe.title} - Netreci - Recipes with Passion / przepisy kulinarne`);
      this.metaService.updateTag({ name: 'decription', content: `${recipe.title} - ${recipe.description} - Netreci - Recipes with Passion` })
    })
  ).pipe(share());

  constructor(private route: ActivatedRoute, private recipesService: RecipesService, private themeModeService: ThemeModeService, private titleService: Title, private metaService: Meta) { }

  onLikeToggle(recipeId: string) {
    this.recipesService.likeToggle(recipeId).subscribe(
      x => this.refreshToken.next(null)
    );
  }
}
