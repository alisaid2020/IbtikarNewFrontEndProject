import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ManualRestrictionsListComponent } from './manual-restrictions-list/manual-restrictions-list.component';
import {
  manualRestrictionResolver,
  manualRestrictionsListResolver,
} from './manual-restrictions.resolver';
import { AddNewManualRestrictionComponent } from './add-new-manual-restriction/add-new-manual-restriction.component';

const routes: Routes = [
  {
    path: '',
    component: ManualRestrictionsListComponent,
    resolve: {
      manualRestrictions: manualRestrictionsListResolver,
    },
  },
  {
    path: 'add',
    component: AddNewManualRestrictionComponent,
  },
  {
    path: ':id',
    component: AddNewManualRestrictionComponent,
    resolve: {
      manualRestriction: manualRestrictionResolver,
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ManualRestrictionsRoutingModule {}
