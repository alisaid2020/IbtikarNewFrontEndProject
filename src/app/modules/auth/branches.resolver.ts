import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { branchesApi } from '@constants/api.constant';
import { DataService } from '@services/data.service';
import { firstValueFrom } from 'rxjs';

export const branchesResolver: ResolveFn<any> = (route, state) => {
  let dataService = inject(DataService);
  return firstValueFrom(dataService.get(`${branchesApi}/GetAllForDropDown`));
};
