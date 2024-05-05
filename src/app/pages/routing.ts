import { Routes } from '@angular/router';

const Routing: Routes = [
  {
    path: '',
    redirectTo: '/sales-invoice',
    pathMatch: 'full',
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
