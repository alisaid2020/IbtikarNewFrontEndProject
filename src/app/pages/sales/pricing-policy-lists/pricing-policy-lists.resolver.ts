import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { apiUrl, pricePolicyListApi } from '@constants/api.constant';
import { PAGE_SIZE } from '@constants/general.constant';
import { DataService } from '@services/data.service';
import { combineLatest, firstValueFrom } from 'rxjs';

export const pricingPolicyListsResolver: ResolveFn<any> = (route, state) => {
  let dataService = inject(DataService);
  return firstValueFrom(
    dataService.get(`${pricePolicyListApi}/GetPagedPriceList`, {
      params: {
        pageNumber: 1,
        pageSize: PAGE_SIZE,
      },
    })
  );
};

export const pricingPolicyListResolver: ResolveFn<any> = (route, state) => {
  let dataService = inject(DataService);
  return firstValueFrom(
    dataService.get(`${pricePolicyListApi}/GetPagedPriceListDetail`, {
      params: {
        pageNumber: 1,
        pageSize: PAGE_SIZE,
        priceListId: route.params.id,
      },
    })
  );
};
