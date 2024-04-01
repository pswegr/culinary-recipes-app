import { Component, Input, Signal } from '@angular/core';
import { Router } from '@angular/router';
import { RecipeModel } from 'src/app/shared/models/recipe.model';
import { ThemeModeService } from 'src/app/shared/services/theme-mode.service';

@Component({
  selector: 'app-recipe-cart',
  templateUrl: './recipe-cart.component.html',
  styleUrl: './recipe-cart.component.scss'
})
export class RecipeCartComponent {
  @Input() recipe! : RecipeModel;
  isDark: Signal<boolean> = this.themeModeService.isDark;
  
  constructor(private router: Router, private themeModeService: ThemeModeService){}

  chipClicked(event: string){
    this.router.navigateByUrl(`recipes/tag/${event}`)
  }
}
