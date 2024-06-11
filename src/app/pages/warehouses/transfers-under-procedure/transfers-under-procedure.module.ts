import { NgModule } from '@angular/core';
import { TransfersUnderProcedureRoutingModule } from './transfers-under-procedure-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { AddNewInventoryTransferComponent } from './add-new-inventory-transfer/add-new-inventory-transfer.component';
import { ApplicationsUnderProcedureComponent } from './applications-under-procedure/applications-under-procedure.component';
import { ApprovedApplicationsComponent } from './approved-applications/approved-applications.component';
import { RejectedApplicationsComponent } from './rejected-applications/rejected-applications.component';
import { AllApplicationsComponent } from './all-applications/all-applications.component';

@NgModule({
  declarations: [
    AllApplicationsComponent,
    AddNewInventoryTransferComponent,
    ApplicationsUnderProcedureComponent,
    ApprovedApplicationsComponent,
    RejectedApplicationsComponent,
  ],
  imports: [SharedModule, TransfersUnderProcedureRoutingModule],
})
export class TransfersUnderProcedureModule {}
