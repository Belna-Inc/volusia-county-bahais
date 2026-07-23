import { Routes } from '@angular/router';
import { Home } from './pages/home/home';

export const routes: Routes = [
  {
    path: '',
    component: Home,
    title: 'Bahá’ís of Volusia County — One human family on Florida’s coast',
  },
  {
    path: 'calendar',
    loadComponent: () => import('./pages/calendar/calendar').then((m) => m.Calendar),
    title: 'Calendar — Bahá’ís of Volusia County',
  },
  { path: '**', redirectTo: '' },
];
