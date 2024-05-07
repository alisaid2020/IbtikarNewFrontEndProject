import { NgModule } from '@angular/core';
import { SalesInvoiceRoutingModule } from './sales-invoice-routing.module';
import { SalesInvoiceListComponent } from './sales-invoice-list/sales-invoice-list.component';
import { AddNewSalesInvoiceComponent } from './add-new-sales-invoice/add-new-sales-invoice.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { ShiftDetailsDrawerComponent } from './shift-details-drawer/shift-details-drawer.component';

@NgModule({
  declarations: [
    SalesInvoiceListComponent,
    AddNewSalesInvoiceComponent,
    ShiftDetailsDrawerComponent,
  ],
  imports: [SharedModule, SalesInvoiceRoutingModule],
})
export class SalesInvoiceModule {}
