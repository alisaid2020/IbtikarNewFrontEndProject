import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SalesInvoiceComponent } from './sales-invoice/sales-invoice.component';
import { AddNewSalesInvoiceComponent } from './add-new-sales-invoice/add-new-sales-invoice.component';

const routes: Routes = [
  {
    path: '',
    component: SalesInvoiceComponent,
  },
  {
    path: 'add',
    component: AddNewSalesInvoiceComponent,
  },
  {
    path: 'edit/:id',
    component: AddNewSalesInvoiceComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SalesInvoiceRoutingModule {}
