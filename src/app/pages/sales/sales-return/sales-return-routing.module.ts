import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SalesReturnListComponent } from './sales-return-list/sales-return-list.component';
import { AddNewSalesReturnComponent } from './add-new-sales-return/add-new-sales-return.component';
import { salesReturnResolver } from './sales-return.resolver';

const routes: Routes = [
  {
    path: '',
    component: SalesReturnListComponent,
    resolve: {
      salesReturn: salesReturnResolver,
    },
  },
  {
    path: 'add',
    component: AddNewSalesReturnComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SalesReturnRoutingModule {}
