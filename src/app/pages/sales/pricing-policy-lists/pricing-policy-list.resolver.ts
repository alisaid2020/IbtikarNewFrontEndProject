import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { apiUrl } from '@constants/api.constant';
import { DataService } from '@services/data.service';
import { combineLatest, firstValueFrom, forkJoin } from 'rxjs';

export const pricingPolicyListResolver: ResolveFn<any> = (route, state) => {
  let dataService = inject(DataService);
  let arr = [];
  const PricingPolicies = firstValueFrom(
    dataService.get(`${apiUrl}/XtraAndPos_PricePolicyList/PriceListInit`)
  );
  arr.push(PricingPolicies);
  if (route?.params?.id) {
    const pricingPolicyList = firstValueFrom(
      dataService.get(`${apiUrl}/PriceList/GetById`, {
        params: { id: route.params.id },
      })
    );
    arr.push(pricingPolicyList);
  }

  return combineLatest([...arr]);
};
