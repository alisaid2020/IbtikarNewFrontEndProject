import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PricingPolicyListComponent } from './pricing-policy-list/pricing-policy-list.component';
import { pricingPolicyResolver } from './pricing-policy.resolver';

const routes: Routes = [
  {
    path: '',
    component: PricingPolicyListComponent,
    resolve: {
      pricingPolicyData: pricingPolicyResolver,
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PricingPolicyRoutingModule {}
