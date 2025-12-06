import { Component } from '@angular/core';
import { RecipesListComponent } from '../recipes-list.component';

@Component({
  selector: 'app-main-recipes-list',
  templateUrl: '../recipes-list.component.html',
  styleUrl: '../recipes-list.component.scss',
  standalone: false
})
export class MainRecipesListComponent extends RecipesListComponent {
}
