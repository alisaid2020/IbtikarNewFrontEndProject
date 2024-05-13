import { NgModule } from '@angular/core';
import { SalesReturnRoutingModule } from './sales-return-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { SalesReturnListComponent } from './sales-return-list/sales-return-list.component';
import { AddNewSalesReturnComponent } from './add-new-sales-return/add-new-sales-return.component';

@NgModule({
  declarations: [SalesReturnListComponent, AddNewSalesReturnComponent],
  imports: [SharedModule, SalesReturnRoutingModule],
})
export class SalesReturnModule {}
