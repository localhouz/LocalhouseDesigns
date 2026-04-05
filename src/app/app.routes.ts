import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '',         loadComponent: () => import('./pages/home/home').then(m => m.HomeComponent) },
  { path: 'work',     loadComponent: () => import('./pages/work/work').then(m => m.WorkComponent) },
  { path: 'services', loadComponent: () => import('./pages/services/services').then(m => m.ServicesComponent) },
  { path: 'contact',  loadComponent: () => import('./pages/contact/contact').then(m => m.ContactComponent) },
  { path: 'lab',      loadComponent: () => import('./pages/lab/lab').then(m => m.LabComponent) },
  { path: '**',       redirectTo: '' },
];
