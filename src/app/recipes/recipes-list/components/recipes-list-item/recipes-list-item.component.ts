import { Component, Input, OnDestroy, WritableSignal} from '@angular/core';
import { Subject} from 'rxjs';
import { RecipeModel } from 'src/app/shared/models/recipe.model';
import { ThemeModeService } from 'src/app/shared/services/theme-mode.service';

@Component({
  selector: 'app-recipes-list-item',
  templateUrl: './recipes-list-item.component.html',
  styleUrls: ['./recipes-list-item.component.scss']
})
export class RecipesListItemComponent implements OnDestroy {
  @Input() recipe: RecipeModel | undefined;
  destroyed = new Subject<void>();
  isDark: WritableSignal<boolean> = this.themeModeService.isDark;

  constructor(private themeModeService: ThemeModeService){ }

  ngOnDestroy() {
    this.destroyed.next();
    this.destroyed.complete();
  }
}
