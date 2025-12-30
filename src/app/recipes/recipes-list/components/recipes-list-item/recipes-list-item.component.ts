import { animate, state, style, transition, trigger } from '@angular/animations';
import { provideCloudinaryLoader } from '@angular/common';
import { Component, EventEmitter, Input, OnDestroy, Output, signal, Signal, WritableSignal } from '@angular/core';
import { Router } from '@angular/router';
import { Subject} from 'rxjs';
import { RecipeModel } from 'src/app/shared/models/recipe.model';
import { AccountService } from 'src/app/shared/services/account.service';
import { ThemeModeService } from 'src/app/shared/services/theme-mode.service';

@Component({
    selector: 'app-recipes-list-item',
    templateUrl: './recipes-list-item.component.html',
    styleUrls: ['./recipes-list-item.component.scss'],
    animations: [
        trigger('likeToggle', [
            state('liked', style({
                opacity: 1,
                color: 'red',
            })),
            state('unliked', style({
                opacity: 0.8,
                color: 'inherit',
            })),
            transition('liked => unliked', [animate('3s')]),
            transition('unliked => liked', [animate('2s')])
        ]),
    ],
    standalone: false
})
export class RecipesListItemComponent implements OnDestroy {
  @Input() recipe: RecipeModel | undefined;
  @Output() tag: EventEmitter<string> = new EventEmitter<string>();
  @Output() likeToggleClicked: EventEmitter<string> = new EventEmitter<string>();
  destroyed = new Subject<void>();
  isDark: Signal<boolean> = this.themeModeService.isDark;
  
  showDetails: WritableSignal<boolean> = signal(false);

  constructor(private themeModeService: ThemeModeService, private router: Router, private accountService: AccountService){ }

  ngOnDestroy() {
    this.destroyed.next();
    this.destroyed.complete();
  }

  navigateToDetails(event: MouseEvent){
    this.router.navigateByUrl(`recipes/details/${event}`)
  }

  navigateToDetailsBtnClicked(event: string){
    this.router.navigateByUrl(`recipes/details/${event}`)
  }

  clickTagOnItem(event: string){
    this.tag.emit(event);
  }

  onLike(recipeId: string){
    this.likeToggleClicked.emit(recipeId);
  }

  isLiked(likedByUsers: string[]) {
    const userId = this.accountService.currentUser()?.userId;
    if(userId) {
      return  likedByUsers.includes(userId);
    }

    return false;
  }

  protected updateDisplayDetails() {
    this.showDetails.update(s => !s);
  }
}
