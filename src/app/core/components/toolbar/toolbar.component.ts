import { Component, EventEmitter, Output, inject } from '@angular/core';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { Router } from '@angular/router';
import { shareReplay } from 'rxjs';
import { NotificationModel } from 'src/app/shared/models/notification.model';
import { AccountService } from 'src/app/shared/services/account.service';
import { MessagingService } from 'src/app/shared/services/messaging.service';
import { NotificationService } from 'src/app/shared/services/notification.service';
import { RecipesService } from 'src/app/shared/services/recipes.service';

@Component({
    selector: 'app-toolbar',
    templateUrl: './toolbar.component.html',
    styleUrls: ['./toolbar.component.scss'],
    standalone: false
})
export class ToolbarComponent {
  @Output() readonly darkModeSwitched = new EventEmitter<boolean>();

  private readonly recipesService = inject(RecipesService);
  private readonly router = inject(Router);

  readonly accountService = inject(AccountService);
  readonly notificationService = inject(NotificationService);
  readonly messagingService = inject(MessagingService);

  readonly categories$ = this.recipesService.getCategories().pipe(shareReplay(1));

  onDarkModeSwithed({ checked }: MatSlideToggleChange): void {
    this.darkModeSwitched.emit(checked);
  }

  navigateToCategory(category: string): void {
    this.router.navigateByUrl(`recipes?category=${category}`);
  }

  hasRoute(route: string): boolean {
    return this.router.url.includes(route);
  }

  openMessenger(): void {
    this.messagingService.openWidget();
  }

  loadNotifications(): void {
    void this.notificationService.loadNotifications(false, 50);
  }

  markAsRead(notification: NotificationModel): void {
    if (notification.isRead) {
      return;
    }

    void this.notificationService.markAsRead(notification.id);
  }

  openNotification(notification: NotificationModel): void {
    void this.notificationService.markAsRead(notification.id);
    void this.messagingService.openFromNotification(notification);
  }

  notificationLabel(notification: NotificationModel): string {
    return this.messagingService.formatNotificationLabel(notification);
  }

  trackByNotification(index: number, notification: NotificationModel): string {
    return notification.id;
  }
}
