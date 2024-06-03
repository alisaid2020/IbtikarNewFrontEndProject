import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PaymentVoucherListComponent } from './payment-voucher-list/payment-voucher-list.component';
import { AddNewPaymentVoucherComponent } from './add-new-payment-voucher/add-new-payment-voucher.component';
import {
  paymentVoucherListResolver,
  paymentVoucherResolver,
} from './payment-voucher.resolver';

const routes: Routes = [
  {
    path: '',
    component: PaymentVoucherListComponent,
    resolve: { paymentVouchersList: paymentVoucherListResolver },
  },
  { path: 'add', component: AddNewPaymentVoucherComponent },
  {
    path: ':id',
    component: AddNewPaymentVoucherComponent,
    resolve: {
      paymentVoucher: paymentVoucherResolver,
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PaymentVoucherRoutingModule {}
