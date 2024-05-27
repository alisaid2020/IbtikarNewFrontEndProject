import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SalesInvoiceListComponent } from './sales-invoice-list/sales-invoice-list.component';
import { AddNewSalesInvoiceComponent } from './add-new-sales-invoice/add-new-sales-invoice.component';
import {
  salesInvoiceDetailsResolver,
  salesInvoiceResolver,
} from './sales-invoice.resolver';

const routes: Routes = [
  {
    path: '',
    component: SalesInvoiceListComponent,
    resolve: {
      invoiceList: salesInvoiceResolver,
    },
  },
  {
    path: 'add',
    component: AddNewSalesInvoiceComponent,
  },
  {
    path: ':id',
    component: AddNewSalesInvoiceComponent,
    resolve: {
      saleInvoice: salesInvoiceDetailsResolver,
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SalesInvoiceRoutingModule {}
