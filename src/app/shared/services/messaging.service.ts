import { HttpClient, HttpParams } from '@angular/common/http';
import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from 'src/environments/environment';
import {
  ChatMessageModel,
  ConversationModel,
  CreateMessageRequestModel,
  MessageRequestModel,
  MessageRequestStatus,
  MessagingHandshakeModel,
  RespondMessageRequestModel,
  SendMessageModel,
} from '../models/messaging.model';
import { NotificationModel, NotificationType } from '../models/notification.model';
import { AccountService } from './account.service';
import { AlertService } from './alert.service';
import { NotificationService } from './notification.service';
import { I18nService } from './i18n.service';
import {
  HubConnection,
  HubConnectionBuilder,
  HubConnectionState,
  IHttpConnectionOptions,
  LogLevel,
} from '@microsoft/signalr';

interface WidgetPosition {
  x: number;
  y: number;
}

@Injectable({
  providedIn: 'root'
})
export class MessagingService {
  private readonly http = inject(HttpClient);
  private readonly accountService = inject(AccountService);
  private readonly alertService = inject(AlertService);
  private readonly notificationService = inject(NotificationService);
  private readonly i18nService = inject(I18nService);

  private connection: HubConnection | null = null;
  private connectPromise: Promise<boolean> | null = null;
  private bootstrapPromise: Promise<void> | null = null;
  private liveSyncIntervalId: ReturnType<typeof setInterval> | null = null;

  private readonly sentRequestsByRecipient = signal<Record<string, boolean>>({});

  readonly widgetOpen = signal<boolean>(false);
  readonly widgetPinned = signal<boolean>(true);
  readonly widgetPosition = signal<WidgetPosition>({ x: 0, y: 0 });

  readonly recipientDraft = signal<string>('');
  readonly recipientLabel = signal<string>('');
  readonly messageDraft = signal<string>('');

  readonly isConnecting = signal<boolean>(false);
  readonly isConnected = signal<boolean>(false);
  readonly handshakeInProgress = signal<boolean>(false);
  readonly handshake = signal<MessagingHandshakeModel | null>(null);

  readonly loadingConversations = signal<boolean>(false);
  readonly loadingMessages = signal<boolean>(false);

  readonly conversations = signal<ConversationModel[]>([]);
  readonly messagesByConversation = signal<Record<string, ChatMessageModel[]>>({});
  readonly activeConversationId = signal<string | null>(null);
  readonly incomingRequests = signal<MessageRequestModel[]>([]);

  readonly currentUserId = computed(() => this.accountService.currentUser()?.userId ?? '');

  readonly activeConversation = computed(() => {
    const activeConversationId = this.activeConversationId();
    if (!activeConversationId) {
      return null;
    }

    return this.conversations().find((item) => item.id === activeConversationId) ?? null;
  });

  readonly activeMessages = computed(() => {
    const activeConversationId = this.activeConversationId();
    if (!activeConversationId) {
      return [] as ChatMessageModel[];
    }

    return this.messagesByConversation()[activeConversationId] ?? [];
  });

  readonly isRequestPendingForRecipient = computed(() => {
    const recipient = this.recipientDraft().trim();
    if (!recipient) {
      return false;
    }

    return this.sentRequestsByRecipient()[recipient] ?? false;
  });

  readonly canWriteToRecipient = computed(() => {
    return (
      this.accountService.currentUser() !== null &&
      this.isConnected() &&
      this.handshake() !== null &&
      this.activeConversation() !== null
    );
  });

  constructor() {
    effect(
      () => {
        const user = this.accountService.currentUser();

        if (!user?.token) {
          this.resetState();
          this.stopLiveSync();
          void this.disconnect();
          return;
        }

        void this.bootstrapAuthorizedSession();
      }
    );

    effect(() => {
      const isAuthorized = this.accountService.currentUser() !== null;
      const isWidgetOpen = this.widgetOpen();

      if (!isAuthorized || !isWidgetOpen) {
        this.stopLiveSync();
        return;
      }

      this.startLiveSync();
    });
  }

