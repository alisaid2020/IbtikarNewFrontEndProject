import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { pricingPolicyApi } from '@constants/api.constant';
import { NgbModal, NgbOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { DataService } from '@services/data.service';
import { HelpersService } from '@services/helpers.service';
import { TableService } from '@services/table.service';
import { ToastService } from '@services/toast-service';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subscription, firstValueFrom, map, tap } from 'rxjs';
import { ConfirmModalComponent } from 'src/app/shared/components/confirm-modal/confirm-modal.component';
import { Toast } from 'src/app/shared/enums/toast.enum';
import { AddNewPricingPolicyComponent } from '../add-new-pricing-policy/add-new-pricing-policy.component';

@Component({
  selector: 'app-pricing-policy-list',
  templateUrl: './pricing-policy-list.component.html',
})
export class PricingPolicyListComponent implements OnInit, OnDestroy {
  _selectedColumns: any[] = [];
  subs: Subscription[] = [];
  allColumns: any[] = [];
  defaultStorage = 'pricing-policy-default-selected';
  tableStorage = 'pricing-policy-table';
  changedColumns: any;
  pricingPolicyList: any;
  defaultSelected: any[] = [
    { field: 'NameAr', header: 'NameAr' },
    { field: 'CreatedDate', header: 'CreatedDate' },
    { field: 'Notes', header: 'Notes' },
  ];

  translate = inject(TranslateService);
  helpers = inject(HelpersService);
  tableService = inject(TableService);
  dataService = inject(DataService);
  route = inject(ActivatedRoute);
  spinner = inject(NgxSpinnerService);
  toast = inject(ToastService);
  modal = inject(NgbModal);
  offcanvasService = inject(NgbOffcanvas);

  async ngOnInit() {
    firstValueFrom(
      this.route.data.pipe(
        map((res) => res.pricingPolicyData),
        tap((res) => {
          if (res?.IsSuccess) {
            this.pricingPolicyList = res.Obj.Obj.PricingManagement;
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
      this.pricingPolicyList[0],
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

  openDrawer(pricingPolicy?: any): void {
    const offCanvasRef = this.offcanvasService.open(
      AddNewPricingPolicyComponent,
      {
        position: this.translate.currentLang == 'ar' ? 'start' : 'end',
        scroll: true,
        panelClass: 'w-100 w-md-75 w-lg-50',
      }
    );
    offCanvasRef.componentInstance.pricingPolicy = pricingPolicy;
    offCanvasRef.result.then((result) => {
      if (result) {
        this.getPricingPolicy();
      }
    });
  }

  delete(item: any): void {
    const modalRef = this.modal.open(ConfirmModalComponent);
    modalRef.componentInstance.modalInfo = {
      title: 'deletePricingPolicy',
      description: 'areYouSureToDelete',
      name: this.helpers.getTranslatedName(item),
    };
    modalRef.result.then((res) => {
      if (res) {
        this.spinner.show();
        firstValueFrom(
          this.dataService
            .delete(`${pricingPolicyApi}/DeletePricingPolicy`, {
              params: { id: item.Id },
            })
            .pipe(
              tap((res) => {
                if (res?.IsSuccess) {
                  this.spinner.hide();
                  this.toast.show(Toast.deleted, {
                    classname: Toast.success,
                  });
                  this.getPricingPolicy();
                }
              })
            )
        );
      }
    });
  }

  getPricingPolicy(): void {
    firstValueFrom(
      this.dataService.get(`${pricingPolicyApi}/PricingPolicyInfo`).pipe(
        tap((res) => {
          if (res?.IsSuccess) {
            this.pricingPolicyList = res.Obj.Obj.PricingManagement;
          }
        })
      )
    );
  }

  ngOnDestroy(): void {
    this.subs.forEach((sub) => sub.unsubscribe());
  }
}
