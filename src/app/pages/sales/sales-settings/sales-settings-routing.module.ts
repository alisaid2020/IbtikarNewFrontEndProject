import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SalesSettingsComponent } from './sales-settings/sales-settings.component';

const routes: Routes = [
  {
    path: '',
    component: SalesSettingsComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SalesSettingsRoutingModule {}
