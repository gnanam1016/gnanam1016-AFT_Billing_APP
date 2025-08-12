import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authgardGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  // const isLoggedIn = !!localStorage.getItem('token');
  const isLoggedIn = true; // Replace with actual login check logic

    if (!isLoggedIn) {
      router.navigate(['/login']);
      return false;
    }
    return true;
};
