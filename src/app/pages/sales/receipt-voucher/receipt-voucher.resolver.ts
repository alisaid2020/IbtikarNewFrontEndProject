import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { apiUrl, receiptVouchersApi } from '@constants/api.constant';
import { PAGE_SIZE } from '@constants/general.constant';
import { DataService } from '@services/data.service';
import { firstValueFrom } from 'rxjs';

export const receiptVouchersListResolver: ResolveFn<any> = () => {
  let dataService = inject(DataService);
  return firstValueFrom(
    dataService.get(receiptVouchersApi, {
      params: { pageNumber: 1, pageSize: PAGE_SIZE },
    })
  );
};

export const receiptVoucherResolver: ResolveFn<any> = (route) => {
  let dataService = inject(DataService);
  return firstValueFrom(
    dataService.get(
      `${apiUrl}/XtraAndPos_TreasuryManagement/GetTreasuryIn?TrreasuryId=${route.params.id}`
    )
  );
};
