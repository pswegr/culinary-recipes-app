import { Component } from '@angular/core';
import { filter, map } from 'rxjs';
import { RecipesListComponent } from '../recipes-list.component';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-category-details',
  templateUrl: '../recipes-list.component.html',
  styleUrls: ['../recipes-list.component.scss'],
  standalone: false
})
export class CategoryDetailsComponent extends RecipesListComponent {
  override title = `category: ${toSignal(this.route.params.pipe(filter(p => p['category'] !== null), map(p => p['category'])))()}`;
}
