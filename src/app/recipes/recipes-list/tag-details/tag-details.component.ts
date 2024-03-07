import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { filter, map, share, switchMap, tap } from 'rxjs';
import { RecipesService } from '../../../shared/services/recipes.service';
import { Meta, Title } from '@angular/platform-browser';

@Component({
  selector: 'app-tag-details',
  templateUrl: './tag-details.component.html',
  styleUrls: ['./tag-details.component.scss']
})
export class TagDetailsComponent {
  tagName$ = this.route.params.pipe(filter(p => p['tag'] !== null), map(p => p['tag']));
  recipesByTag$ = this.tagName$.pipe(
    tap(tag => {
      this.titleService.setTitle(`${tag} - Recipes with Passion / ${tag} przepisy`);
      this.metaService.updateTag({name: 'decription', content: `Culinary recipes with tag: ${tag} / Przepisy kulinarne otagowane: ${tag}`})
    }),
    switchMap(tag => this.recipesService.getRecipes([tag])),
  ).pipe(share());

  constructor(private route: ActivatedRoute, private recipesService: RecipesService, private titleService: Title, private metaService: Meta ) { }

}
