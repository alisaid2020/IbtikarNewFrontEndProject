import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { apiUrl } from '@constants/api.constant';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { DataService } from '@services/data.service';
import { HelpersService } from '@services/helpers.service';
import { TableService } from '@services/table.service';
import { ToastService } from '@services/toast-service';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subscription, firstValueFrom, map, tap } from 'rxjs';
import { ConfirmModalComponent } from 'src/app/shared/components/confirm-modal/confirm-modal.component';
import { Toast } from 'src/app/shared/enums/toast.enum';
import { IPagination } from 'src/app/shared/models/IPagination.model';

@Component({
  selector: 'app-pricing-policy-lists',
  templateUrl: './pricing-policy-lists.component.html',
})
export class PricingPolicyListsComponent implements OnInit, OnDestroy {
  _selectedColumns: any[] = [];
  subs: Subscription[] = [];
  allColumns: any[] = [];
  pagination: IPagination;
  defaultStorage = 'pricing-policy-lists-default-selected';
  tableStorage = 'pricing-policy-lists-table';
  changedColumns: any;
  pricingPolicyLists: any;
  defaultSelected: any[] = [
    { field: 'BranchName', header: 'BranchName' },
    { field: 'CreatedDate', header: 'CreatedDate' },
    { field: 'PricePolicyName', header: 'PricePolicyName' },
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
        map((res) => res.pricingPolicyLists),
        tap((res) => {
          if (res?.IsSuccess) {
            this.setData(res.Obj);
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
      this.pricingPolicyLists[0]
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

  delete(item: any) {
    const modalRef = this.modal.open(ConfirmModalComponent);
    modalRef.componentInstance.modalInfo = {
      title: 'deletePricingPolicyLists',
      description: 'areYouSureToDelete',
      name: this.translate.instant('PricingPolicyList'),
    };
    modalRef.result.then((res) => {
      if (res) {
        this.spinner.show();
        firstValueFrom(
          this.dataService
            .delete(`${apiUrl}/XtraAndPos_PricePolicyList/Delete`, {
              params: { id: item.Id },
            })
            .pipe(
              tap((res) => {
                if (res?.IsSuccess) {
                  this.spinner.hide();
                  this.toast.show(Toast.deleted, {
                    classname: Toast.success,
                  });
                  this.getPricingPolicyLists();
                }
              })
            )
        );
      }
    });
  }

  getPricingPolicyLists(): void {
    let params = {
      pageNumber: this.pagination.PageNumber,
      pageSize: this.pagination.PageSize,
    };
    firstValueFrom(
      this.dataService
        .get(`${apiUrl}/XtraAndPos_PricePolicyList/GetPagedPriceList`, {
          params,
        })
        .pipe(
          tap((res) => {
            if (res?.IsSuccess) {
              this.setData(res?.Obj);
            }
          })
        )
    );
  }

  page(pageNo: any) {
    this.pagination.PageNumber = pageNo;
    this.getPricingPolicyLists();
  }

  setData(res: any): void {
    this.pricingPolicyLists = res.PagedResult;
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
