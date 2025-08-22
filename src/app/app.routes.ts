import { Routes } from '@angular/router';
import { PublicLayout } from './public-layout/public-layout';
import { authgardGuard } from './auth/authgard-guard';

export const routes: Routes = [
  // Public routes
  {
    path: '',
    component: PublicLayout,
    children: [
      { path: '', redirectTo: 'login', pathMatch: 'full' },
      {
        path: 'login',
        loadComponent: () =>
          import('./login/login').then(m => m.LoginComponent)
      },
      {
        path: 'registercompany',
        loadComponent: () =>
          import('./registercompany/registercompany').then(m => m.Registercompany)
      }
    ]
  },

  // Private routes (after login)
  {
    path: 'home',
    loadComponent: () => import('./home/home').then(m => m.Home),
    canActivate: [authgardGuard],
    children: [
      { path: '', redirectTo: 'quickbill', pathMatch: 'full' },
      {
        path: 'quickbill',
        loadComponent: () =>
          import('./quickbill/quickbill').then(m => m.Quickbill)
      },
      {
        path: 'newbill',
        loadComponent: () =>
          import('./newbill/newbill').then(m => m.Newbill)
      },
      {
        path: 'itemmaster',
        loadComponent: () =>
          import('./itemmaster/itemmaster').then(m => m.Itemmaster)
      },
      {
        path: 'billbook',
        loadComponent: () =>
          import('./billbook/billbook').then(m => m.Billbook)
      }
    
    ]
  },

  // Fallback
  { path: '**', redirectTo: 'login' }
];
