import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { apiUrl } from '@constants/api.constant';
import { TranslateService } from '@ngx-translate/core';
import { DataService } from '@services/data.service';
import { HelpersService } from '@services/helpers.service';
import { TableService } from '@services/table.service';
import { ToastService } from '@services/toast-service';
import { NgxSpinnerService } from 'ngx-spinner';
import {
  Subscription,
  debounceTime,
  distinctUntilChanged,
  firstValueFrom,
  map,
  tap,
} from 'rxjs';
import { Toast } from '@enums/toast.enum';
import { IPagination } from '@models/IPagination.model';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-add-new-pricing-policy-list',
  templateUrl: './add-new-pricing-policy-list.component.html',
})
export class AddNewPricingPolicyListComponent implements OnInit, OnDestroy {
  items: any[] = [];
  changedColumns: any;
  priceListData: any;
  pricingPolicesObj: any;
  allColumns: any[] = [];
  pricingPolicyLines: any;
  pagination: IPagination;
  barcodeItems: any[] = [];
  subs: Subscription[] = [];
  _selectedColumns: any[] = [];
  changedFieldsOnly: any[] = [];
  pricingPolicyListForm: FormGroup;
  searchControl = new FormControl('');
  defaultStorage = 'pricingPolicyLists-default-selected';
  tableStorage = 'pricingPolicyLists-table';
  itemsApi = `${apiUrl}/XtraAndPos_GeneralLookups/GetItemUnitByTrim`;
  defaultSelected: any[] = [
    { field: 'ParCode', header: 'ParCode' },
    { field: 'ItemUniteId', header: 'ItemUniteId' },
    { field: 'Price', header: 'Price' },
    { field: 'PriceMax', header: 'PriceMax' },
    { field: 'PriceMin', header: 'PriceMin' },
    { field: 'CommissionPercentage', header: 'CommissionPercentage' },
    { field: 'CommissionValue', header: 'CommissionValue' },
  ];
  invoiceLineKeys = [
    'ParCode',
    'ItemUniteId',
    'Price',
    'PriceMax',
    'PriceMin',
    'CommissionPercentage',
    'CommissionValue',
  ];
  set selectedColumns(val: any[]) {
    this._selectedColumns = this.defaultSelected.filter((col: any) =>
      val.includes(col)
    );
  }
  router = inject(Router);
  fb = inject(FormBuilder);
  toast = inject(ToastService);
  route = inject(ActivatedRoute);
  helpers = inject(HelpersService);
  dataService = inject(DataService);
  tableService = inject(TableService);
  spinner = inject(NgxSpinnerService);
  translate = inject(TranslateService);

  async ngOnInit() {
    this.getPriceListInit();
    firstValueFrom(
      this.route.data.pipe(
        map((res) => res?.pricingPolicyList),
        tap((res: any) => {
          if (res) {
            this.priceListData = res.Obj.PriceList;
            this.setData(res.Obj);
          }
        })
      )
    );
    this.subs.push(
      this.searchControl.valueChanges
        .pipe(
          distinctUntilChanged(),
          debounceTime(500),
          tap((term: any) => {
            if (!term || term >= 1) {
              this.pagination.PageNumber = 1;
              this.getPaginatedItems();
            }
          })
        )
        .subscribe()
    );
    this.initForm();
    await this.InitTable();
  }

  getPriceListInit(): void {
    firstValueFrom(
      this.dataService
        .get(`${apiUrl}/XtraAndPos_PricePolicyList/PriceListInit`)
        .pipe(
          tap((res) => {
            this.pricingPolicesObj = res?.Obj;
          })
        )
    );
  }

