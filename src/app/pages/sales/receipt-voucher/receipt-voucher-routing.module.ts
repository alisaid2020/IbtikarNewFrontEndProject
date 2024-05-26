import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReceiptVoucherListComponent } from './receipt-voucher-list/receipt-voucher-list.component';
import { AddNewReceiptVoucherComponent } from './add-new-receipt-voucher/add-new-receipt-voucher.component';
import { receiptVouchersListResolver } from './receipt-voucher.resolver';

const routes: Routes = [
  {
    path: '',
    component: ReceiptVoucherListComponent,
    resolve: { receiptVouchersList: receiptVouchersListResolver },
  },
  {
    path: 'add',
    component: AddNewReceiptVoucherComponent,
  },
  {
    path: ':id',
    component: AddNewReceiptVoucherComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ReceiptVoucherRoutingModule {}
