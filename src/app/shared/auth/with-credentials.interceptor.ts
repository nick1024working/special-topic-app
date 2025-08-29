import { HttpInterceptorFn } from '@angular/common/http';

export const withCredentialsInterceptor: HttpInterceptorFn = (req, next) => {
  // 只處理對外的 http/https，要帶上 cookie
  if (req.url.startsWith('http')) {
    req = req.clone({ withCredentials: true });
  }
  return next(req);
};
