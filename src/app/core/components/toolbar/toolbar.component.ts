import { Component, EventEmitter, Output } from '@angular/core';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { shareReplay } from 'rxjs';
import { LoadingService } from 'src/app/shared/services/loading.service';
import { RecipesService } from 'src/app/shared/services/recipes.service';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss']
})
export class ToolbarComponent {
  @Output() readonly darkModeSwitched = new EventEmitter<boolean>();
  categories$ = this.recipesService.getCategories().pipe(shareReplay());
  loadCategories$ = this.loadingService.showLoaderUntilCompleted(this.categories$);
  constructor(private recipesService: RecipesService, private loadingService: LoadingService){}

  onDarkModeSwithed({checked} : MatSlideToggleChange){
    this.darkModeSwitched.emit(checked);
  }
}
