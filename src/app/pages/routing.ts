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
    path: 'sales-invoice',
    loadChildren: () =>
      import('./sales/sales-invoice/sales-invoice.module').then(
        (m) => m.SalesInvoiceModule
      ),
  },

  {
    path: '**',
    redirectTo: 'error/404',
  },
];

export { Routing };
