import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, of, tap } from 'rxjs';
import { Constant } from '../product/constant/constant';
import { AuthUser } from '../../models/api.models';

interface LoginResponse {
  access: string;
  refresh: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<AuthUser | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    if (this.getToken()) {
      this.loadUserProfile().subscribe();
    }
  }

  login(credentials: { username: string; password: string }): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(Constant.API_END_POINT + Constant.METHODS.LOGIN, credentials);
  }

  register(payload: { username: string; email: string; password: string; role: 'buyer' | 'seller' }): Observable<unknown> {
    return this.http.post(Constant.API_END_POINT + Constant.METHODS.REGISTER, payload);
  }

  loadUserProfile(): Observable<AuthUser | null> {
    return this.http.get<AuthUser>(Constant.API_END_POINT + Constant.METHODS.USER_PROFILE).pipe(
      tap((user) => this.currentUserSubject.next(user)),
      catchError(() => {
        this.logout();
        return of(null);
      })
    );
  }

  setToken(token: string): void {
    if (typeof window !== 'undefined' && window?.localStorage) {
      window.localStorage.setItem('access_token', token);
    }
  }

  getToken(): string | null {
    if (typeof window === 'undefined' || !window?.localStorage) {
      return null;
    }
    return window.localStorage.getItem('access_token');
  }

  logout(): void {
    if (typeof window !== 'undefined' && window?.localStorage) {
      window.localStorage.removeItem('access_token');
    }
    this.currentUserSubject.next(null);
  }

  get currentUser(): AuthUser | null {
    return this.currentUserSubject.value;
  }

  isSeller(): boolean {
    return this.currentUser?.role === 'seller';
  }

  isBuyer(): boolean {
    return this.currentUser?.role === 'buyer';
  }
}
