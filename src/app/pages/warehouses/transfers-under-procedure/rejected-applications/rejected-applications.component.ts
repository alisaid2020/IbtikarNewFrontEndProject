import { Component, OnInit, inject } from '@angular/core';
import { treasuryManagementApi } from '@constants/api.constant';
import { PAGE_SIZE } from '@constants/general.constant';
import { IPagination } from '@models/IPagination.model';
import { TranslateService } from '@ngx-translate/core';
import { DataService } from '@services/data.service';
import { HelpersService } from '@services/helpers.service';
import { TableService } from '@services/table.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subscription, firstValueFrom, tap } from 'rxjs';

@Component({
  selector: 'app-rejected-applications',
  templateUrl: './rejected-applications.component.html',
})
export class RejectedApplicationsComponent implements OnInit {
  changedColumns: any;
  allColumns: any[] = [];
  pagination: IPagination;
  subs: Subscription[] = [];
  rejectedTransfers: any[];
  _selectedColumns: any[] = [];
  tableStorage = 'transfers-under-procedure-table';
  defaultStorage = 'transfers-under-procedure-default-selected';
  defaultSelected: any[] = [
    { field: 'BranchName', header: 'BranchName' },
    { field: 'CreatedDate', header: 'CreatedDate' },
    { field: 'TotalInvoice', header: 'TotalInvoice' },
    { field: 'TotalDisc', header: 'TotalDisc' },
    { field: 'TotalInvoiceAfterVat', header: 'TotalInvoiceAfterVat' },
  ];

  helpers = inject(HelpersService);
  dataService = inject(DataService);
  tableService = inject(TableService);
  spinner = inject(NgxSpinnerService);
  translate = inject(TranslateService);

  async ngOnInit() {
    this.getApplicationsUnderProcedure();
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
      this.rejectedTransfers[0],
      this.defaultSelected
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
        (el: any) => el === ev.itemValue.field
      );
      if (tsIndex >= 0) {
        ts.columnOrder.splice(tsIndex, 1);
      } else {
        ts.columnOrder.push(ev.itemValue.field);
      }
      this.helpers.setItemToLocalStorage(this.tableStorage, ts);
    }
  }

  getApplicationsUnderProcedure(): void {
    this.spinner.show();
    let params = {
      pageNumber: this.pagination?.PageNumber || 1,
      pageSize: this.pagination?.PageSize || PAGE_SIZE,
      statues: 3,
    };
    firstValueFrom(
      this.dataService
        .get(`${treasuryManagementApi}/GetPagedTransferPending`, { params })
        .pipe(
          tap(async (res) => {
            if (res?.Success) {
              this.spinner.hide();
              this.setData(res.Data.Obj);
              await this.InitTable();
            }
          })
        )
    );
  }

  setData(res: any): void {
    this.rejectedTransfers = res.PagedResult;

    this.pagination = {
      PageNumber: res.PageNumber,
      PageSize: res.PageSize,
      TotalCount: res.TotalCount,
    };
  }

  page(ev: any) {
    this.pagination.PageNumber = ev;
    this.getApplicationsUnderProcedure();
  }
}
