import { NgModule } from '@angular/core';
import { SalesInvoiceRoutingModule } from './sales-invoice-routing.module';
import { SalesInvoiceComponent } from './sales-invoice/sales-invoice.component';
import { AddNewSalesInvoiceComponent } from './add-new-sales-invoice/add-new-sales-invoice.component';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  declarations: [SalesInvoiceComponent, AddNewSalesInvoiceComponent],
  imports: [SharedModule, SalesInvoiceRoutingModule],
})
export class SalesInvoiceModule {}
