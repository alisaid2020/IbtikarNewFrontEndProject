import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { apiUrl, treasuryManagementApi } from '@constants/api.constant';
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
  selector: 'app-inventory-transfers',
  templateUrl: './inventory-transfers.component.html',
})
export class InventoryTransfersComponent implements OnInit {
  inventoryTransfers: any[];
  changedColumns: any;
  allColumns: any[] = [];
  pagination: IPagination;
  subs: Subscription[] = [];
  _selectedColumns: any[] = [];
  tableStorage = 'inventory-transfers-table';
  defaultStorage = 'inventory-transfers-default-selected';
  defaultSelected: any[] = [
    { field: 'BranchName', header: 'BranchName' },
    { field: 'CreatedDate', header: 'CreatedDate' },
    { field: 'TotalInvoice', header: 'TotalInvoice' },
    { field: 'TotalDisc', header: 'TotalDisc' },
    { field: 'TotalInvoiceAfterVat', header: 'TotalInvoiceAfterVat' },
  ];

  route = inject(ActivatedRoute);
  router = inject(Router);
  translate = inject(TranslateService);
  tableService = inject(TableService);
  helpers = inject(HelpersService);
  spinner = inject(NgxSpinnerService);
  dataService = inject(DataService);
  modal = inject(NgbModal);
  toast = inject(ToastService);

  async ngOnInit() {
    firstValueFrom(
      this.route.data.pipe(
        map((res) => res.inventoryTransfers),
        tap((res) => {
          if (res?.Success) {
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
      this.inventoryTransfers[0],
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
    this.inventoryTransfers = res.PagedResult;
    this.pagination = {
      PageNumber: res.PageNumber,
      PageSize: res.PageSize,
      TotalCount: res.TotalCount,
    };
  }

  page(ev: any): void {
    this.pagination.PageNumber = ev;
    this.getInventoryTransfers();
  }

  getInventoryTransfers(): void {
    this.spinner.show();
    let params = {
      pageNumber: this.pagination?.PageNumber,
      pageSize: this.pagination?.PageSize,
      statues: 1,
    };
    firstValueFrom(
      this.dataService
        .get(`${treasuryManagementApi}/GetPagedTransfers`, { params })
        .pipe(
          tap(async (res) => {
            if (res?.Success) {
              this.spinner.hide();
              this.setData(res.Data.Obj);
            }
          })
        )
    );
  }

  downloadPdf(id: any): void {
    firstValueFrom(
      this.dataService
        .post(`${apiUrl}/XtraAndPosMobileReport/StorageTransfer?id=${id}`, null)
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

  delete(id: any): void {
    const modalRef = this.modal.open(ConfirmModalComponent);
    modalRef.componentInstance.modalInfo = {
      title: 'deleteInventoryTransfer',
      description: `areYouSureToDelete`,
      name: `${this.translate.instant('inventoryTransfer')} `,
    };
    modalRef.result.then((res) => {
      if (res) {
        this.spinner.show();
        firstValueFrom(
          this.dataService
            .delete(`${apiUrl}/ExtraAndPOS_StorageTransfer/DeleteTransfer`, {
              params: { id },
            })
            .pipe(
              tap((res) => {
                if (res?.IsSuccess) {
                  this.toast.show(Toast.deleted, {
                    classname: Toast.success,
                  });
                  this.getInventoryTransfers();
                }
              })
            )
        );
      }
    });
  }
}
