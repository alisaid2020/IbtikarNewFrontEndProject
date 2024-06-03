import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { apiUrl } from '@constants/api.constant';
import { PAGE_SIZE } from '@constants/general.constant';
import { IPagination } from '@models/IPagination.model';
import { TranslateService } from '@ngx-translate/core';
import { DataService } from '@services/data.service';
import { HelpersService } from '@services/helpers.service';
import { TableService } from '@services/table.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subscription, firstValueFrom, map, tap } from 'rxjs';

@Component({
  selector: 'app-payment-voucher-list',
  templateUrl: './payment-voucher-list.component.html',
})
export class PaymentVoucherListComponent implements OnInit {
  changedColumns: any;
  pagination: IPagination;
  pageNo: number = 1;
  allColumns: any[] = [];
  paymentVouchersList: any;
  subs: Subscription[] = [];
  _selectedColumns: any[] = [];
  tableStorage = 'payment-voucher-list-table';
  defaultStorage = 'payment-voucher-list-default-selected';
  defaultSelected: any[] = [
    { field: 'BranchName', header: 'BranchName' },
    { field: 'DocDate', header: 'DocDate' },
    { field: 'TreasuryType', header: 'TreasuryType' },
    { field: 'TotalAmount', header: 'TotalAmount' },
    { field: 'Notes', header: 'Notes' },
  ];

  route = inject(ActivatedRoute);
  tableService = inject(TableService);
  spinner = inject(NgxSpinnerService);
  translate = inject(TranslateService);
  helpers = inject(HelpersService);
  dataService = inject(DataService);

  async ngOnInit() {
    firstValueFrom(
      this.route.data.pipe(
        map((res) => res.paymentVouchersList),
        tap((res) => {
          if (res?.IsSuccess) {
            this.paymentVouchersList = res.Obj.list;
            // this.setData(res.Obj);
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
    delete this.paymentVouchersList[0]?.DocNo;
    this.allColumns = this.tableService.tableColumns(
      this.paymentVouchersList[0]
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

  setData(res: any): void {
    this.paymentVouchersList = res.TreasuryTransactions;
    this.pagination = {
      PageSize: PAGE_SIZE,
      TotalCount: res.TotalCount,
    };
  }

  downloadPdf(id: number): void {
    firstValueFrom(
      this.dataService
        .post(
          `${apiUrl}/XtraAndPosMobileReport/TreasuryTransactionOut?id=${id}`,
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
