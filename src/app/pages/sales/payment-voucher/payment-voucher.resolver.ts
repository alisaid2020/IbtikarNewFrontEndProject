import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { apiUrl } from '@constants/api.constant';
import { PAGE_SIZE } from '@constants/general.constant';
import { DataService } from '@services/data.service';
import { firstValueFrom } from 'rxjs';

export const paymentVoucherListResolver: ResolveFn<any> = () => {
  let dataService = inject(DataService);
  return firstValueFrom(
    dataService.get(
      `${apiUrl}/XtraAndPos_TreasuryManagement/GetPagedTreasuryTransactionOutList`,
      {
        params: { pageNumber: 1, pageSize: PAGE_SIZE },
      }
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
