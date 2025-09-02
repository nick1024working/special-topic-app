import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { map, take } from 'rxjs/operators';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return auth.inited$.pipe(
    take(1),
    map(() => {
      if (auth.isLoggedIn()) return true;
      const returnUrl = location.pathname + location.search;
      return router.createUrlTree(['/login'], { queryParams: { returnUrl } }) as UrlTree;
    })
  );
};
