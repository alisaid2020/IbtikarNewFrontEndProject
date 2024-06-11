import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { treasuryManagementApi } from '@constants/api.constant';
import { PAGE_SIZE } from '@constants/general.constant';
import { DataService } from '@services/data.service';
import { firstValueFrom } from 'rxjs';

export const inventoryTransfersResolver: ResolveFn<any> = () => {
  let dataService = inject(DataService);
  return firstValueFrom(
    dataService.get(`${treasuryManagementApi}/GetPagedTransfers`, {
      params: {
        pageNumber: 1,
        pageSize: PAGE_SIZE,
      },
    })
  );
};