  openWidget(recipientUserId?: string, recipientLabel?: string): void {
    this.widgetOpen.set(true);
    void this.refreshIncomingRequests();

    if (recipientUserId) {
      this.recipientDraft.set(recipientUserId);
      this.recipientLabel.set(recipientLabel ?? recipientUserId);
      void this.prepareConversation(recipientUserId);
      return;
    }

    void this.bootstrapAuthorizedSession();

    const activeConversationId = this.activeConversationId();
    if (activeConversationId) {
      void this.loadMessages(activeConversationId, 0, 50, false);
    }
  }

  closeWidget(): void {
    this.widgetOpen.set(false);
  }

  toggleWidgetPinned(): void {
    const pinned = this.widgetPinned();
    this.widgetPinned.set(!pinned);

    if (!pinned) {
      this.widgetPosition.set({ x: 0, y: 0 });
    }
  }

  updateWidgetPosition(position: WidgetPosition): void {
    this.widgetPosition.set(position);
  }

  async prepareConversation(recipientUserId: string): Promise<void> {
    const trimmedRecipient = recipientUserId.trim();

    if (!trimmedRecipient) {
      return;
    }

    this.recipientDraft.set(trimmedRecipient);

    await this.bootstrapAuthorizedSession();

    const existingConversation = this.findConversationWithRecipient(trimmedRecipient);

    if (existingConversation) {
      await this.selectConversation(existingConversation.id);
      return;
    }

    this.activeConversationId.set(null);
  }

  async selectConversation(conversationId: string): Promise<void> {
    if (!conversationId) {
      return;
    }

    this.activeConversationId.set(conversationId);

    const conversation = this.conversations().find((item) => item.id === conversationId);
    if (conversation) {
      this.recipientDraft.set(this.resolveConversationPeer(conversation));
      this.recipientLabel.set(this.resolveConversationPeer(conversation));
    }

    if ((this.messagesByConversation()[conversationId] ?? []).length > 0) {
      return;
    }

    await this.loadMessages(conversationId);
  }

  async refreshConversations(silent: boolean = false): Promise<void> {
    if (!this.accountService.currentUser()) {
      this.conversations.set([]);
      return;
    }

    this.loadingConversations.set(true);

    try {
      const response = await firstValueFrom(
        this.http.get<ConversationModel[]>(`${environment.apiUrl}Messaging/conversations`)
      );

      const conversations = (response ?? []).sort((left, right) => {
        const leftTime = left.lastMessageAt ? new Date(left.lastMessageAt).getTime() : 0;
        const rightTime = right.lastMessageAt ? new Date(right.lastMessageAt).getTime() : 0;
        return rightTime - leftTime;
      });

      this.conversations.set(conversations);
    } catch {
      if (!silent) {
        this.alertService.openSnackBar(this.i18nService.translate('messenger.errors.unableLoadConversations'));
      }
    } finally {
      this.loadingConversations.set(false);
    }
  }

  async refreshIncomingRequests(silent: boolean = false): Promise<void> {
    if (!this.accountService.currentUser()) {
      this.incomingRequests.set([]);
      return;
    }

    try {
      const response = await firstValueFrom(
        this.http.get<unknown[]>(`${environment.apiUrl}Messaging/requests/pending`)
      );

      const currentUserId = this.currentUserId();
      const requests = (response ?? [])
        .map((item) => this.normalizeRequest(item))
        .filter((request) => {
          if (request.status !== MessageRequestStatus.Pending) {
            return false;
          }

          if (!currentUserId) {
            return true;
          }

          return request.recipientUserId === currentUserId;
        })
        .sort((left, right) => {
          const leftTime = left.createdAt ? new Date(left.createdAt).getTime() : 0;
          const rightTime = right.createdAt ? new Date(right.createdAt).getTime() : 0;
          return rightTime - leftTime;
        });

      this.incomingRequests.set(requests);
    } catch {
      if (!silent) {
        this.alertService.openSnackBar(
          this.i18nService.translate('messenger.errors.unableLoadRequests')
        );
      }
    }
  }

