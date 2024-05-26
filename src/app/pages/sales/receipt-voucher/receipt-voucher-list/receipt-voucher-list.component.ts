import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { apiUrl } from '@constants/api.constant';
import { TranslateService } from '@ngx-translate/core';
import { DataService } from '@services/data.service';
import { HelpersService } from '@services/helpers.service';
import { TableService } from '@services/table.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subscription, firstValueFrom, map, tap } from 'rxjs';

@Component({
  selector: 'app-receipt-voucher-list',
  templateUrl: './receipt-voucher-list.component.html',
})
export class ReceiptVoucherListComponent implements OnInit {
  changedColumns: any;
  allColumns: any[] = [];
  receiptVouchersList: any;
  subs: Subscription[] = [];
  _selectedColumns: any[] = [];
  tableStorage = 'receipt-voucher-list-table';
  defaultStorage = 'receipt-voucher-list-default-selected';
  defaultSelected: any[] = [
    { field: 'DocNo', header: 'DocNo' },
    { field: 'DocDate', header: 'DocDate' },
    { field: 'TreasuryType', header: 'TreasuryType' },
    { field: 'TotalAmount', header: 'TotalAmount' },
    { field: 'Notes', header: 'Notes' },
  ];
  set selectedColumns(val: any[]) {
    this._selectedColumns = this.defaultSelected.filter((col: any) =>
      val.includes(col)
    );
  }

  route = inject(ActivatedRoute);
  tableService = inject(TableService);
  spinner = inject(NgxSpinnerService);
  translate = inject(TranslateService);
  helpers = inject(HelpersService);
  dataService = inject(DataService);

  async ngOnInit() {
    firstValueFrom(
      this.route.data.pipe(
        map((res) => res.receiptVouchersList),
        tap((res) => {
          if (res?.IsSuccess) {
            this.receiptVouchersList = res.Obj.list;
          }
        })
      )
    );
    await this.InitTable();
  }

  async InitTable() {
    await this.initTableColumns();
    this.subs.push(
      this.translate.onLangChange.subscribe(async () => {
        await this.initTableColumns();
      })
    );
  }

  async initTableColumns() {
    this.allColumns = this.tableService.tableColumns(
      this.receiptVouchersList[0]
    );
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

  downloadPdf(id: number): void {
    firstValueFrom(
      this.dataService
        .post(
          `${apiUrl}/XtraAndPosMobileReport/TreasuryTransaction?id=${id}`,
          null
        )
        .pipe(
          tap((res) => {
            if (res?.IsSuccess) {
              this.helpers.getPdfFromBase64(
                res.Obj.LayoutData,
                res.Obj?.DisplayName
              );
            }
          })
        )
    );
  }
}
