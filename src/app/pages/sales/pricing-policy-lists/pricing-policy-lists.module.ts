import { NgModule } from '@angular/core';
import { SharedModule } from 'src/app/shared/shared.module';
import { PricingPolicyListsRoutingModule } from './pricing-policy-lists-routing.module';
import { PricingPolicyListsComponent } from './pricing-policy-lists/pricing-policy-lists.component';

@NgModule({
  declarations: [PricingPolicyListsComponent],
  imports: [SharedModule, PricingPolicyListsRoutingModule],
})
export class PricingPolicyListsModule {}
