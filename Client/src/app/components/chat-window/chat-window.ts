import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ChatMessage } from '../../models/api.models';
import { ChatService } from '../../services/chat/chat.service';

@Component({
  selector: 'app-chat-window',
  imports: [CommonModule, FormsModule],
  templateUrl: './chat-window.html',
  styleUrl: './chat-window.css',
})
export class ChatWindowComponent implements OnChanges, OnDestroy {
  @Input({ required: true }) buyerId!: number;
  @Input({ required: true }) sellerId!: number;
  @Input() title = 'Чат';
  @Input() currentUserId: number | null = null;

  messages: ChatMessage[] = [];
  draftMessage = '';
  isConnected = false;
  errorMessage = '';

  private readonly subscriptions = new Subscription();
  private activeRoomName: string | null = null;

  constructor(private chatService: ChatService) {
    this.subscriptions.add(
      this.chatService.messages$.subscribe((message) => {
        if (message.room_name === this.activeRoomName) {
          this.messages.push(message);
        }
      })
    );

    this.subscriptions.add(
      this.chatService.connectionState$.subscribe((state) => {
        this.isConnected = state.connected;
        this.errorMessage = state.error || '';
      })
    );
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['buyerId'] || changes['sellerId']) {
      this.connectToRoom();
    }
  }

  sendMessage(): void {
    const wasSent = this.chatService.sendMessage(this.draftMessage);
    if (wasSent) {
      this.draftMessage = '';
    }
  }

  trackByTimestamp(_: number, message: ChatMessage): string {
    return `${message.timestamp}-${message.sender_id}-${message.receiver_id}`;
  }

  isOwnMessage(message: ChatMessage): boolean {
    return this.currentUserId !== null && message.sender_id === this.currentUserId;
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    this.chatService.disconnect();
  }

  private connectToRoom(): void {
    if (!this.buyerId || !this.sellerId) {
      return;
    }

    this.messages = [];
    this.activeRoomName = this.chatService.buildRoomName(this.buyerId, this.sellerId);
    this.chatService.connect(this.activeRoomName);
    this.chatService.resetUnreadCount();
  }
}