  initForm(): void {
    let PricePolicyId = this.priceListData?.Id;
    // let groupId;
    // let branches;

    if (this.priceListData) {
      PricePolicyId = this.priceListData?.Id;
    }

    this.pricingPolicyListForm = this.fb.group({
      PricePolicyId: [PricePolicyId, [Validators.required]],
      // groupId: [groupId],
      // branches: [branches],
      PriceListDetail: this.fb.array([this.newLine()]),
    });
    // if (this.pricingListData) {
    //   this.pricingListData.Branches = this.pricingListData?.Branches.map(
    //     (el: any) => (el = el.BranchId)
    //   );
    // }
    if (this.pricingPolicyLines?.length) {
      this.addItemsToArray();
    }
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

  addItemsToArray(): void {
    this.linesArray.clear();
    this.pricingPolicyLines.forEach((line: any) => {
      let newLine: any = {
        ...line,
        ItemUniteId: {
          Id: line?.ItemUniteId,
          NameAr: line?.NameAr,
          NameEn: line?.NameEn,
        },
        ParCode: { Barcode: line?.ParCode },
      };
      let index = this.changedFieldsOnly.findIndex((el) => el.Id == newLine.Id);
      if (index >= 0) {
        newLine = {
          ...this.changedFieldsOnly[index],
          ItemUniteId: {
            Id: this.changedFieldsOnly[index]?.ItemUniteId,
            NameAr: this.changedFieldsOnly[index]?.NameAr,
            NameEn: this.changedFieldsOnly[index]?.NameEn,
          },
          ParCode: { Barcode: this.changedFieldsOnly[index]?.ParCode },
        };
      }
      this.addNewLine(newLine);
    });
  }

  get linesArray(): FormArray {
    return this.pricingPolicyListForm.get('PriceListDetail')! as FormArray;
  }

  addNewLine(value?: any): void {
    if (value) {
      this.linesArray.push(this.newLine(value));
      return;
    }
    this.linesArray.push(this.newLine());
  }

  newLine(value?: any): FormGroup {
    let Id = 0;
    let PriceListId;
    let ParCode;
    let ItemUniteId;
    let Price;
    let PriceMin;
    let PriceMax;
    let CommissionValue;
    let CommissionPercentage;
    if (value) {
      ParCode = value?.ParCode;
      ItemUniteId = value?.ItemUniteId;
      Price = value?.Price;
      PriceMin = value?.PriceMin;
      PriceMax = value?.PriceMax;
      CommissionValue = value?.CommissionValue;
      CommissionPercentage = value?.CommissionPercentage;
    }
    if (this.priceListData) {
      Id = value?.Id;
      PriceListId = null;
    }
    return this.fb.group({
      Id: [Id],
      PriceListId: [PriceListId],
      ItemUniteId: [ItemUniteId],
      ParCode: [ParCode],
      Price: [Price],
      PriceMin: [PriceMin],
      PriceMax: [PriceMax],
      CommissionValue: [CommissionValue],
      CommissionPercentage: [CommissionPercentage],
    });
  }

  remove(i: number) {
    if (this.linesArray.length > 1) {
      this.linesArray.removeAt(i);
    }
  }

  selectedItemByBarcode(ev: any, i: any) {
    this.linesArray.controls[i].patchValue({
      ItemUniteId: ev.Id,
    });
    this.items[i] = [ev];
    this.addNewLine();
    this.getPrice(ev, i);
  }

  selectedItemByName(ev: any, i: any) {
    this.linesArray.controls[i].patchValue({
      ParCode: ev.Barcode,
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
            this.linesArray.controls[i].patchValue({ Price: res?.Obj?.price });
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

  setData(res: any): void {
    this.pricingPolicyLines = res.PagedResult;
    this.pagination = {
      PageSize: res.PageSize,
      PageNumber: res.PageNumber,
      TotalCount: res.TotalCount,
    };
  }

  page(pageNo: number): void {
    this.pagination.PageNumber = pageNo;
    this.getPaginatedItems();
  }

  getPaginatedItems(): void {
    this.spinner.show();
    let params: any = {
      pageNumber: this.pagination.PageNumber,
      pageSize: this.pagination.PageSize,
      priceListId: this.priceListData?.Id,
    };
    if (this.searchControl.value) {
      params.searchValue = this.searchControl.value;
    }
    firstValueFrom(
      this.dataService
        .get(`${apiUrl}/XtraAndPos_PricePolicyList/GetPagedPriceListDetail`, {
          params,
        })
        .pipe(
          tap((res) => {
            this.spinner.hide();
            this.setData(res.Obj);
            this.addItemsToArray();
          })
        )
    );
  }

  updatedFieldsList(ev: any, row: any) {
    let index = this.changedFieldsOnly.findIndex(
      (el) => el.ParCode == row.value.ParCode
    );
    if (!this.changedFieldsOnly?.length || index < 0) {
      this.changedFieldsOnly.push(row.value);
    } else {
      this.changedFieldsOnly[index] = row.value;
    }
  }

  submit(): void {
    this.spinner.show();
    if (!this.priceListData) {
      this.changedFieldsOnly.forEach((field) => {
        field.PriceListId = this.pricingPolicyListForm.value.PricePolicyId;
      });
    }

    console.log(this.changedFieldsOnly);

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
    //         `${apiUrl}/XtraAndPos_PricePolicyList/UpdatePriceListDetail`,
    //         this.changedFieldsOnly
    //       )
    //       .pipe(
    //         tap((res) => {
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
    //     .post(`${apiUrl}/XtraAndPos_PricePolicyList/UpdatePriceListDetail`, this.changedFieldsOnly)
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
