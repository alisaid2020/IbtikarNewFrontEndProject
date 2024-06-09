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
    let showOverlayValue: boolean = this.helpers.showOverlay();
    this.helpers.showOverlay.set(!showOverlayValue);
    multiSelect.show();
  }

  gekKeys(element: any, previousPath = ''): any {
    let Keys: any = [];
    if (Array.isArray(element)) {
      return element;
    }
    Object.keys(element || {}).forEach((el) => {
      const currentPath = previousPath.length ? `${previousPath}.${el}` : el;
      if (!Array.isArray(element[el])) {
        if (element[el] instanceof Object) {
          this.gekKeys(element[el], currentPath);
        } else {
          Keys.push(currentPath);
        }
      }
    });
    return Keys;
  }

  tableColumns(element: any, defaultSelected?: any[]) {
    this.objectKeys = this.gekKeys(element)?.filter(
      (el: any) => !/Guid/gi.test(el)
    );
    this.allColumns = [];
    this.objectKeys?.forEach((el: any) => {
      let defaultItem = defaultSelected?.find((x) => x.field === el);
      el = defaultItem?.header || el;
      this.subs.push(
        this.translate.get(`${el}`).subscribe((translatedValue: any) => {
          const isItemThere = this.allColumns.find((x) => x.field === el);
          const index = this.allColumns.indexOf(isItemThere);
          if (isItemThere) {
            this.allColumns[index] = {
              field: defaultItem?.field || el,
              translatedName: translatedValue,
              header: el,
            };
            return;
          }
          this.allColumns.push({
            field: defaultItem?.field || el,
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
    selectedColumns: any,
    type?: any
  ): Promise<any> {
    if (this.helpers.checkItemFromLocalStorage(defaultStorage)) {
      let arr = this.helpers.getItemFromLocalStorage(defaultStorage);
      let i = arr?.findIndex((el: any) => el?.type === type);
      if (type) {
        selectedColumns = i >= 0 ? arr[i].selected : defaultSelected;
      } else {
        selectedColumns = arr;
      }
    } else {
      selectedColumns = defaultSelected;
    }
    this.changedColumns = selectedColumns;
    let newArray: any[] = [];
    this.changedColumns.forEach((item: any) => {
      this.subs.push(
        this.translate
          .get(`${item.header}`)
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
