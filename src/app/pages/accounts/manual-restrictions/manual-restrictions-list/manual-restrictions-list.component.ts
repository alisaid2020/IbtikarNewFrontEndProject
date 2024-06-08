import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { apiUrl, treasuryManagementApi } from '@constants/api.constant';
import { PAGE_SIZE } from '@constants/general.constant';
import { IPagination } from '@models/IPagination.model';
import { TranslateService } from '@ngx-translate/core';
import { DataService } from '@services/data.service';
import { HelpersService } from '@services/helpers.service';
import { TableService } from '@services/table.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subscription, firstValueFrom, map, tap } from 'rxjs';

@Component({
  selector: 'app-manual-restrictions-list',
  templateUrl: './manual-restrictions-list.component.html',
})
export class ManualRestrictionsListComponent implements OnInit {
  pageNo = 1;
  manualRestrictionsList: any;
  changedColumns: any;
  subs: Subscription[] = [];
  _selectedColumns: any[] = [];
  pagination: IPagination;
  allColumns: any[] = [];
  tableStorage = 'manual-restrictions-list-table';
  defaultStorage = 'manual-restrictions-list-default-selected';
  defaultSelected: any[] = [
    { field: 'BranchName', header: 'BranchName' },
    { field: 'DocDate', header: 'DocDate' },
    { field: 'DocName', header: 'DocName' },
    { field: 'CrAmount', header: 'CrAmount' },
    { field: 'DrAmount', header: 'DrAmount' },
    { field: 'Notes', header: 'Notes' },
  ];

  dataService = inject(DataService);
  route = inject(ActivatedRoute);
  translate = inject(TranslateService);
  helpers = inject(HelpersService);
  tableService = inject(TableService);
  spinner = inject(NgxSpinnerService);

  async ngOnInit() {
    firstValueFrom(
      this.route.data.pipe(
        map((res) => res.manualRestrictions),
        tap((res) => {
          if (res.Success) {
            this.setData(res.Data.Obj);
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
    delete this.manualRestrictionsList[0]?.DocNo;
    this.allColumns = this.tableService.tableColumns(
      this.manualRestrictionsList[0]
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
    this.manualRestrictionsList = res.TreasuryTransactions;
    this.pagination = {
      PageSize: PAGE_SIZE,
      TotalCount: res.TotalCount,
    };
  }

  page(ev: any) {
    this.pageNo = ev;
    this.getManualRestrictions();
  }

  getManualRestrictions(): void {
    this.spinner.show();
    let params = {
      pageNumber: this.pageNo,
      pageSize: this.pagination.PageSize,
    };
    firstValueFrom(
      this.dataService
        .get(`${treasuryManagementApi}/GetPagedGeneralLedgerList`, { params })
        .pipe(
          tap((res) => {
            if (res?.Success) {
              this.spinner.hide();
              this.setData(res.Data.Obj);
            }
          })
        )
    );
  }

  downloadPdf(id: number): void {
    firstValueFrom(
      this.dataService
        .post(`${apiUrl}/GLReport/PrintGLSettlement?id=${id}`, null)
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
