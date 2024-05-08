import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { apiUrl } from '@constants/api.constant';
import { TranslateService } from '@ngx-translate/core';
import { DataService } from '@services/data.service';
import { HelpersService } from '@services/helpers.service';
import { TableService } from '@services/table.service';
import { ToastService } from '@services/toast-service';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subscription, firstValueFrom, tap } from 'rxjs';
import { Toast } from 'src/app/shared/enums/toast.enum';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-add-new-pricing-policy-list',
  templateUrl: './add-new-pricing-policy-list.component.html',
})
export class AddNewPricingPolicyListComponent implements OnInit, OnDestroy {
  pricingPolicyList: any;
  pricingPolicesObj: any;
  pricingPolicyListForm: FormGroup;
  _selectedColumns: any[] = [];
  subs: Subscription[] = [];
  allColumns: any[] = [];
  barcodeItems: any[] = [];
  items: any[] = [];
  changedColumns: any;
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
  route = inject(ActivatedRoute);
  toast = inject(ToastService);

  async ngOnInit() {
    firstValueFrom(
      this.route.data.pipe(
        tap((res: any) => {
          this.pricingPolicesObj = res?.pricingPolicyList[0]?.Obj;
          this.pricingPolicyList = res?.pricingPolicyList[1]?.Obj?.list[0];
          this.initForm();
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

  initForm(): void {
    let pricePolicyId;
    let groupId;
    let branches;

    this.pricingPolicyListForm = this.fb.group({
      pricePolicyId: [pricePolicyId],
      groupId: [groupId],
      branches: [branches],
      priceListDetail: this.fb.array([this.newLine()]),
    });
    if (this.pricingPolicyList) {
      this.pricingPolicyList.Branches = this.pricingPolicyList?.Branches.map(
        (el: any) => (el = el.BranchId)
      );
    }
    if (this.pricingPolicyList?.PriceListDetail?.length) {
      this.linesArray.clear();
      this.pricingPolicyList?.PriceListDetail.forEach((line: any) => {
        this.addNewLine(line);
      });
    }
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
    if (value) {
      price = value?.price;
      priceMin = value?.priceMin;
      priceMax = value?.priceMax;
      itemUniteId = value?.itemUniteId;
      parCode = value?.parCode;
      commissionValue = value?.commissionValue;
      commissionPercentage = value?.commissionPercentage;
    }
    if (this.pricingPolicyList) {
      price = value?.Price;
      priceMin = value?.PriceMin;
      priceMax = value?.PriceMax;
      itemUniteId = value?.ItemUniteId;
      parCode = value?.ParCode;
      commissionValue = value?.CommissionValue;
      commissionPercentage = value?.CommissionPercentage;
    }
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

  selectedFile(file: any): void {
    this.linesArray.clear();
    let fileData;
    const reader = new FileReader();
    reader.onload = (e: any) => {
      const binaryString = e.target.result;
      const workbook = XLSX.read(binaryString, { type: 'binary' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      fileData = XLSX.utils.sheet_to_json(worksheet, {
        raw: true,
      });
      fileData.forEach((row) => {
        this.addNewLine(row);
      });
    };
    reader.readAsArrayBuffer(file);
  }

  submit(): void {
    console.log(this.pricingPolicyListForm.value);

    // this.spinner.show();
    // let formValue = {
    //   ...this.pricingPolicyListForm.value,
    //   priceListDetail: this.helpers.removeEmptyLines(this.linesArray),
    // };
    // let branchesLength = formValue?.branches?.filter(Number).length;
    // if (branchesLength) {
    //   formValue.branches = formValue.branches.filter(Number).map((id: any) => {
    //     return { branchId: id };
    //   });
    // }
    // if (this.pricingPolicyList) {
    //   firstValueFrom(
    //     this.dataService
    //       .post(
    //         `${apiUrl}/XtraAndPos_PricePolicyList/Update?id=${this.pricingPolicyList.Id}`,
    //         formValue
    //       )
    //       .pipe(
    //         tap((res) => {
    //           console.log(res);
    //           this.spinner.hide();
    //           this.router.navigateByUrl('/pricing-policy-lists');
    //           this.toast.show(Toast.updated, {
    //             classname: Toast.success,
    //           });
    //         })
    //       )
    //   );
    //   return;
    // }
    // firstValueFrom(
    //   this.dataService
    //     .post(`${apiUrl}/XtraAndPos_PricePolicyList/Create`, formValue)
    //     .pipe(
    //       tap((res) => {
    //         this.spinner.hide();
    //         this.router.navigateByUrl('/pricing-policy-lists');
    //         this.toast.show(Toast.added, {
    //           classname: Toast.success,
    //         });
    //       })
    //     )
    // );
  }

  ngOnDestroy(): void {
    this.subs.forEach((el) => el.unsubscribe());
  }
}
