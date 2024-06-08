import { NgModule } from '@angular/core';
import { ReceiptVoucherRoutingModule } from './receipt-voucher-routing.module';
import { AddNewReceiptVoucherComponent } from './add-new-receipt-voucher/add-new-receipt-voucher.component';
import { ReceiptVoucherListComponent } from './receipt-voucher-list/receipt-voucher-list.component';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  declarations: [AddNewReceiptVoucherComponent, ReceiptVoucherListComponent],
  imports: [SharedModule, ReceiptVoucherRoutingModule],
})
export class ReceiptVoucherModule {}
