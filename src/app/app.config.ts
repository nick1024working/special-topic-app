import { ApplicationConfig, APP_INITIALIZER, inject, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

// 攔截器 & AuthService
import { withCredentialsInterceptor } from './shared/auth/with-credentials.interceptor';
import { AuthService } from './shared/auth/auth.service';

// 初始化 AuthService (自動保持登入)
function initAuth() {
  const auth = inject(AuthService);
  return () => auth.boot(); // 必須回傳 function
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([withCredentialsInterceptor])),
    provideAnimationsAsync('noop'),
    { provide: APP_INITIALIZER, useFactory: initAuth, multi: true }
  ]
};
