import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PricingPolicyListsComponent } from './pricing-policy-lists/pricing-policy-lists.component';
import { pricingPolicyListsResolver } from './pricing-policy-lists.resolver';

const routes: Routes = [
  {
    path: '',
    component: PricingPolicyListsComponent,
    resolve: {
      pricingPolicyLists: pricingPolicyListsResolver,
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PricingPolicyListsRoutingModule {}
