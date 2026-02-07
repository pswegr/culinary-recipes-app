import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, effect, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { NotificationModel, NotificationType } from '../models/notification.model';
import { AccountService } from './account.service';
import { AlertService } from './alert.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private readonly http = inject(HttpClient);
  private readonly accountService = inject(AccountService);
  private readonly alertService = inject(AlertService);

  readonly notifications = signal<NotificationModel[]>([]);
  readonly unreadCount = signal<number>(0);
  readonly isLoading = signal<boolean>(false);

  constructor() {
    effect(
      () => {
        const user = this.accountService.currentUser();

        if (!user?.token) {
          this.notifications.set([]);
          this.unreadCount.set(0);
          return;
        }

        void this.refreshUnreadCount();
      }
    );
  }

  async loadNotifications(unreadOnly: boolean = false, take: number = 50): Promise<void> {
    if (!this.accountService.currentUser()) {
      return;
    }

    this.isLoading.set(true);

    const params = new HttpParams()
      .set('unreadOnly', String(unreadOnly))
      .set('take', String(take));

    try {
      const response = await firstValueFrom(
        this.http.get<unknown[]>(`${environment.apiUrl}Notifications`, { params })
      );

      this.notifications.set((response ?? []).map((item) => this.normalizeNotification(item)));
      this.unreadCount.set(this.notifications().filter((item) => !item.isRead).length);
    } catch {
      this.alertService.openSnackBar('Unable to load notifications right now.');
    } finally {
      this.isLoading.set(false);
    }
  }

  async refreshUnreadCount(): Promise<void> {
    if (!this.accountService.currentUser()) {
      this.unreadCount.set(0);
      return;
    }

    try {
      const count = await firstValueFrom(
        this.http.get<number>(`${environment.apiUrl}Notifications/unread-count`)
      );

      this.unreadCount.set(count ?? 0);
    } catch {
      this.unreadCount.set(0);
    }
  }

  async markAsRead(notificationId: string): Promise<void> {
    if (!notificationId || !this.accountService.currentUser()) {
      return;
    }

    const wasUnread = this.notifications().some(
      (item) => item.id === notificationId && !item.isRead
    );

    try {
      await firstValueFrom(this.http.post(`${environment.apiUrl}Notifications/${notificationId}/read`, {}));
    } catch {
      this.alertService.openSnackBar('Could not mark notification as read.');
      return;
    }

    this.notifications.update((items) =>
      items.map((item) => (item.id === notificationId ? { ...item, isRead: true } : item))
    );

    if (wasUnread) {
      this.unreadCount.update((value) => (value > 0 ? value - 1 : 0));
    }
  }

  setUnreadCount(count: number): void {
    this.unreadCount.set(Math.max(0, count));
  }

  ingestRealtimeNotification(notification: unknown): void {
    const normalized = this.normalizeNotification(notification);
    const existing = this.notifications().find((item) => item.id === normalized.id);

    this.notifications.update((items) => {
      const withoutDuplicated = items.filter((item) => item.id !== normalized.id);
      return [normalized, ...withoutDuplicated].slice(0, 50);
    });

    if (!normalized.isRead && (!existing || existing.isRead)) {
      this.unreadCount.update((value) => value + 1);
    }
  }

  private normalizeNotification(rawNotification: unknown): NotificationModel {
    const raw = this.asObject(rawNotification);
    const payload = this.asObject(
      raw['payload'] ?? raw['data'] ?? raw['metadata'] ?? raw['details']
    );

    return {
      id: this.readString(raw, ['id', 'notificationId']) ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      type: this.readNumber(raw, ['type', 'notificationType']) ?? NotificationType.Action,
      title: this.readString(raw, ['title', 'subject']),
      message:
        this.readString(raw, ['message', 'content', 'text']) ??
        this.readString(payload, ['message', 'content', 'text']),
      isRead: this.readBoolean(raw, ['isRead', 'read']) ?? false,
      createdAt:
        this.readString(raw, ['createdAt', 'createdUtc', 'dateCreated']) ??
        this.readString(payload, ['createdAt']),
      recipientUserId:
        this.readString(raw, ['recipientUserId']) ?? this.readString(payload, ['recipientUserId']),
      senderUserId:
        this.readString(raw, ['senderUserId', 'fromUserId', 'requesterUserId']) ??
        this.readString(payload, ['senderUserId', 'fromUserId', 'requesterUserId']),
      conversationId:
        this.readString(raw, ['conversationId']) ?? this.readString(payload, ['conversationId']),
      requestId: this.readString(raw, ['requestId']) ?? this.readString(payload, ['requestId']),
      payload,
    };
  }

  private asObject(value: unknown): Record<string, unknown> {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      return value as Record<string, unknown>;
    }

    return {};
  }

  private readString(source: Record<string, unknown>, candidates: string[]): string | undefined {
    for (const key of candidates) {
      const value = source[key];
      if (typeof value === 'string' && value.trim().length > 0) {
        return value;
      }
    }

    return undefined;
  }

  private readNumber(source: Record<string, unknown>, candidates: string[]): number | undefined {
    for (const key of candidates) {
      const value = source[key];
      if (typeof value === 'number') {
        return value;
      }

      if (typeof value === 'string' && value.length > 0 && !Number.isNaN(Number(value))) {
        return Number(value);
      }
    }

    return undefined;
  }

  private readBoolean(source: Record<string, unknown>, candidates: string[]): boolean | undefined {
    for (const key of candidates) {
      const value = source[key];
      if (typeof value === 'boolean') {
        return value;
      }

      if (typeof value === 'string') {
        if (value.toLowerCase() === 'true') {
          return true;
        }

        if (value.toLowerCase() === 'false') {
          return false;
        }
      }
    }

    return undefined;
  }
}
