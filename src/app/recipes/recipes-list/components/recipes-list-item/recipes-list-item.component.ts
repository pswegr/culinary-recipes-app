import {BreakpointObserver, Breakpoints} from '@angular/cdk/layout';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subject, of, takeUntil } from 'rxjs';
import { RecipeModel } from 'src/app/shared/models/recipe.model';
import { ThemeModeService } from 'src/app/shared/services/theme-mode.service';

@Component({
  selector: 'app-recipes-list-item',
  templateUrl: './recipes-list-item.component.html',
  styleUrls: ['./recipes-list-item.component.scss']
})
export class RecipesListItemComponent implements OnDestroy, OnInit {
  @Input() recipe: RecipeModel | undefined;
  destroyed = new Subject<void>();
  isHandsetPortrait: boolean = false;
  isDarkMode: boolean = true;

  constructor(breakpointObserver: BreakpointObserver, private themeModeService: ThemeModeService) {
    breakpointObserver
      .observe([
        Breakpoints.HandsetPortrait
      ])
      .subscribe(result => {
        const breakpoints = result.breakpoints;

        if(breakpoints[Breakpoints.HandsetPortrait]){
          this.isHandsetPortrait = true;
        }
        else{
          this.isHandsetPortrait = false;
        }
      });
  }

  ngOnInit(): void {
    this.themeModeService.isDarkMode$.subscribe(isDark => this.isDarkMode = isDark);
  }

  ngOnDestroy() {
    this.destroyed.next();
    this.destroyed.complete();
  }
}
