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
    path: 'sales-return',
    loadChildren: () =>
      import('./sales/sales-return/sales-return.module').then(
        (m) => m.SalesReturnModule
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
    path: 'sales-settings',
    loadChildren: () =>
      import('./sales/sales-settings/sales-settings.module').then(
        (m) => m.SalesSettingsModule
      ),
  },
  {
    path: 'receipt-vouchers',
    loadChildren: () =>
      import('./accounts/receipt-voucher/receipt-voucher.module').then(
        (m) => m.ReceiptVoucherModule
      ),
  },
  {
    path: 'payment-vouchers',
    loadChildren: () =>
      import('./accounts/payment-voucher/payment-voucher.module').then(
        (m) => m.PaymentVoucherModule
      ),
  },
  {
    path: 'manual-restrictions',
    loadChildren: () =>
      import('./accounts/manual-restrictions/manual-restrictions.module').then(
        (m) => m.ManualRestrictionsModule
      ),
  },
  {
    path: 'inventory-transfers',
    loadChildren: () =>
      import(
        './warehouses/inventory-transfers/inventory-transfers.module'
      ).then((m) => m.InventoryTransfersModule),
  },

  {
    path: '**',
    redirectTo: 'error/404',
  },
];

export { Routing };
