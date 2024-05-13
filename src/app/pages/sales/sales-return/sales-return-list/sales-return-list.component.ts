import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { apiUrl } from '@constants/api.constant';
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
  selector: 'app-sales-return-list',
  templateUrl: './sales-return-list.component.html',
})
export class SalesReturnListComponent implements OnInit, OnDestroy {
  _selectedColumns: any[] = [];
  pageNo: number = 1;
  filters: any = {};
  subs: Subscription[] = [];
  allColumns: any[] = [];
  pagination: IPagination;
  defaultStorage = 'sales-return-default-selected';
  tableStorage = 'sales-return-table';
  changedColumns: any;
  salesReturnList: any;
  defaultSelected: any[] = [
    { field: 'Id', header: 'Id' },
    { field: 'BranchName', header: 'BranchName' },
    { field: 'CreatedDate', header: 'CreatedDate' },
    { field: 'TotalInvoice', header: 'TotalInvoice' },
    { field: 'TotalDisc', header: 'TotalDisc' },
    { field: 'TotalInvoiceAfterVat', header: 'TotalInvoiceAfterVat' },
  ];
  set selectedColumns(val: any[]) {
    this._selectedColumns = this.defaultSelected.filter((col: any) =>
      val.includes(col)
    );
  }

  translate = inject(TranslateService);
  helpers = inject(HelpersService);
  tableService = inject(TableService);
  dataService = inject(DataService);
  route = inject(ActivatedRoute);
  spinner = inject(NgxSpinnerService);
  toast = inject(ToastService);
  modal = inject(NgbModal);

  async ngOnInit() {
    firstValueFrom(
      this.route.data.pipe(
        map((res) => res.salesReturn),
        tap((res) => {
          // this.setData(res.Obj.trx);
          this.salesReturnList = res.Obj.trx;
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
    this.allColumns = this.tableService.tableColumns(this.salesReturnList[0]);
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

  delete(item: any): void {
    const modalRef = this.modal.open(ConfirmModalComponent);
    modalRef.componentInstance.modalInfo = {
      title: 'deleteSalesReturn',
      description: 'areYouSureToDelete',
      name: this.translate.instant('salesReturn'),
    };
    modalRef.result.then((res) => {
      if (res) {
        this.spinner.show();
        firstValueFrom(
          this.dataService
            .delete(
              `${apiUrl}/ExtraAndPOS_ReturnSaleInvoice/DeleteReturnSaleInvoice`,
              {
                params: { id: item.Id },
              }
            )
            .pipe(
              tap((_) => {
                this.toast.show(Toast.deleted, {
                  classname: Toast.success,
                });
                this.getSalesReturnList();
              })
            )
        );
      }
    });
  }

  downloadPdf(id: any): void {
    firstValueFrom(
      this.dataService
        .get(`${apiUrl}/XtraAndPOS_SaleInvoices/PrintReturnInvoice`, {
          params: { id },
        })
        .pipe(
          tap((res) => {
            this.helpers.getPdfFromBase64(
              res.Obj.LayoutData,
              res.Obj.DisplayName
            );
          })
        )
    );
  }

  getSalesReturnList(): void {
    let params = {
      pageNumber: this.pagination.PageNumber,
      pageSize: this.pagination.PageSize,
    };
    firstValueFrom(
      this.dataService
        .get(`${apiUrl}/XtraAndPos_MobileLookups/GetPagedSaleInvoicesReturn`, {
          params,
        })
        .pipe(
          tap((res) => {
            this.salesReturnList = res.Obj.trx;
            this.spinner.hide();
            // this.setData(res?.Obj);
          })
        )
    );
  }

  page(pageNo: any) {
    this.pagination.PageNumber = pageNo;
    this.getSalesReturnList();
  }

  setData(res: any): void {
    this.salesReturnList = res.PagedResult;
    this.pagination = {
      PageSize: res.PageSize,
      PageNumber: res.PageNumber,
      TotalCount: res.TotalCount,
    };
  }

  ngOnDestroy(): void {
    this.subs.forEach((sub) => sub.unsubscribe());
  }
}
