// src/app/components/login/login.component.ts
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  user = { username: '', password: '' };
  http = inject(HttpClient);
  router = inject(Router);
  authService = inject(AuthService);

  login() {
    this.http.post<any>('http://127.0.0.1:8000/api/token/', this.user).subscribe({
      next: (res) => {
        if (typeof window !== 'undefined' && window?.localStorage && typeof window.localStorage.setItem === 'function') {
          window.localStorage.setItem('access_token', res.access);
        }
        // Load user profile and navigate after it completes
        this.authService.loadUserProfile().subscribe(user => {
          if (user) {
            this.router.navigate(['/products']);
          } else {
            alert('Ошибка загрузки профиля пользователя.');
          }
        });
      },
      error: () => alert('Ошибка входа! Проверьте логин и пароль.')
    });
  }
}