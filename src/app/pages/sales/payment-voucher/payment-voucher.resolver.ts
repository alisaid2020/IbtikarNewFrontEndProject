import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { apiUrl } from '@constants/api.constant';
import { DataService } from '@services/data.service';
import { firstValueFrom } from 'rxjs';

export const paymentVoucherListResolver: ResolveFn<any> = () => {
  let dataService = inject(DataService);
  return firstValueFrom(
    dataService.get(
      `${apiUrl}/XtraAndPos_TreasuryManagement/TreasuryTransactionOutList`
    )
  );
};

export const paymentVoucherResolver: ResolveFn<any> = (route) => {
  let dataService = inject(DataService);
  return firstValueFrom(
    dataService.get(
      `${apiUrl}/XtraAndPos_TreasuryManagement/GetTreasuryOut?TrreasuryId=${route.params.id}`
    )
  );
};
