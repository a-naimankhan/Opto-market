// src/app/services/auth.service.ts
import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

export interface User {
  id: number;
  username: string;
  email: string;
  role: 'buyer' | 'seller';
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    // При инициализации проверяем, есть ли токен и получаем данные пользователя
    const token = this.getToken();
    if (token) {
      this.loadUserProfile().subscribe();
    }
  }

  private getToken(): string | null {
    if (typeof window === 'undefined' || !window?.localStorage || typeof window.localStorage.getItem !== 'function') {
      return null;
    }
    return window.localStorage.getItem('access_token');
  }

  get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isSeller(): boolean {
    return this.currentUser?.role === 'seller';
  }

  isLoggedIn(): boolean {
    return !!this.currentUser;
  }

  loadUserProfile(): Observable<User | null> {
    // Получаем профиль пользователя с ролью
      return this.http.get<User>('http://127.0.0.1:8000/api/user/profile/').pipe(
      tap(user => this.currentUserSubject.next(user)),
      catchError(() => {
        // Если токен невалидный, очищаем
        this.logout();
        return of(null);
      })
    );
  }

  logout() {
    if (typeof window !== 'undefined' && window?.localStorage) {
      window.localStorage.removeItem('access_token');
    }
    this.currentUserSubject.next(null);
  }
}