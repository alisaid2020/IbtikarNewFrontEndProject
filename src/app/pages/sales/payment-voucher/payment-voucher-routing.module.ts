import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PaymentVoucherListComponent } from './payment-voucher-list/payment-voucher-list.component';
import { AddNewPaymentVoucherComponent } from './add-new-payment-voucher/add-new-payment-voucher.component';

const routes: Routes = [
  { path: '', component: PaymentVoucherListComponent },
  { path: 'add', component: AddNewPaymentVoucherComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PaymentVoucherRoutingModule {}
