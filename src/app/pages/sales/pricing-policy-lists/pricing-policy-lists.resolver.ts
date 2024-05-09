import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { apiUrl } from '@constants/api.constant';
import { PAGE_SIZE } from '@constants/general.constant';
import { DataService } from '@services/data.service';
import { combineLatest, firstValueFrom } from 'rxjs';

export const pricingPolicyListsResolver: ResolveFn<any> = (route, state) => {
  let dataService = inject(DataService);
  return firstValueFrom(
    dataService.get(`${apiUrl}/XtraAndPos_PricePolicyList/GetPagedPriceList`, {
      params: {
        pageNumber: 1,
        pageSize: PAGE_SIZE,
      },
    })
  );
};

export const pricingPolicyListResolver: ResolveFn<any> = (route, state) => {
  let dataService = inject(DataService);
  const pricingPolicyBasicData = firstValueFrom(
    dataService.get(`${apiUrl}/PriceList/GetById`, {
      params: { id: route.params.id },
    })
  );
  const pricingPolicyLinesData = firstValueFrom(
    dataService.get(
      `${apiUrl}/XtraAndPos_PricePolicyList/GetPagedPriceListDetail`,
      {
        params: {
          pageNumber: 1,
          pageSize: PAGE_SIZE,
          priceListId: route.params.id,
        },
      }
    )
  );
  return combineLatest([pricingPolicyBasicData, pricingPolicyLinesData]);
};
