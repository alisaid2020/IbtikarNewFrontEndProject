import { Routes } from '@angular/router';

const Routing: Routes = [
  {
    path: 'builder',
    loadChildren: () =>
      import('./builder/builder.module').then((m) => m.BuilderModule),
  },
  {
    path: '',
    loadChildren: () =>
      import('./builder/builder.module').then((m) => m.BuilderModule),
  },

  {
    path: '',
    redirectTo: '/builder',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: 'error/404',
  },
];

export { Routing };
