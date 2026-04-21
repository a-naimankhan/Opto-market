import { Component, OnDestroy } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../../services/auth/auth';
import { CommonModule } from '@angular/common';
import { ChatService } from '../../../services/chat/chat.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './layout.html',
  styleUrl: './layout.css',
})
export class Layout implements OnDestroy {
  unreadCount = 0;
  private readonly subscriptions = new Subscription();

  constructor(private authService: AuthService, private router: Router, private chatService: ChatService) {
    this.subscriptions.add(
      this.chatService.unreadCount$.subscribe((count) => {
        this.unreadCount = count;
      })
    );
  }

  openCustomerChats(): void {
    this.router.navigate(['/seller/customer']);
    this.chatService.resetUnreadCount();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login'], { queryParams: { redirect: '/buyer' } });
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
