import { Routes } from '@angular/router';

const Routing: Routes = [
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full',
  },
  {
    path: 'dashboard',
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
    path: 'pricing-policy',
    loadChildren: () =>
      import('./sales/pricing-policy/pricing-policy.module').then(
        (m) => m.PricingPolicyModule
      ),
  },
  {
    path: 'pricing-policy-lists',
    loadChildren: () =>
      import('./sales/pricing-policy-lists/pricing-policy-lists.module').then(
        (m) => m.PricingPolicyListsModule
      ),
  },

  {
    path: '**',
    redirectTo: 'error/404',
  },
];

export { Routing };
