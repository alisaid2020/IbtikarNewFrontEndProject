import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { apiUrl } from '@constants/api.constant';
import { TranslateService } from '@ngx-translate/core';
import { DataService } from '@services/data.service';
import { HelpersService } from '@services/helpers.service';
import { TableService } from '@services/table.service';
import { ToastService } from '@services/toast-service';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subscription, firstValueFrom, tap } from 'rxjs';
import { Toast } from 'src/app/shared/enums/toast.enum';

@Component({
  selector: 'app-add-new-pricing-policy-list',
  templateUrl: './add-new-pricing-policy-list.component.html',
})
export class AddNewPricingPolicyListComponent implements OnInit, OnDestroy {
  pricingPolicyList: any;
  pricingPolicesObj: any;
  itemsGroups: any;
  pricingPolicyListForm: FormGroup;
  _selectedColumns: any[] = [];
  subs: Subscription[] = [];
  allColumns: any[] = [];
  barcodeItems: any[] = [];
  defaultStorage = 'pricingPolicyLists-default-selected';
  tableStorage = 'pricingPolicyLists-table';
  itemsApi = `${apiUrl}/XtraAndPos_GeneralLookups/GetItemUnitByTrim`;
  defaultSelected: any[] = [
    { field: 'Barcode', header: 'Barcode' },
    { field: 'ItemID', header: 'ItemID' },
    { field: 'Price', header: 'Price' },
    { field: 'PriceMax', header: 'PriceMax' },
    { field: 'PriceMin', header: 'PriceMin' },
    { field: 'commissionPercentage', header: 'CommissionPercentage' },
    { field: 'commissionValue', header: 'CommissionValue' },
  ];
  invoiceLineKeys = [
    'Price',
    'Barcode',
    'Item',
    'PriceMax',
    'PriceMin',
    'commissionPercentage',
    'commissionValue',
  ];
  items: any[] = [];
  changedColumns: any;
  set selectedColumns(val: any[]) {
    this._selectedColumns = this.defaultSelected.filter((col: any) =>
      val.includes(col)
    );
  }
  fb = inject(FormBuilder);
  tableService = inject(TableService);
  translate = inject(TranslateService);
  helpers = inject(HelpersService);
  dataService = inject(DataService);
  spinner = inject(NgxSpinnerService);
  router = inject(Router);
  toast = inject(ToastService);

  async ngOnInit() {
    this.getPricingPolicies();
    this.initForm();
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
    this.allColumns = this.tableService.tableColumns(this.invoiceLineKeys);
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

  getPricingPolicies(): void {
    firstValueFrom(
      this.dataService
        .get(`${apiUrl}/XtraAndPos_PricePolicyList/PriceListInit`)
        .pipe(
          tap((res) => {
            this.pricingPolicesObj = res.Obj;
          })
        )
    );
  }

  initForm() {
    let pricePolicyId;
    let groupId;
    let branches;
    this.pricingPolicyListForm = this.fb.group({
      pricePolicyId: [pricePolicyId],
      groupId: [groupId],
      branches: [branches],
      priceListDetail: this.fb.array([this.newLine()]),
    });
  }

  get linesArray(): FormArray {
    return this.pricingPolicyListForm.get('priceListDetail') as FormArray;
  }

  addNewLine(value?: any): void {
    if (value) {
      this.linesArray.push(this.newLine(value));
      return;
    }
    this.linesArray.push(this.newLine());
  }

  remove(i: number) {
    if (this.linesArray.length > 1) {
      this.linesArray.removeAt(i);
    }
  }

  newLine(value?: any): FormGroup {
    let itemUniteId;
    let parCode;
    let price;
    let priceMin;
    let priceMax;
    let commissionValue;
    let commissionPercentage;
    return this.fb.group({
      itemUniteId: [itemUniteId],
      parCode: [parCode],
      price: [price],
      priceMin: [priceMin],
      priceMax: [priceMax],
      commissionValue: [commissionValue],
      commissionPercentage: [commissionPercentage],
    });
  }

  selectedItemByBarcode(ev: any, i: any) {
    this.linesArray.controls[i].patchValue({
      itemUniteId: ev.Id,
    });
    this.items[i] = [ev];
    this.getPrice(ev, i);
    this.addNewLine();
  }

  selectedItemByName(ev: any, i: any) {
    this.linesArray.controls[i].patchValue({
      parCode: ev.Barcode,
    });
    this.barcodeItems[i] = [ev];
  }

  getPrice(ev: any, i: number): void {
    firstValueFrom(
      this.dataService
        .get(`${apiUrl}/XtraAndPos_GeneralLookups/ItemPriceList`, {
          params: { itemUniteId: ev.Id },
        })
        .pipe(
          tap((res) => {
            this.linesArray.controls[i].patchValue({ price: res?.Obj?.price });
          })
        )
    );
  }

  submit() {
    this.spinner.show();
    let formValue = { ...this.pricingPolicyListForm.value };
    let branchesLength = formValue?.branches?.filter(Number).length;
    if (branchesLength) {
      formValue.branches = formValue.branches.filter(Number).map((id: any) => {
        return { branchId: id };
      });
    }
    if (this.pricingPolicyList) {
      firstValueFrom(
        this.dataService
          .post(
            `${apiUrl}/XtraAndPos_PricePolicyList/Update?id=${this.pricingPolicyList.Id}`,
            formValue
          )
          .pipe(
            tap((res) => {
              console.log(res);
              this.spinner.hide();
              this.router.navigateByUrl('/pricing-policy-lists');
              this.toast.show(Toast.updated, {
                classname: Toast.success,
              });
            })
          )
      );
      return;
    }
    firstValueFrom(
      this.dataService
        .post(`${apiUrl}/XtraAndPos_PricePolicyList/Create`, formValue)
        .pipe(
          tap((res) => {
            console.log(res);
            this.spinner.hide();
            this.router.navigateByUrl('/pricing-policy-lists');
            this.toast.show(Toast.added, {
              classname: Toast.success,
            });
          })
        )
    );
  }

  ngOnDestroy(): void {
    this.subs.forEach((el) => el.unsubscribe());
  }
}
