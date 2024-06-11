import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AddNewInventoryTransferComponent } from './add-new-inventory-transfer/add-new-inventory-transfer.component';
import { AllApplicationsComponent } from './all-applications/all-applications.component';

const routes: Routes = [
  {
    path: '',
    component: AllApplicationsComponent,
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
export class TransfersUnderProcedureRoutingModule {}
