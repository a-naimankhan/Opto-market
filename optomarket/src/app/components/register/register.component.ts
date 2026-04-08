// src/app/components/register/register.component.ts
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  user = { username: '', email: '', password: '', password2: '', role: '' };
  http = inject(HttpClient);
  router = inject(Router);

  register() {
    if (this.user.password !== this.user.password2) {
      alert('Пароли не совпадают!');
      return;
    }

    const userData = {
      username: this.user.username,
      email: this.user.email,
      password: this.user.password,
      role: this.user.role
    };

    this.http.post('http://127.0.0.1:8000/api/register/', userData).subscribe({
      next: () => {
        alert('Регистрация успешна! Теперь войдите в систему.');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        console.error('Registration error:', err);
        alert('Ошибка регистрации. Возможно, такой пользователь уже существует.');
      }
    });
  }
}