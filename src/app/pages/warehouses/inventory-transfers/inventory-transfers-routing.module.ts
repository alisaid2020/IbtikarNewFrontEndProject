import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { InventoryTransfersComponent } from './inventory-transfers/inventory-transfers.component';
import { AddNewInventoryTransferComponent } from './add-new-inventory-transfer/add-new-inventory-transfer.component';

const routes: Routes = [
  {
    path: '',
    component: InventoryTransfersComponent,
  },
  {
    path: 'add',
    component: AddNewInventoryTransferComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InventoryTransfersRoutingModule {}
