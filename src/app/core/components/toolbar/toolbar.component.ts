import { Component, EventEmitter, Output } from '@angular/core';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { Router } from '@angular/router';
import { shareReplay } from 'rxjs';
import { AccountService } from 'src/app/shared/services/account.service';
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
  constructor(private recipesService: RecipesService, private router: Router, public accountService: AccountService){}

  onDarkModeSwithed({checked} : MatSlideToggleChange){
    this.darkModeSwitched.emit(checked);
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
