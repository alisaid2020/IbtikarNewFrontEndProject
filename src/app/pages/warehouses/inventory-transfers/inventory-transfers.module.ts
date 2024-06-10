import { NgModule } from '@angular/core';
import { InventoryTransfersRoutingModule } from './inventory-transfers-routing.module';
import { AddNewInventoryTransferComponent } from './add-new-inventory-transfer/add-new-inventory-transfer.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { InventoryTransfersComponent } from './inventory-transfers/inventory-transfers.component';
import { RejectedApplicationsComponent } from './rejected-applications/rejected-applications.component';
import { ApprovedApplicationsComponent } from './approved-applications/approved-applications.component';
import { ApplicationsUnderProcedureComponent } from './applications-under-procedure/applications-under-procedure.component';

@NgModule({
  declarations: [
    AddNewInventoryTransferComponent,
    InventoryTransfersComponent,
    ApplicationsUnderProcedureComponent,
    ApprovedApplicationsComponent,
    RejectedApplicationsComponent,
  ],
  imports: [SharedModule, InventoryTransfersRoutingModule],
})
export class InventoryTransfersModule {}
