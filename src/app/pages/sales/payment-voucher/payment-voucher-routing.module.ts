import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PaymentVoucherListComponent } from './payment-voucher-list/payment-voucher-list.component';
import { AddNewPaymentVoucherComponent } from './add-new-payment-voucher/add-new-payment-voucher.component';
import { paymentVoucherListResolver } from './payment-voucher.resolver';

const routes: Routes = [
  {
    path: '',
    component: PaymentVoucherListComponent,
    resolve: { paymentVouchersList: paymentVoucherListResolver },
  },
  { path: 'add', component: AddNewPaymentVoucherComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PaymentVoucherRoutingModule {}
