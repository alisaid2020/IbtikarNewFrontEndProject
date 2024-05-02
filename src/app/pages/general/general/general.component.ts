import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { HelpersService } from 'src/app/shared/services/helpers.service';
import { TableService } from 'src/app/shared/services/table.service';

@Component({
  selector: 'app-general',
  templateUrl: './general.component.html',
})
export class GeneralComponent implements OnInit, OnDestroy {
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
  allColumns: any[] = [];
  defaultStorage = 'general-default-selected';
  tableStorage = 'general-table';
  changedColumns: any;
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
  translate = inject(TranslateService);
  helpers = inject(HelpersService);
  tableService = inject(TableService);

  async ngOnInit() {
    await this.initTableColumns();
    this.subs.push(
      this.translate.onLangChange.subscribe(async () => {
        await this.initTableColumns();
      })
    );
  }

  async initTableColumns() {
    this.allColumns = this.tableService.tableColumns(this.products[0]);
    [this.changedColumns, this._selectedColumns] =
      await this.tableService.storageFn(
        this.defaultSelected,
        this.defaultStorage,
        this._selectedColumns
      );
  }

  changeInHideShow(ev: any): void {
    this._selectedColumns = ev.value;
    this.helpers.setItemToLocalStorage(
      this.defaultStorage,
      this._selectedColumns
    );
    if (this.helpers.checkItemFromLocalStorage(this.tableStorage)) {
      let ts = this.helpers.getItemFromLocalStorage(this.tableStorage);
      let tsIndex: any = ts?.columnOrder.findIndex(
        (el: any) => el === ev.itemValue.header
      );
      if (tsIndex >= 0) {
        ts.columnOrder.splice(tsIndex, 1);
      } else {
        ts.columnOrder.push(ev.itemValue.field);
      }
      this.helpers.setItemToLocalStorage(this.tableStorage, ts);
    }
  }

  ngOnDestroy(): void {
    this.subs.forEach((sub) => sub.unsubscribe());
  }
}
