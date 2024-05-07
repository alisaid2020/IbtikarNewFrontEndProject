import { NgModule } from '@angular/core';
import { PricingPolicyRoutingModule } from './pricing-policy-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { PricingPolicyListComponent } from './pricing-policy-list/pricing-policy-list.component';
import { AddNewPricingPolicyComponent } from './add-new-pricing-policy/add-new-pricing-policy.component';

@NgModule({
  declarations: [PricingPolicyListComponent, AddNewPricingPolicyComponent],
  imports: [SharedModule, PricingPolicyRoutingModule],
})
export class PricingPolicyModule {}
