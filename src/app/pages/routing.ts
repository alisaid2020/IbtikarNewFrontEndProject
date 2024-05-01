import { Routes } from '@angular/router';

const Routing: Routes = [
  {
    path: '',
    redirectTo: '/departments',
    pathMatch: 'full',
  },

  {
    path: 'departments',
    loadChildren: () =>
      import('./general/general.module').then((m) => m.GeneralModule),
  },

  {
    path: '**',
    redirectTo: 'error/404',
  },
];

export { Routing };
