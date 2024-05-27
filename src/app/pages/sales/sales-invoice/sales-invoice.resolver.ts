import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { salesInvoicesApi } from '@constants/api.constant';
import { PAGE_SIZE } from '@constants/general.constant';
import { DataService } from '@services/data.service';
import { firstValueFrom } from 'rxjs';

export const salesInvoiceResolver: ResolveFn<any> = () => {
  let dataService = inject(DataService);
  return firstValueFrom(
    dataService.get(`${salesInvoicesApi}`, {
      params: {
        pageNumber: 1,
        pageSize: PAGE_SIZE,
      },
    })
  );
};

export const salesInvoiceDetailsResolver: ResolveFn<any> = (route) => {
  let dataService = inject(DataService);
  return firstValueFrom(dataService.get(`${salesInvoicesApi}`));
};
