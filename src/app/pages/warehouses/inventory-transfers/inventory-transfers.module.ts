import { NgModule } from '@angular/core';
import { InventoryTransfersRoutingModule } from './inventory-transfers-routing.module';
import { AddNewInventoryTransferComponent } from './add-new-inventory-transfer/add-new-inventory-transfer.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { InventoryTransfersComponent } from './inventory-transfers/inventory-transfers.component';

@NgModule({
  declarations: [AddNewInventoryTransferComponent, InventoryTransfersComponent],
  imports: [SharedModule, InventoryTransfersRoutingModule],
})
export class InventoryTransfersModule {}
