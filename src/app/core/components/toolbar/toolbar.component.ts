import { CdkConnectedOverlay } from '@angular/cdk/overlay';
import { Component, EventEmitter, Output } from '@angular/core';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { Router } from '@angular/router';
import { shareReplay } from 'rxjs';
import { AccountService } from 'src/app/shared/services/account.service';
import { RecipesService } from 'src/app/shared/services/recipes.service';
import { SearchBarService } from 'src/app/shared/services/search-bar.service';

@Component({
    selector: 'app-toolbar',
    templateUrl: './toolbar.component.html',
    styleUrls: ['./toolbar.component.scss'],
    standalone: false
})
export class ToolbarComponent {
  @Output() readonly darkModeSwitched = new EventEmitter<boolean>();
  categories$ = this.recipesService.getCategories().pipe(shareReplay());
  constructor(private recipesService: RecipesService, private router: Router, public accountService: AccountService){}
 
  onDarkModeSwithed({checked} : MatSlideToggleChange){
    this.darkModeSwitched.emit(checked);
  }

  navigateToCategory(category: string) {
    this.router.navigateByUrl(`recipes?category=${category}`);
  }

  /**
   * Check if the router url contains the specified route
   *
   * @param {string} route
   * @returns
   * @memberof ToolbarComponent
   */
  hasRoute(route: string) {
    return this.router.url.includes(route);
  }
}
