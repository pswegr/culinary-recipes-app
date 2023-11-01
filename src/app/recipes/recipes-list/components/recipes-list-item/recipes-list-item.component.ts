import { Component, EventEmitter, Input, OnDestroy, Output, Signal, WritableSignal} from '@angular/core';
import { Router } from '@angular/router';
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
  @Output() tag: EventEmitter<string> = new EventEmitter<string>();
  destroyed = new Subject<void>();
  isDark: Signal<boolean> = this.themeModeService.isDark;

  constructor(private themeModeService: ThemeModeService, private router: Router){ }

  ngOnDestroy() {
    this.destroyed.next();
    this.destroyed.complete();
  }

  navigateToDetails(event: MouseEvent){
    this.router.navigateByUrl(`recipes/details/${event}`)
  }

  clickTagOnItem(event: string){
    this.router.navigateByUrl(`recipes/tag/${event}`)
  }
}
