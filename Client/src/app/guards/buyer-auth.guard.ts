import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs';
import { AuthService } from '../services/auth/auth';

export const buyerAuthGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const redirectTarget = state.url || '/buyer/checkout';

  if (!authService.getToken()) {
    router.navigate(['/login'], { queryParams: { redirect: redirectTarget } });
    return false;
  }

  if (authService.currentUser) {
    if (authService.currentUser.role === 'buyer') {
      return true;
    }
    return false;
  }

  return authService.loadUserProfile().pipe(
    map((user) => {
      if (user?.role === 'buyer') {
        return true;
      }
      router.navigate(['/login'], { queryParams: { redirect: redirectTarget } });
      return false;
    })
  );
};
