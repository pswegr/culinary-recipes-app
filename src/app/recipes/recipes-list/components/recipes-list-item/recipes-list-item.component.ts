import {BreakpointObserver, Breakpoints} from '@angular/cdk/layout';
import { Component, Input, OnDestroy } from '@angular/core';
import { Observable, Subject, of, takeUntil } from 'rxjs';
import { RecipeModel } from 'src/app/shared/models/recipe.model';

@Component({
  selector: 'app-recipes-list-item',
  templateUrl: './recipes-list-item.component.html',
  styleUrls: ['./recipes-list-item.component.scss']
})
export class RecipesListItemComponent implements OnDestroy {
  @Input() recipe: RecipeModel | undefined; 
  destroyed = new Subject<void>();
  isHandsetPortrait: boolean = false;

  // Create a map to display breakpoint names for demonstration purposes.
  displayNameMap = new Map([
    [Breakpoints.XSmall, 'XSmall'],
    [Breakpoints.Small, 'Small'],
    [Breakpoints.Medium, 'Medium'],
    [Breakpoints.Large, 'Large'],
    [Breakpoints.XLarge, 'XLarge'],
  ]);

  constructor(breakpointObserver: BreakpointObserver) {
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

  ngOnDestroy() {
    this.destroyed.next();
    this.destroyed.complete();
  }
}
