import { Component, OnInit } from '@angular/core';
import { Subscription, tap } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { HelpersService } from 'src/app/shared/services/helpers.service';

@Component({
  selector: 'app-general',
  templateUrl: './general.component.html',
})
export class GeneralComponent implements OnInit {
  products = [
    {
      id: 1,
      branch: 'Laptop',
      price: 999.99,
      category: 'Electronics',
    },
    {
      id: 2,
      branch: 'Headphones',
      price: 129.99,
      category: 'Electronics',
    },
    {
      id: 3,
      branch: 'Book',
      price: 19.99,
      category: 'Books',
    },
    {
      id: 4,
      branch: 'T-shirt',
      price: 29.99,
      category: 'Clothing',
    },
  ];
  _selectedColumns: any[] = [];
  subs: Subscription[] = [];
  objectKeys: any = [];
  allColumns: any[] = [];
  defaultStorage = 'general-default-selected';
  changedColumns: any;
  showOverlay: boolean;
  defaultSelected: any[] = [
    { field: 'branch', header: 'branch' },
    { field: 'category', header: 'category' },
    { field: 'price', header: 'price' },
  ];

  set selectedColumns(val: any[]) {
    this._selectedColumns = this.defaultSelected.filter((col: any) =>
      val.includes(col)
    );
  }
  get selectedColumns(): any[] {
    return this._selectedColumns;
  }

  constructor(
    private translate: TranslateService,
    private helpers: HelpersService
  ) {}

  ngOnInit(): void {
    this.getObjectKeys(this.products[0]);
    this.tableColumns();
    this.storageFn();
    this.subs.push(
      this.translate.onLangChange.subscribe(async () => {
        this.tableColumns();
        this.storageFn();
      })
    );
  }

  getObjectKeys(obj: any, previousPath = ''): void {
    Object.keys(obj || {}).forEach((el) => {
      const currentPath = previousPath.length ? `${previousPath}.${el}` : el;
      if (!Array.isArray(obj[el])) {
        if (typeof obj[el] === 'object') {
          this.getObjectKeys(obj[el], currentPath);
        } else {
          this.objectKeys.push(currentPath);
        }
      }
    });
  }

  tableColumns(): void {
    this.objectKeys = this.objectKeys.filter((el: any) => !/id/gi.test(el));
    this.allColumns = [];
    this.objectKeys.forEach((el: any) => {
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
  }
  async storageFn(): Promise<any> {
    if (this.helpers.checkItemFromLocalStorage(this.defaultStorage)) {
      this._selectedColumns = this.helpers.getItemFromLocalStorage(
        this.defaultStorage
      );
    } else {
      this._selectedColumns = this.defaultSelected;
    }
    this.changedColumns = this._selectedColumns;
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
  }

  changeInHideShow(ev: any): void {
    this._selectedColumns = ev.value;
    this.helpers.setItemToLocalStorage(
      this.defaultStorage,
      this._selectedColumns
    );
    if (this.helpers.checkItemFromLocalStorage('general-table')) {
      let ts = this.helpers.getItemFromLocalStorage('general-table');
      let tsIndex: any = ts?.columnOrder.findIndex(
        (el: any) => el === ev.itemValue.header
      );
      if (tsIndex >= 0) {
        ts.columnOrder.splice(tsIndex, 1);
      } else {
        ts.columnOrder.push(ev.itemValue.field);
      }
      this.helpers.setItemToLocalStorage('general-table', ts);
    }
  }
  openMultiselect(multiSelect: any): void {
    this.showOverlay = !this.showOverlay;
    multiSelect.show();
  }
}
