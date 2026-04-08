// src/app/interceptors/auth.interceptor.ts
import { HttpContextToken, HttpInterceptorFn } from '@angular/common/http';

export const SKIP_AUTH = new HttpContextToken<boolean>(() => false);

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.context.get(SKIP_AUTH)) {
    return next(req);
  }

  const token = typeof window !== 'undefined' && window?.localStorage && typeof window.localStorage.getItem === 'function'
    ? window.localStorage.getItem('access_token')
    : null;

  if (token) {
    const cloned = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
    return next(cloned);
  }
  return next(req);
};