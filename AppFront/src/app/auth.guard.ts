import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UserService } from './user.service';

export const authGuard: CanActivateFn = () => {
  const router = inject(Router);

  if (typeof localStorage === 'undefined') {
    return true;
  }

  const token = localStorage.getItem('token');

  if (!token) {
    router.navigate(['/login']);
    return false;
  }

  return true;
};

export const adminGuard: CanActivateFn = () => {
  const router = inject(Router);
  const userService = inject(UserService);

  if (typeof localStorage === 'undefined') {
    return true;
  }

  const role = userService.getCurrentUser().role;

  if (role !== 'ADMIN') {
    router.navigate(['/agent-dashboard']);
    return false;
  }

  return true;
};
