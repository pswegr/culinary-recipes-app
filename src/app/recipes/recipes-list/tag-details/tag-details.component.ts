import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { filter, map, share, switchMap } from 'rxjs';
import { RecipesService } from '../../../shared/services/recipes.service';

@Component({
  selector: 'app-tag-details',
  templateUrl: './tag-details.component.html',
  styleUrls: ['./tag-details.component.scss']
})
export class TagDetailsComponent {
  tagName$ = this.route.params.pipe(filter(p => p['tag'] !== null), map(p => p['tag']));
  recipesByTag$ = this.tagName$.pipe(
    switchMap(tag => this.recipesService.getRecipes([tag])),
  ).pipe(share());

  constructor(private route: ActivatedRoute, private recipesService: RecipesService ) { }

}
