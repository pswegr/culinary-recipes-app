import { CdkDragEnd } from '@angular/cdk/drag-drop';
import { Component, HostListener, computed, inject, signal } from '@angular/core';
import { ConversationModel, MessageRequestModel } from 'src/app/shared/models/messaging.model';
import { AccountService } from 'src/app/shared/services/account.service';
import { MessagingService } from 'src/app/shared/services/messaging.service';

@Component({
  selector: 'app-messenger-widget',
  templateUrl: './messenger-widget.component.html',
  styleUrl: './messenger-widget.component.scss',
  standalone: false,
})
export class MessengerWidgetComponent {
  private readonly accountService = inject(AccountService);
  readonly messagingService = inject(MessagingService);

  readonly canSend = computed(() => {
    return (
      this.messagingService.canWriteToRecipient() &&
      this.messagingService.messageDraft().trim().length > 0
    );
  });

  readonly canRequestConversation = computed(() => {
    return (
      this.messagingService.handshake() !== null &&
      this.messagingService.recipientDraft().trim().length > 0 &&
      this.messagingService.activeConversation() === null &&
      !this.messagingService.isRequestPendingForRecipient()
    );
  });

  readonly isSmallScreen = signal<boolean>(this.detectSmallScreen());

  @HostListener('window:resize')
  onResize(): void {
    this.isSmallScreen.set(this.detectSmallScreen());
  }

  isAuthorized(): boolean {
    return this.accountService.currentUser() !== null;
  }

  onRecipientInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.messagingService.recipientDraft.set(value);
    this.messagingService.recipientLabel.set(value);
  }

  onMessageInput(event: Event): void {
    const value = (event.target as HTMLTextAreaElement).value;
    this.messagingService.messageDraft.set(value);
  }

  onDragEnded(event: CdkDragEnd): void {
    const position = event.source.getFreeDragPosition();
    this.messagingService.updateWidgetPosition(position);
  }

  togglePinned(): void {
    this.messagingService.toggleWidgetPinned();
  }

  closeWidget(): void {
    this.messagingService.closeWidget();
  }

  startConversation(): void {
    const recipient = this.messagingService.recipientDraft().trim();
    if (!recipient) {
      return;
    }

    void this.messagingService.prepareConversation(recipient);
  }

  sendRequest(): void {
    void this.messagingService.requestMessagingAccess();
  }

  sendMessage(): void {
    void this.messagingService.sendMessage();
  }

  respondToRequest(request: MessageRequestModel, accept: boolean): void {
    void this.messagingService.respondToRequest(request.id, accept);
  }

  openConversation(conversation: ConversationModel): void {
    void this.messagingService.selectConversation(conversation.id);
  }

  getConversationTitle(conversation: ConversationModel): string {
    return this.messagingService.resolveConversationPeer(conversation);
  }

  isMine(senderUserId: string): boolean {
    return senderUserId === this.messagingService.currentUserId();
  }

  trackByConversation(index: number, conversation: ConversationModel): string {
    return conversation.id;
  }

  trackByRequest(index: number, request: MessageRequestModel): string {
    return request.id;
  }

  trackByMessage(index: number, message: { id: string }): string {
    return message.id;
  }

  private detectSmallScreen(): boolean {
    return window.matchMedia('(max-width: 900px)').matches;
  }
}
