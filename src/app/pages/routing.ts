import { Routes } from '@angular/router';

const Routing: Routes = [
  {
    path: '',
    redirectTo: '/general',
    pathMatch: 'full',
  },

  {
    path: 'general',
    loadChildren: () =>
      import('./general/general.module').then((m) => m.GeneralModule),
  },

  {
    path: '**',
    redirectTo: 'error/404',
  },
];

export { Routing };
