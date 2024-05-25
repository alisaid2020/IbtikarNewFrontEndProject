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
  updatedItems: any[] = [];
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
          if (res?.IsSuccess) {
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
    let pricePolicyId;
    let groupId;
    let branches;

    this.pricingPolicyListForm = this.fb.group({
      pricePolicyId: [pricePolicyId, [Validators.required]],
      groupId: [groupId, [Validators.required]],
      branches: [branches, [Validators.required]],
      priceListDetail: this.fb.array([this.newLine()]),
    });
    if (this.priceListData) {
      this.priceListData.Branches = this.priceListData?.Branches.map(
        (el: any) => (el = el.BranchId)
      );
    }
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
    this.pricingPolicyLines.forEach((line: any, i: any) => {
      let newLine = {
        ...line,
        ItemUniteId: {
          Id: line?.ItemUniteId,
          NameAr: line?.NameAr,
          NameEn: line?.NameEn,
        },
        ParCode: { Barcode: line?.ParCode },
      };
      if (this.updatedItems[line.Id]) {
        this.items[i] = [
          {
            Id: this.updatedItems[line.Id]?.Id,
            NameAr: this.updatedItems[line.Id]?.NameAr,
            NameEn: this.updatedItems[line.Id]?.NameEn,
          },
        ];
      } else {
        this.items[i] = [
          {
            Id: line?.ItemUniteId,
            NameAr: line?.NameAr,
            NameEn: line?.NameEn,
          },
        ];
      }
      let index = this.changedFieldsOnly.findIndex((el) => el.id == line.Id);
      if (index >= 0) {
        newLine = {
          Id: this.changedFieldsOnly[index].id,
          ItemUniteId: {
            Id: this.changedFieldsOnly[index]?.itemUniteId,
          },
          ParCode: { Barcode: this.changedFieldsOnly[index]?.parCode },
          Price: this.changedFieldsOnly[index].price,
          PriceMin: this.changedFieldsOnly[index].priceMin,
          PriceMax: this.changedFieldsOnly[index].priceMax,
          CommissionValue: this.changedFieldsOnly[index].commissionValue,
          NameAr: this.changedFieldsOnly[index].nameAr,
          CommissionPercentage:
            this.changedFieldsOnly[index].commissionPercentage,
        };
      }
      this.addNewLine(newLine);
    });
  }

  get linesArray(): FormArray {
    return this.pricingPolicyListForm.get('priceListDetail')! as FormArray;
  }

  addNewLine(value?: any): void {
    if (value) {
      this.linesArray.push(this.newLine(value));
      return;
    }
    this.linesArray.push(this.newLine());
  }

  newLine(value?: any): FormGroup {
    let id = 0;
    let priceListId;
    let parCode;
    let itemUniteId;
    let price = 0;
    let priceMin = 0;
    let priceMax = 0;
    let commissionValue = 0;
    let commissionPercentage = 0;
    let nameAr;
    if (value) {
      parCode = value?.ParCode;
      itemUniteId = value?.ItemUniteId;
      nameAr = value?.NameAr;
      price = value?.Price;
      priceMin = value?.PriceMin;
      priceMax = value?.PriceMax;
      commissionValue = value?.CommissionValue;
      commissionPercentage = value?.CommissionPercentage;
      if (this.priceListData) {
        id = value?.Id;
      }
    }
    return this.fb.group({
      id: [id],
      priceListId: [priceListId],
      itemUniteId: [itemUniteId],
      nameAr: [nameAr],
      parCode: [parCode],
      price: [price],
      priceMin: [priceMin],
      priceMax: [priceMax],
      commissionValue: [commissionValue],
      commissionPercentage: [commissionPercentage],
    });
  }

  remove(i: number) {
    if (this.linesArray.length > 1) {
      this.linesArray.removeAt(i);
    }
  }

  selectedItemByBarcode(ev: any, i: any) {
    let form = this.linesArray.controls[i];
    if (!ev) {
      this.items[i] = [];
      this.barcodeItems[i] = [];
      form.patchValue({
        itemUniteId: null,
        price: 0,
        priceMin: 0,
        priceMax: 0,
        commissionValue: 0,
        commissionPercentage: 0,
      });
      return;
    }
    form.patchValue({
      itemUniteId: ev.Id,
      price: ev?.Price,
      nameAr: ev?.NameAr,
    });
    this.items[i] = [ev];
    if (this.priceListData) {
      this.updatedItems[form.get('id')!.value] = ev;
      this.updatedFieldsList(form);
      return;
    }
    this.addNewLine();
    // this.getPrice(ev, i);
  }

  selectedItemByName(ev: any, i: any) {
    let form = this.linesArray.controls[i];
    if (!ev) {
      this.items[i] = [];
      this.barcodeItems[i] = [];
      form.patchValue({
        parCode: null,
        price: 0,
        priceMin: 0,
        priceMax: 0,
        commissionValue: 0,
        commissionPercentage: 0,
      });
      return;
    }
    form.patchValue({
      parCode: ev.Barcode,
      price: ev?.Price,
      nameAr: ev?.NameAr,
    });
    if (this.priceListData) {
      this.updatedItems[form.get('id')!.value] = ev;
      this.updatedFieldsList(form);
      return;
    }
    this.addNewLine();
  }

  getPrice(ev: any, i: number): void {
    firstValueFrom(
      this.dataService
        .get(`${apiUrl}/XtraAndPos_GeneralLookups/ItemPriceList`, {
          params: { itemUniteId: ev.Id },
        })
        .pipe(
          tap((res) => {
            if (res?.IsSuccess) {
              this.linesArray.controls[i].patchValue({
                price: res?.Obj?.price,
              });
            }
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
      fileData.forEach((row: any) => {
        let newline: any = {
          ParCode: row.parcode,
          ItemUniteId: row.itemUnitId,
          Price: row.price,
          PriceMin: row.priceMin,
          PriceMax: row.priceMax,
          CommissionValue: row.commissionValue,
          CommissionPercentage: row.commissionPercentage,
        };
        this.addNewLine(newline);
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
            if (res?.IsSuccess) {
              this.spinner.hide();
              this.setData(res.Obj);
              this.addItemsToArray();
            }
          })
        )
    );
  }

  updatedFieldsList(row: any) {
    let index = this.changedFieldsOnly.findIndex((el) => el.id == row.value.id);
    if (!this.changedFieldsOnly?.length || index < 0) {
      this.changedFieldsOnly.push(row.value);
    } else {
      this.changedFieldsOnly[index] = row.value;
    }
  }

  submit(): void {
    this.spinner.show();
    let formValue = {
      ...this.pricingPolicyListForm.value,
      priceListDetail: this.helpers.removeEmptyLines(this.linesArray),
    };
    formValue.priceListDetail.forEach((field: any) => {
      field.priceListId = this.pricingPolicyListForm.value.pricePolicyId;
    });
    let branchesLength = formValue?.branches?.filter(Number).length;
    if (branchesLength) {
      formValue.branches = formValue.branches.filter(Number).map((id: any) => {
        return { branchId: id };
      });
    }
    if (this.priceListData) {
      firstValueFrom(
        this.dataService
          .post(
            `${apiUrl}/XtraAndPos_PricePolicyList/UpdatePriceListDetail`,
            this.changedFieldsOnly
          )
          .pipe(
            tap((res) => {
              if (res?.IsSuccess) {
                this.spinner.hide();
                this.router.navigateByUrl('/pricing-policy-lists');
                this.toast.show(Toast.updated, {
                  classname: Toast.success,
                });
              }
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
            if (res?.IsSuccess) {
              this.spinner.hide();
              this.router.navigateByUrl('/pricing-policy-lists');
              this.toast.show(Toast.added, {
                classname: Toast.success,
              });
            }
          })
        )
    );
  }

  ngOnDestroy(): void {
    this.subs.forEach((el) => el.unsubscribe());
  }
}
