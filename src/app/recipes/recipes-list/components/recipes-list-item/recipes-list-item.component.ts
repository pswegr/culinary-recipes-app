import { Component, Input, OnDestroy} from '@angular/core';
import { Subject} from 'rxjs';
import { RecipeModel } from 'src/app/shared/models/recipe.model';

@Component({
  selector: 'app-recipes-list-item',
  templateUrl: './recipes-list-item.component.html',
  styleUrls: ['./recipes-list-item.component.scss']
})
export class RecipesListItemComponent implements OnDestroy {
  @Input() recipe: RecipeModel | undefined;
  destroyed = new Subject<void>();

  ngOnDestroy() {
    this.destroyed.next();
    this.destroyed.complete();
  }
}
