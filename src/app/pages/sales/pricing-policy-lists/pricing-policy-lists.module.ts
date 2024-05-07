import { NgModule } from '@angular/core';
import { SharedModule } from 'src/app/shared/shared.module';
import { PricingPolicyListsRoutingModule } from './pricing-policy-lists-routing.module';
import { PricingPolicyListsComponent } from './pricing-policy-lists/pricing-policy-lists.component';
import { AddNewPricingPolicyListComponent } from './add-new-pricing-policy-list/add-new-pricing-policy-list.component';

@NgModule({
  declarations: [PricingPolicyListsComponent, AddNewPricingPolicyListComponent],
  imports: [SharedModule, PricingPolicyListsRoutingModule],
})
export class PricingPolicyListsModule {}
