import { Component } from '@angular/core';
import { RecipesListComponent } from '../recipes-list.component';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs';

@Component({
    selector: 'app-tag-details',
    templateUrl: '../recipes-list.component.html',
    styleUrls: ['../recipes-list.component.scss'],
    standalone: false
})
export class TagDetailsComponent extends RecipesListComponent {
   override title = `tag: ${toSignal(this.route.params.pipe(filter(p => p['tag'] !== null), map(p => p['tag'])))()}`;
}