  async loadMessages(
    conversationId: string,
    skip: number = 0,
    take: number = 50,
    showLoader: boolean = true
  ): Promise<void> {
    if (!conversationId || !this.accountService.currentUser()) {
      return;
    }

    if (showLoader) {
      this.loadingMessages.set(true);
    }

    const params = new HttpParams()
      .set('skip', String(skip))
      .set('take', String(take));

    try {
      const response = await firstValueFrom(
        this.http.get<ChatMessageModel[]>(
          `${environment.apiUrl}Messaging/conversations/${conversationId}/messages`,
          { params }
        )
      );

      const messages = (response ?? []).sort((left, right) => {
        const leftTime = left.sentAt ? new Date(left.sentAt).getTime() : 0;
        const rightTime = right.sentAt ? new Date(right.sentAt).getTime() : 0;
        return leftTime - rightTime;
      });

      this.messagesByConversation.update((value) => ({
        ...value,
        [conversationId]: messages,
      }));
    } catch {
      if (showLoader) {
        this.alertService.openSnackBar(this.i18nService.translate('messenger.errors.unableLoadMessages'));
      }
    } finally {
      if (showLoader) {
        this.loadingMessages.set(false);
      }
    }
  }

  async requestMessagingAccess(recipientNick?: string): Promise<void> {
    const recipient = (recipientNick ?? this.recipientDraft()).trim();

    if (!recipient) {
      this.alertService.openSnackBar(this.i18nService.translate('messenger.errors.enterRecipientFirst'));
      return;
    }

    const handshakeOk = await this.ensureHandshake();
    if (!handshakeOk) {
      return;
    }

    const body: CreateMessageRequestModel = {
      recipientNick: recipient,
    };

    try {
      await firstValueFrom(this.http.post(`${environment.apiUrl}Messaging/requests`, body));
    } catch {
      this.alertService.openSnackBar(this.i18nService.translate('messenger.errors.unableSendRequest'));
      return;
    }

    this.sentRequestsByRecipient.update((value) => ({
      ...value,
      [recipient]: true,
    }));

    this.alertService.openSnackBar(this.i18nService.translate('messenger.errors.requestSent'));
  }

  async respondToRequest(requestId: string, accept: boolean): Promise<void> {
    if (!requestId) {
      return;
    }

    const handshakeOk = await this.ensureHandshake();
    if (!handshakeOk) {
      return;
    }

    const body: RespondMessageRequestModel = {
      accept,
    };

    try {
      await firstValueFrom(
        this.http.post(`${environment.apiUrl}Messaging/requests/${requestId}/respond`, body)
      );
    } catch {
      this.alertService.openSnackBar(this.i18nService.translate('messenger.errors.failedRespondRequest'));
      return;
    }

    this.incomingRequests.update((value) =>
      value.filter((request) => request.id !== requestId)
    );

    await this.refreshIncomingRequests();

    if (accept) {
      await this.refreshConversations();
    }
  }

  async sendMessage(): Promise<void> {
    const content = this.messageDraft().trim();

    if (!content) {
      return;
    }

    const activeConversation = this.activeConversation();
    const recipientUserId = this.recipientDraft().trim();

    if (!activeConversation || !recipientUserId) {
      this.alertService.openSnackBar(this.i18nService.translate('messenger.errors.chatUnavailable'));
      return;
    }

    const handshakeOk = await this.ensureHandshake();
    if (!handshakeOk) {
      return;
    }

    const model: SendMessageModel = {
      conversationId: activeConversation.id,
      recipientUserId,
      content,
      attachments: [],
    };

    try {
      await firstValueFrom(this.http.post(`${environment.apiUrl}Messaging/messages`, model));
    } catch {
      this.alertService.openSnackBar(this.i18nService.translate('messenger.errors.messageNotSent'));
      return;
    }

    this.messageDraft.set('');
    await this.loadMessages(activeConversation.id);
    await this.refreshConversations();
  }

  async openFromNotification(notification: NotificationModel): Promise<void> {
    const payload = this.asObject(notification.payload);

    const conversationId =
      notification.conversationId ??
      this.readString(payload, ['conversationId']) ??
      this.readString(payload, ['conversationID']);

    const recipientUserId =
      notification.senderUserId ??
      this.readString(payload, ['senderUserId', 'requesterUserId', 'fromUserId']);

    this.openWidget(recipientUserId);

    if (conversationId) {
      await this.selectConversation(conversationId);
      return;
    }

    if (recipientUserId) {
      await this.prepareConversation(recipientUserId);
    }
  }

