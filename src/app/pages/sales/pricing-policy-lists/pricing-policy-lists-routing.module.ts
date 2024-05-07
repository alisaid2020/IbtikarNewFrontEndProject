import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PricingPolicyListsComponent } from './pricing-policy-lists/pricing-policy-lists.component';
import { pricingPolicyListsResolver } from './pricing-policy-lists.resolver';
import { AddNewPricingPolicyListComponent } from './add-new-pricing-policy-list/add-new-pricing-policy-list.component';

const routes: Routes = [
  {
    path: '',
    component: PricingPolicyListsComponent,
    resolve: {
      pricingPolicyLists: pricingPolicyListsResolver,
    },
  },
  {
    path: 'add',
    component: AddNewPricingPolicyListComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PricingPolicyListsRoutingModule {}
