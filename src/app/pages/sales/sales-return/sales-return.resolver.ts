import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { apiUrl } from '@constants/api.constant';
import { PAGE_SIZE } from '@constants/general.constant';
import { DataService } from '@services/data.service';
import { firstValueFrom } from 'rxjs';

export const salesReturnResolver: ResolveFn<boolean> = (route, state) => {
  let dataService = inject(DataService);
  return firstValueFrom(
    dataService.get(
      `${apiUrl}/XtraAndPos_MobileLookups/GetPagedSaleInvoicesReturnByDate`,
      {
        params: {
          pageNumber: 1,
          pageSize: PAGE_SIZE,
        },
      }
    )
  );
};
