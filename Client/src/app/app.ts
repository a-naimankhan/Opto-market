import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('optomarket_front');

  currentPath = '/';

  constructor(private router: Router) {
    this.currentPath = this.normalizePath(this.router.url);

    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event) => {
        this.currentPath = this.normalizePath((event as NavigationEnd).urlAfterRedirects);
      });
  }

  get showBackToHomeButton(): boolean {
    return this.currentPath !== '/' && this.currentPath !== '/buyer' && this.currentPath.startsWith('/seller');
  }

  goToHome(): void {
    this.router.navigate(['/']);
  }

  private normalizePath(url: string): string {
    return (url || '/').split('?')[0].replace(/\/$/, '') || '/';
  }
}
