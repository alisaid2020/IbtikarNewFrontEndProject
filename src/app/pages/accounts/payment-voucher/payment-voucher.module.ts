import { NgModule } from '@angular/core';
import { PaymentVoucherRoutingModule } from './payment-voucher-routing.module';
import { PaymentVoucherListComponent } from './payment-voucher-list/payment-voucher-list.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { AddNewPaymentVoucherComponent } from './add-new-payment-voucher/add-new-payment-voucher.component';

@NgModule({
  declarations: [PaymentVoucherListComponent, AddNewPaymentVoucherComponent],
  imports: [SharedModule, PaymentVoucherRoutingModule],
})
export class PaymentVoucherModule {}
