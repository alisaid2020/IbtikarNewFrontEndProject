import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { pricingPolicyApi } from '@constants/api.constant';
import { DataService } from '@services/data.service';
import { firstValueFrom } from 'rxjs';

export const pricingPolicyResolver: ResolveFn<boolean> = (route, state) => {
  const dataService = inject(DataService);
  return firstValueFrom(
    dataService.get(`${pricingPolicyApi}/PricingPolicyInfo`)
  );
};
