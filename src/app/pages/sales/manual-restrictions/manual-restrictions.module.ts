import { NgModule } from '@angular/core';
import { ManualRestrictionsRoutingModule } from './manual-restrictions-routing.module';
import { AddNewManualRestrictionComponent } from './add-new-manual-restriction/add-new-manual-restriction.component';
import { ManualRestrictionsListComponent } from './manual-restrictions-list/manual-restrictions-list.component';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  declarations: [
    ManualRestrictionsListComponent,
    AddNewManualRestrictionComponent,
  ],
  imports: [SharedModule, ManualRestrictionsRoutingModule],
})
export class ManualRestrictionsModule {}
