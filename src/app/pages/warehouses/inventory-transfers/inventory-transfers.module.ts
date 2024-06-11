import { NgModule } from '@angular/core';
import { InventoryTransfersRoutingModule } from './inventory-transfers-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { InventoryTransfersComponent } from './inventory-transfers/inventory-transfers.component';

@NgModule({
  declarations: [InventoryTransfersComponent],
  imports: [SharedModule, InventoryTransfersRoutingModule],
})
export class InventoryTransfersModule {}
