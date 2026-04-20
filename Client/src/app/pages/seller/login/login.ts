
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../services/auth/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  isRegister = false;

  loginObj = {
    username: '',
    password: '',
  };

  registerObj = {
    username: '',
    email: '',
    password: '',
    password2: '',
    role: 'buyer' as 'buyer' | 'seller',
  };

  constructor(private router: Router, private route: ActivatedRoute, private authService: AuthService) {}

  onLogin(): void {
    this.authService.login(this.loginObj).subscribe({
      next: (res) => {
        this.authService.setToken(res.access);
        this.authService.loadUserProfile().subscribe((user) => {
          if (!user) {
            alert('Не удалось загрузить профиль пользователя');
            return;
          }

          const redirectTarget = this.route.snapshot.queryParamMap.get('redirect');

          if (user.role === 'seller') {
            this.router.navigateByUrl('/seller/products');
          } else if (user.role === 'buyer') {
            this.router.navigateByUrl(redirectTarget || '/buyer');
          } else {
            alert('Неизвестная роль пользователя');
            this.authService.logout();
          }
        });
      },
      error: () => {
        alert('Неверное имя пользователя или пароль');
      },
    });
  }

  onRegister(): void {
    if (!this.registerObj.username || !this.registerObj.email || !this.registerObj.password || !this.registerObj.password2) {
      alert('Пожалуйста, заполните все поля для регистрации');
      return;
    }

    if (this.registerObj.password !== this.registerObj.password2) {
      alert('Пароли не совпадают');
      return;
    }

    this.authService
      .register({
        username: this.registerObj.username,
        email: this.registerObj.email,
        password: this.registerObj.password,
        role: this.registerObj.role,
      })
      .subscribe({
        next: () => {
          alert('Регистрация успешна. Теперь войдите в аккаунт');
          this.isRegister = false;
        },
        error: () => {
          alert('Ошибка регистрации. Возможно, такой пользователь уже существует');
        },
      });
  }
}
