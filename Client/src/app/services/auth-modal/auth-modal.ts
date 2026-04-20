import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

interface AuthModalState {
  isOpen: boolean;
  redirectUrl: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class AuthModalService {
  private readonly stateSubject = new BehaviorSubject<AuthModalState>({
    isOpen: false,
    redirectUrl: null,
  });

  readonly state$ = this.stateSubject.asObservable();

  open(redirectUrl: string | null = null): void {
    this.stateSubject.next({
      isOpen: true,
      redirectUrl,
    });
  }

  close(): void {
    this.stateSubject.next({
      isOpen: false,
      redirectUrl: null,
    });
  }

  get redirectUrl(): string | null {
    return this.stateSubject.value.redirectUrl;
  }
}
