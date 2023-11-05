import { Component, EventEmitter, Output } from '@angular/core';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { RecipesService } from 'src/app/shared/services/recipes.service';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss']
})
export class ToolbarComponent {
  @Output() readonly darkModeSwitched = new EventEmitter<boolean>();
  categories$ = this.recipesService.getCategories();

  constructor(private recipesService: RecipesService){}

  onDarkModeSwithed({checked} : MatSlideToggleChange){
    this.darkModeSwitched.emit(checked);
  }
}
