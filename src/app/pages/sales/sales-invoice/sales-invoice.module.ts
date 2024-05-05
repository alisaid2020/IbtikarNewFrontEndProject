import { NgModule } from '@angular/core';
import { SalesInvoiceRoutingModule } from './sales-invoice-routing.module';
import { SalesInvoiceListComponent } from './sales-invoice-list/sales-invoice-list.component';
import { AddNewSalesInvoiceComponent } from './add-new-sales-invoice/add-new-sales-invoice.component';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  declarations: [SalesInvoiceListComponent, AddNewSalesInvoiceComponent],
  imports: [SharedModule, SalesInvoiceRoutingModule],
})
export class SalesInvoiceModule {}
