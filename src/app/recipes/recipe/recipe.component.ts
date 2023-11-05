import { Component, Signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { filter, map, share, switchMap } from 'rxjs';
import { RecipesService } from '../../shared/services/recipes.service';
import { ThemeModeService } from 'src/app/shared/services/theme-mode.service';

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
  ).pipe(share());

  constructor(private route: ActivatedRoute, private recipesService: RecipesService, private themeModeService: ThemeModeService, private router: Router) { }

  chipClicked(event: string){
    this.router.navigateByUrl(`recipes/tag/${event}`)
  }


}
