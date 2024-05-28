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
        if (typeof element[el] === 'object') {
          this.gekKeys(element[el], currentPath);
        } else {
          Keys.push(currentPath);
        }
      }
    });
    return Keys;
  }

  tableColumns(element: any) {
    this.objectKeys = this.gekKeys(element)?.filter(
      (el: any) => !/Id/gi.test(el)
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
