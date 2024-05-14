import { NgModule } from '@angular/core';
import { SalesSettingsRoutingModule } from './sales-settings-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { SalesSettingsComponent } from './sales-settings/sales-settings.component';

@NgModule({
  declarations: [SalesSettingsComponent],
  imports: [SharedModule, SalesSettingsRoutingModule],
})
export class SalesSettingsModule {}
