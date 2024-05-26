import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { apiUrl, receiptVouchersApi } from '@constants/api.constant';
import { DataService } from '@services/data.service';
import { firstValueFrom } from 'rxjs';

export const receiptVouchersListResolver: ResolveFn<boolean> = () => {
  let dataService = inject(DataService);
  return firstValueFrom(dataService.get(receiptVouchersApi));
};

export const receiptVoucherResolver: ResolveFn<boolean> = (route, state) => {
  let dataService = inject(DataService);
  return firstValueFrom(
    dataService.get(
      `${apiUrl}/XtraAndPos_TreasuryManagement/GetTreasuryIn?TrreasuryId=${route.params.id}`
    )
  );
};
