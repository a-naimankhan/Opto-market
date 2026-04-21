import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { ChatConnectionState, ChatMessage } from '../../models/api.models';
import { AuthService } from '../auth/auth';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private socket: WebSocket | null = null;
  private roomName: string | null = null;

  private readonly messagesSubject = new Subject<ChatMessage>();
  private readonly connectionStateSubject = new BehaviorSubject<ChatConnectionState>({
    connected: false,
    roomName: null,
    error: null,
  });
  private readonly unreadCountSubject = new BehaviorSubject<number>(0);

  readonly messages$: Observable<ChatMessage> = this.messagesSubject.asObservable();
  readonly connectionState$: Observable<ChatConnectionState> = this.connectionStateSubject.asObservable();
  readonly unreadCount$: Observable<number> = this.unreadCountSubject.asObservable();

  constructor(private authService: AuthService) {}

  connect(roomName: string): void {
    const token = this.authService.getToken();
    if (!token) {
      this.connectionStateSubject.next({
        connected: false,
        roomName: null,
        error: 'Missing auth token for chat connection.',
      });
      return;
    }

    if (this.socket && this.roomName === roomName && this.socket.readyState === WebSocket.OPEN) {
      return;
    }

    this.disconnect();
    this.roomName = roomName;

    const isBrowser = typeof window !== 'undefined';
    const wsProtocol = isBrowser && window.location.protocol === 'https:' ? 'wss' : 'ws';
    const wsUrl = `${wsProtocol}://localhost:8000/ws/chat/${roomName}/?token=${encodeURIComponent(token)}`;
    this.socket = new WebSocket(wsUrl);

    this.socket.onopen = () => {
      this.connectionStateSubject.next({
        connected: true,
        roomName,
        error: null,
      });
    };

    this.socket.onmessage = (event: MessageEvent<string>) => {
      try {
        const parsed = JSON.parse(event.data) as ChatMessage;
        this.messagesSubject.next(parsed);
        if (parsed.sender_id !== this.authService.currentUser?.id) {
          this.unreadCountSubject.next(this.unreadCountSubject.value + 1);
        }
      } catch {
        this.connectionStateSubject.next({
          connected: true,
          roomName,
          error: 'Failed to parse incoming chat message.',
        });
      }
    };

    this.socket.onerror = () => {
      this.connectionStateSubject.next({
        connected: false,
        roomName,
        error: 'WebSocket connection error.',
      });
    };

    this.socket.onclose = () => {
      this.connectionStateSubject.next({
        connected: false,
        roomName: this.roomName,
        error: null,
      });
      this.socket = null;
    };
  }

  sendMessage(message: string): boolean {
    const trimmedMessage = (message || '').trim();
    if (!trimmedMessage || !this.socket || this.socket.readyState !== WebSocket.OPEN) {
      return false;
    }

    this.socket.send(JSON.stringify({ message: trimmedMessage }));
    return true;
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    this.roomName = null;
    this.connectionStateSubject.next({
      connected: false,
      roomName: null,
      error: null,
    });
  }

  buildRoomName(buyerId: number, sellerId: number): string {
    return `chat_${buyerId}_${sellerId}`;
  }

  resetUnreadCount(): void {
    this.unreadCountSubject.next(0);
  }
}
