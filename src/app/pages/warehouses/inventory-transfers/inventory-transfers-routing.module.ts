import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { InventoryTransfersComponent } from './inventory-transfers/inventory-transfers.component';
import { inventoryTransfersResolver } from './inventory-transfers.resolver';

const routes: Routes = [
  {
    path: '',
    component: InventoryTransfersComponent,
    resolve: {
      inventoryTransfers: inventoryTransfersResolver,
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InventoryTransfersRoutingModule {}
