import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, EventEmitter, Input, Output, Signal } from '@angular/core';
import { Router } from '@angular/router';
import { RecipeModel } from 'src/app/shared/models/recipe.model';
import { AccountService } from 'src/app/shared/services/account.service';
import { ThemeModeService } from 'src/app/shared/services/theme-mode.service';

@Component({
  selector: 'app-recipe-cart',
  templateUrl: './recipe-cart.component.html',
  styleUrl: './recipe-cart.component.scss',
  animations: [
    trigger('likeToggle', [
      state(
        'liked',
        style({
          opacity: 1,
          color: 'red',
        }),
      ),
      state(
        'unliked',
        style({
          opacity: 0.8,
          color: 'inherit',
        }),
      ),
      transition('liked => unliked', [animate('3s', style({transform: 'scale(0.5)', opacity: 1, position: 'absolute'}))]),
      transition('unliked => liked', [animate('2s', style({transform: 'scale(1.5)', opacity: 1, position: 'absolute'}))])
    ]),
  ],
})
export class RecipeCartComponent {
  @Input() recipe! : RecipeModel;
  @Output() likeToggleClicked: EventEmitter<string> = new EventEmitter<string>();
  
  isDark: Signal<boolean> = this.themeModeService.isDark;
  
  constructor(private router: Router, private themeModeService: ThemeModeService, private accountService: AccountService){}

  chipClicked(event: string){
    this.router.navigateByUrl(`recipes/tag/${event}`)
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
}
