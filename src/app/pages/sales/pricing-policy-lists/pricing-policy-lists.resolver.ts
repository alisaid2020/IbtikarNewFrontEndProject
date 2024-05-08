import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { apiUrl } from '@constants/api.constant';
import { DataService } from '@services/data.service';
import { firstValueFrom } from 'rxjs';

export const pricingPolicyListsResolver: ResolveFn<any> = (route, state) => {
  let dataService = inject(DataService);
  return firstValueFrom(
    dataService.get(`${apiUrl}/XtraAndPos_PricePolicyList/GetAll`)
  );
};
