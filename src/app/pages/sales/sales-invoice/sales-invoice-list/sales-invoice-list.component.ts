import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { apiUrl, salesInvoicesApi } from '@constants/api.constant';
import { PAGE_SIZE } from '@constants/general.constant';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { DataService } from '@services/data.service';
import { ToastService } from '@services/toast-service';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subscription, firstValueFrom, map, tap } from 'rxjs';
import { ConfirmModalComponent } from 'src/app/shared/components/confirm-modal/confirm-modal.component';
import { Toast } from 'src/app/shared/enums/toast.enum';
import { HelpersService } from '@services/helpers.service';
import { TableService } from '@services/table.service';
import { IPagination } from '@models/IPagination.model';

@Component({
  selector: 'app-sales-invoice',
  templateUrl: './sales-invoice-list.component.html',
})
export class SalesInvoiceListComponent implements OnInit, OnDestroy {
  pageNo = 1;
  pagination: IPagination;
  filters: any;
  invoices: any;
  changedColumns: any;
  pageSize: number = PAGE_SIZE;
  showClearFilters: any;
  filterForm: FormGroup;
  allColumns: any[] = [];
  subs: Subscription[] = [];
  isUserShiftOpened: boolean;
  _selectedColumns: any[] = [];
  tableStorage = 'sales-invoice-list-table';
  defaultStorage = 'sales-invoice-list-default-selected';
  defaultSelected: any[] = [
    { field: 'DocNo', header: 'DocNo' },
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
  fb = inject(FormBuilder);
  modal = inject(NgbModal);
  toast = inject(ToastService);

  async ngOnInit() {
    firstValueFrom(
      this.route.data.pipe(
        map((res) => res.invoiceList),
        tap((res) => {
          if (res?.IsSuccess) {
            this.setData(res);
          }
        })
      )
    );
    this.checkIfUserShiftOpened();
    this.initForm();
    await this.InitTable();
  }

  initForm(): void {
    let fromDate;
    let toDate;
    this.filterForm = this.fb.group({
      fromDate: [fromDate, [Validators.required]],
      toDate: [toDate, [Validators.required]],
    });
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
    this.allColumns = this.tableService.tableColumns(this.invoices[0]);
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

  page(ev: any) {
    this.pageNo = ev;
    this.getInvoices();
  }

  getInvoices(): void {
    this.spinner.show();
    let params = {
      pageNumber: this.pageNo,
      pageSize: this.pageSize,
      ...this.filters,
    };
    firstValueFrom(
      this.dataService
        .get(`${salesInvoicesApi}`, {
          params,
        })
        .pipe(
          tap((res) => {
            if (res?.Obj) {
              this.setData(res);
              this.spinner.hide();
            }
          })
        )
    );
  }

  setData(res: any): void {
    this.invoices = res.Obj.trx;
    this.pagination = {
      TotalCount: res.Obj.totalCount,
    };
  }

  applyFilter(): void {
    Object.keys(this.filterForm.value).forEach((el) => {
      if (this.filterForm.value[el] === null) {
        delete this.filterForm.value[el];
        return;
      }
      this.showClearFilters = true;
    });
    this.filters = {
      toDate: this.filterForm.value.toDate.toISOString(),
      fromDate: this.filterForm.value.fromDate.toISOString(),
    };
    this.getInvoices();
  }

  clearFilters(): void {
    this.filterForm.reset();
    this.filters = {};
    this.showClearFilters = false;
    this.pageNo = 1;
    this.getInvoices();
  }

  delete(item: any): void {
    const modalRef = this.modal.open(ConfirmModalComponent);
    modalRef.componentInstance.modalInfo = {
      title: 'deleteSalesInvoice',
      description: `areYouSureToDelete`,
      name: `${this.translate.instant('salesInvoice')} ${item.DocNo} `,
    };
    modalRef.result.then((res) => {
      if (res) {
        this.spinner.show();
        firstValueFrom(
          this.dataService
            .delete(`${apiUrl}/ExtraAndPOS_SaleInvoice/Delete`, {
              params: { id: item.Id },
            })
            .pipe(
              tap((res) => {
                if (res?.IsSuccess) {
                  this.toast.show(Toast.deleted, {
                    classname: Toast.success,
                  });
                  this.getInvoices();
                }
              })
            )
        );
      }
    });
  }

  downloadPdf(id: any): void {
    firstValueFrom(
      this.dataService
        .get(`${apiUrl}/XtraAndPOS_SaleInvoices/PrintInvoice`, {
          params: { id },
        })
        .pipe(
          tap((res) => {
            if (res?.IsSuccess) {
              this.helpers.getPdfFromBase64(
                res.Obj.LayoutData,
                res.Obj.DisplayName
              );
            }
          })
        )
    );
  }

  checkIfUserShiftOpened(): void {
    firstValueFrom(
      this.dataService
        .get(`${apiUrl}/ExtraAndPOS_Shift/IsUserShiftOpened`)
        .pipe(
          tap((res) => {
            if (res?.Obj?.IsUserShiftOpened) {
              this.isUserShiftOpened = res.Obj.IsUserShiftOpened;
            }
          })
        )
    );
  }

  ngOnDestroy(): void {
    this.subs.forEach((sub) => sub.unsubscribe());
  }
}
