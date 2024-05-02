import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { GeneralRoutingModule } from './general-routing.module';
import { GeneralComponent } from './general/general.component';
import { SharedModule } from 'src/app/shared/shared.module';


@NgModule({
  declarations: [
    GeneralComponent
  ],
  imports: [
    SharedModule,
    GeneralRoutingModule
  ]
})
export class GeneralModule { }