  hasConversationWithRecipient(recipientUserId: string): boolean {
    return this.findConversationWithRecipient(recipientUserId) !== undefined;
  }

  resolveConversationPeer(conversation: ConversationModel): string {
    const currentUserId = this.currentUserId();
    if (!currentUserId) {
      return conversation.participantUserIds[0] ?? '';
    }

    return conversation.participantUserIds.find((id) => id !== currentUserId) ?? currentUserId;
  }

  formatNotificationLabel(notification: NotificationModel): string {
    if (notification.title) {
      return notification.title;
    }

    switch (notification.type) {
      case NotificationType.MessageRequest:
        return this.i18nService.translate('notifications.labels.newMessageRequest');
      case NotificationType.Message:
        return this.i18nService.translate('notifications.labels.newMessage');
      case NotificationType.Like:
        return this.i18nService.translate('notifications.labels.recipeLiked');
      default:
        return this.i18nService.translate('notifications.labels.notification');
    }
  }

  private async bootstrapAuthorizedSession(): Promise<void> {
    if (this.bootstrapPromise) {
      return this.bootstrapPromise;
    }

    this.bootstrapPromise = (async () => {
      const connected = await this.ensureConnected();
      if (!connected) {
        return;
      }

      const handshakeOk = await this.ensureHandshake();
      if (!handshakeOk) {
        return;
      }

      await this.refreshIncomingRequests();
      await this.refreshConversations();
    })();

    try {
      await this.bootstrapPromise;
    } finally {
      this.bootstrapPromise = null;
    }
  }

  private async ensureConnected(): Promise<boolean> {
    if (!this.accountService.currentUser()?.token) {
      return false;
    }

    if (this.connection?.state === HubConnectionState.Connected) {
      this.isConnected.set(true);
      return true;
    }

    if (!this.connection) {
      this.connection = this.createHubConnection();
      this.registerHubHandlers(this.connection);
    }

    if (this.connectPromise) {
      return this.connectPromise;
    }

    this.connectPromise = this.startConnection();

    try {
      return await this.connectPromise;
    } finally {
      this.connectPromise = null;
    }
  }

  private async startConnection(): Promise<boolean> {
    if (!this.connection) {
      return false;
    }

    this.isConnecting.set(true);

    try {
      if (this.connection.state === HubConnectionState.Disconnected) {
        await this.connection.start();
      }

      this.isConnected.set(this.connection.state === HubConnectionState.Connected);
      return this.connection.state === HubConnectionState.Connected;
    } catch {
      this.isConnected.set(false);
      this.alertService.openSnackBar(this.i18nService.translate('messenger.errors.realtimeConnectionFailed'));
      return false;
    } finally {
      this.isConnecting.set(false);
    }
  }

  private async ensureHandshake(): Promise<boolean> {
    if (!this.accountService.currentUser()) {
      return false;
    }

    const connected = await this.ensureConnected();
    if (!connected || !this.connection || this.connection.state !== HubConnectionState.Connected) {
      return false;
    }

    if (this.handshake()) {
      return true;
    }

    this.handshakeInProgress.set(true);

    try {
      await this.connection.invoke('Handshake');
      return await this.waitForHandshakeAck();
    } catch {
      this.alertService.openSnackBar(this.i18nService.translate('messenger.errors.handshakeFailed'));
      return false;
    } finally {
      this.handshakeInProgress.set(false);
    }
  }

