import { Injectable, inject } from '@angular/core';
import { HelpersService } from './helpers.service';
import { MultiSelect } from 'primeng/multiselect';
import { TranslateService } from '@ngx-translate/core';
import { Subscription, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TableService {
  objectKeys: any = [];
  allColumns: any[] = [];
  changedColumns: any;
  subs: Subscription[] = [];

  helpers = inject(HelpersService);
  translate = inject(TranslateService);

  openMultiselect(multiSelect: MultiSelect): void {
    let showOverlayValue: boolean = this.helpers.showOverlay$.getValue();
    this.helpers.showOverlay$.next(!showOverlayValue);
    multiSelect.show();
  }

  getObjectKeys(obj: any, previousPath = ''): any {
    let Keys: any = [];
    Object.keys(obj || {}).forEach((el) => {
      const currentPath = previousPath.length ? `${previousPath}.${el}` : el;
      if (!Array.isArray(obj[el])) {
        if (typeof obj[el] === 'object') {
          this.getObjectKeys(obj[el], currentPath);
        } else {
          Keys.push(currentPath);
        }
      }
    });
    return Keys;
  }

  tableColumns(obj: any) {
    this.objectKeys = this.getObjectKeys(obj)?.filter(
      (el: any) => !/id/gi.test(el)
    );
    this.allColumns = [];
    this.objectKeys?.forEach((el: any) => {
      this.subs.push(
        this.translate.get(`${el}`).subscribe((translatedValue: any) => {
          const isItemThere = this.allColumns.find((x) => x.field === el);
          const index = this.allColumns.indexOf(isItemThere);
          if (isItemThere) {
            this.allColumns[index] = {
              field: el,
              translatedName: translatedValue,
              header: el,
            };
            return;
          }
          this.allColumns.push({
            field: el,
            translatedName: translatedValue,
            header: el,
          });
        })
      );
    });
    return this.allColumns;
  }

  async storageFn(
    defaultSelected: any,
    defaultStorage: any,
    selectedColumns: any
  ): Promise<any> {
    if (this.helpers.checkItemFromLocalStorage(defaultStorage)) {
      selectedColumns = this.helpers.getItemFromLocalStorage(defaultStorage);
    } else {
      selectedColumns = defaultSelected;
    }
    this.changedColumns = selectedColumns;
    let newArray: any[] = [];
    this.changedColumns.forEach((item: any) => {
      this.subs.push(
        this.translate
          .get(`${item.field}`)
          .pipe(
            tap((value) => {
              newArray.push({
                ...item,
                translatedName: value,
              });
            })
          )
          .subscribe()
      );
    });
    this.changedColumns = newArray;
    return [this.changedColumns, selectedColumns];
  }
}
