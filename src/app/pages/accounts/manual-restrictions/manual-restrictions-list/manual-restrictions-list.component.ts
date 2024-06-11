import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { apiUrl, treasuryManagementApi } from '@constants/api.constant';
import { PAGE_SIZE } from '@constants/general.constant';
import { Toast } from '@enums/toast.enum';
import { IPagination } from '@models/IPagination.model';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { DataService } from '@services/data.service';
import { HelpersService } from '@services/helpers.service';
import { TableService } from '@services/table.service';
import { ToastService } from '@services/toast-service';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subscription, firstValueFrom, map, tap } from 'rxjs';
import { ConfirmModalComponent } from 'src/app/shared/components/confirm-modal/confirm-modal.component';

@Component({
  selector: 'app-manual-restrictions-list',
  templateUrl: './manual-restrictions-list.component.html',
})
export class ManualRestrictionsListComponent implements OnInit {
  pageNo = 1;
  changedColumns: any;
  allColumns: any[] = [];
  pagination: IPagination;
  subs: Subscription[] = [];
  manualRestrictionsList: any;
  _selectedColumns: any[] = [];
  tableStorage = 'manual-restrictions-list-table';
  defaultStorage = 'manual-restrictions-list-default-selected';
  defaultSelected: any[] = [
    { field: 'DocNo', header: 'serial' },
    { field: 'BranchName', header: 'BranchName' },
    { field: 'DocDate', header: 'DocDate' },
    { field: 'DocName', header: 'DocName' },
    { field: 'CrAmount', header: 'CrAmount' },
    { field: 'DrAmount', header: 'DrAmount' },
  ];

  modal = inject(NgbModal);
  toast = inject(ToastService);
  route = inject(ActivatedRoute);
  helpers = inject(HelpersService);
  dataService = inject(DataService);
  tableService = inject(TableService);
  spinner = inject(NgxSpinnerService);
  translate = inject(TranslateService);

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
    this.allColumns = this.tableService.tableColumns(
      this.manualRestrictionsList[0],
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

  delete(item: any) {
    let formData = {
      status: 0,
      docId: item.Id,
      DocNo: 0,
      type: '',
      docDate: item.DocDate,
      fromDate: new Date(),
      toDate: new Date(),
      creditValue: 0,
    };
    const modalRef = this.modal.open(ConfirmModalComponent);
    modalRef.componentInstance.modalInfo = {
      title: 'deleteManualRestriction',
      description: 'areYouSureToDelete',
      name: this.translate.instant('manualRestrictionList'),
    };
    modalRef.result.then((res) => {
      if (res) {
        this.spinner.show();
        firstValueFrom(
          this.dataService
            .post(`${apiUrl}/ExtraAndPOS_Gl/Delete`, formData)
            .pipe(
              tap((res) => {
                if (res?.IsSuccess) {
                  this.spinner.hide();
                  this.toast.show(Toast.deleted, {
                    classname: Toast.success,
                  });
                  this.getManualRestrictions();
                }
              })
            )
        );
      }
    });
  }
}