  private createHubConnection(): HubConnection {
    const options: IHttpConnectionOptions = {
      accessTokenFactory: () => this.accountService.currentUser()?.token ?? '',
    };

    return new HubConnectionBuilder()
      .withUrl(this.getHubUrl(), options)
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Warning)
      .build();
  }

  private registerHubHandlers(connection: HubConnection): void {
    const onHandshakeAcknowledged = (payload: unknown) => {
      const handshake = this.normalizeHandshake(payload);
      this.handshake.set(handshake);
      this.notificationService.setUnreadCount(handshake.unreadNotificationCount);
    };

    const onMessageRequestReceived = (payload: unknown) => {
      const request = this.normalizeRequest(payload);
      this.upsertRequest(request);
    };

    const onMessageRequestUpdated = (payload: unknown) => {
      const request = this.normalizeRequest(payload);
      this.upsertRequest(request);

      if (request.status === MessageRequestStatus.Accepted) {
        this.sentRequestsByRecipient.update((value) => ({
          ...value,
          [request.recipientUserId]: false,
          [request.requesterUserId]: false,
        }));

        void this.refreshConversations();
      }
    };

    const onMessageReceived = (payload: unknown) => {
      const message = this.normalizeMessage(payload);
      this.upsertMessage(message);
      void this.refreshConversations();
    };

    const onNotificationReceived = (payload: unknown) => {
      this.notificationService.ingestRealtimeNotification(payload);
    };

    // Register common SignalR event aliases to tolerate backend naming differences.
    for (const eventName of ['HandshakeAcknowledged', 'handshakeAcknowledged']) {
      connection.on(eventName, onHandshakeAcknowledged);
    }

    for (const eventName of ['MessageRequestReceived', 'ReceiveMessageRequest']) {
      connection.on(eventName, onMessageRequestReceived);
    }

    for (const eventName of ['MessageRequestUpdated', 'UpdateMessageRequest']) {
      connection.on(eventName, onMessageRequestUpdated);
    }

    for (const eventName of ['MessageReceived', 'ReceiveMessage', 'NewMessage']) {
      connection.on(eventName, onMessageReceived);
    }

    for (const eventName of ['NotificationReceived', 'ReceiveNotification']) {
      connection.on(eventName, onNotificationReceived);
    }

    connection.onclose(() => {
      this.isConnected.set(false);
      this.handshake.set(null);
    });

    connection.onreconnected(() => {
      this.isConnected.set(true);
      this.handshake.set(null);
      void this.ensureHandshake();
      void this.refreshIncomingRequests();
      void this.refreshConversations();
    });
  }

  private upsertRequest(request: MessageRequestModel): void {
    const currentUserId = this.currentUserId();

    if (
      request.status !== MessageRequestStatus.Pending ||
      request.recipientUserId !== currentUserId
    ) {
      this.incomingRequests.update((value) => value.filter((item) => item.id !== request.id));
      return;
    }

    this.incomingRequests.update((value) => {
      const withoutCurrent = value.filter((item) => item.id !== request.id);
      return [request, ...withoutCurrent];
    });
  }

  private upsertMessage(message: ChatMessageModel): void {
    const conversationId = message.conversationId;

    if (!conversationId) {
      return;
    }

    this.messagesByConversation.update((value) => {
      const previous = value[conversationId] ?? [];
      const withoutCurrent = previous.filter((item) => item.id !== message.id);
      const next = [...withoutCurrent, message].sort((left, right) => {
        const leftTime = left.sentAt ? new Date(left.sentAt).getTime() : 0;
        const rightTime = right.sentAt ? new Date(right.sentAt).getTime() : 0;
        return leftTime - rightTime;
      });

      return {
        ...value,
        [conversationId]: next,
      };
    });
  }

  private normalizeHandshake(payload: unknown): MessagingHandshakeModel {
    const raw = this.asObject(payload);

    return {
      userId: this.readString(raw, ['userId', 'UserId']) ?? this.currentUserId(),
      connectionId: this.readString(raw, ['connectionId', 'ConnectionId']) ?? '',
      serverTimeUtc: this.readString(raw, ['serverTimeUtc', 'ServerTimeUtc']) ?? new Date().toISOString(),
      pendingRequestCount: this.readNumber(raw, ['pendingRequestCount', 'PendingRequestCount']) ?? 0,
      unreadNotificationCount: this.readNumber(raw, ['unreadNotificationCount', 'UnreadNotificationCount']) ?? 0,
    };
  }

  private normalizeRequest(payload: unknown): MessageRequestModel {
    const raw = this.asObject(payload);

    return {
      id:
        this.readString(raw, ['id', 'Id', 'requestId', 'RequestId']) ??
        `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      requesterUserId:
        this.readString(raw, ['requesterUserId', 'RequesterUserId', 'senderUserId', 'SenderUserId']) ??
        '',
      recipientUserId: this.readString(raw, ['recipientUserId', 'RecipientUserId']) ?? '',
      status: this.readNumber(raw, ['status', 'Status']) ?? MessageRequestStatus.Pending,
      createdAt: this.readString(raw, ['createdAt', 'CreatedAt']),
      updatedAt: this.readString(raw, ['updatedAt', 'UpdatedAt']),
    };
  }

  private normalizeMessage(payload: unknown): ChatMessageModel {
    const raw = this.asObject(payload);

    return {
      id:
        this.readString(raw, ['id', 'Id', 'messageId', 'MessageId']) ??
        `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      conversationId:
        this.readString(raw, ['conversationId', 'ConversationId', 'conversationID', 'ConversationID']) ??
        '',
      senderUserId: this.readString(raw, ['senderUserId', 'SenderUserId']) ?? '',
      recipientUserId: this.readString(raw, ['recipientUserId', 'RecipientUserId']) ?? '',
      content: this.readString(raw, ['content', 'Content', 'message', 'Message']) ?? '',
      attachments: Array.isArray(raw['attachments'])
        ? (raw['attachments'] as ChatMessageModel['attachments'])
        : Array.isArray(raw['Attachments'])
          ? (raw['Attachments'] as ChatMessageModel['attachments'])
        : [],
      sentAt: this.readString(raw, ['sentAt', 'SentAt', 'createdAt', 'CreatedAt']) ?? new Date().toISOString(),
      isRead: this.readBoolean(raw, ['isRead', 'IsRead']) ?? false,
    };
  }

  private startLiveSync(): void {
    if (this.liveSyncIntervalId !== null) {
      return;
    }

    void this.syncLiveState();
    this.liveSyncIntervalId = setInterval(() => {
      void this.syncLiveState();
    }, 4000);
  }

  private stopLiveSync(): void {
    if (this.liveSyncIntervalId === null) {
      return;
    }

    clearInterval(this.liveSyncIntervalId);
    this.liveSyncIntervalId = null;
  }

  private async syncLiveState(): Promise<void> {
    if (!this.accountService.currentUser() || !this.widgetOpen()) {
      return;
    }

    await this.refreshIncomingRequests(true);
    await this.refreshConversations(true);

    const activeConversationId = this.activeConversationId();
    if (activeConversationId) {
      await this.loadMessages(activeConversationId, 0, 50, false);
    }
  }

  private findConversationWithRecipient(recipientUserId: string): ConversationModel | undefined {
    const currentUserId = this.currentUserId();

    if (!currentUserId) {
      return this.conversations().find((conversation) =>
        conversation.participantUserIds.includes(recipientUserId)
      );
    }

    return this.conversations().find(
      (conversation) =>
        conversation.participantUserIds.includes(recipientUserId) &&
        conversation.participantUserIds.includes(currentUserId)
    );
  }

  private async disconnect(): Promise<void> {
    if (this.connection) {
      try {
        await this.connection.stop();
      } catch {
        // no-op
      }
    }

    this.connection = null;
    this.isConnected.set(false);
    this.handshake.set(null);
  }

  private resetState(): void {
    this.widgetOpen.set(false);
    this.widgetPinned.set(true);
    this.widgetPosition.set({ x: 0, y: 0 });

    this.recipientDraft.set('');
    this.recipientLabel.set('');
    this.messageDraft.set('');

    this.isConnecting.set(false);
    this.handshakeInProgress.set(false);

    this.conversations.set([]);
    this.messagesByConversation.set({});
    this.activeConversationId.set(null);
    this.incomingRequests.set([]);
    this.sentRequestsByRecipient.set({});
  }

  private getHubUrl(): string {
    const apiRoot = environment.apiUrl.replace(/\/api\/?$/i, '');
    return `${apiRoot}/hubs/messaging`;
  }

  private asObject(value: unknown): Record<string, unknown> {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      return value as Record<string, unknown>;
    }

    return {};
  }

  private async waitForHandshakeAck(timeoutMs: number = 5000): Promise<boolean> {
    if (this.handshake()) {
      return true;
    }

    const startedAt = Date.now();

    while (Date.now() - startedAt < timeoutMs) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      if (this.handshake()) {
        return true;
      }
    }

    this.alertService.openSnackBar(this.i18nService.translate('messenger.errors.handshakeTimeout'));
    return false;
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
