import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  Renderer2,
  inject,
} from '@angular/core';
import { apiUrl } from '@constants/api.constant';
import { DataService } from '@services/data.service';
import { TranslateService } from '@ngx-translate/core';
import { TableService } from '@services/table.service';
import { E_USER_ROLE } from '@constants/general.constant';
import { NgbOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { HelpersService } from '@services/helpers.service';
import { Subscription, firstValueFrom, map, tap } from 'rxjs';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ShiftDetailsDrawerComponent } from '../shift-details-drawer/shift-details-drawer.component';
import { ToastService } from '@services/toast-service';
import { Toast } from '@enums/toast.enum';
import { NgxSpinnerService } from 'ngx-spinner';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-add-new-sales-invoice',
  templateUrl: './add-new-sales-invoice.component.html',
})
export class AddNewSalesInvoiceComponent implements OnInit, OnDestroy {
  shiftData: any;
  items: any[] = [];
  isRoundToTwoNumbers: any;
  invoiceInitObj: any;
  itemPriceList: any[] = [];
  changedColumns: any;
  units: any = [];
  userRole = E_USER_ROLE;
  allColumns: any[] = [];
  barcodeItems: any[] = [];
  IsMustOpenShift: boolean;
  subs: Subscription[] = [];
  salesInvoiceForm: FormGroup;
  _selectedColumns: any[] = [];
  tableStorage = 'salesInvoiceLines-table';
  defaultStorage = 'salesInvoiceLines-default-selected';
  clientsApi = `${apiUrl}/XtraAndPos_GeneralLookups/CustomerByTerm`;
  itemsByTermApi = `${apiUrl}/XtraAndPos_GeneralLookups/GetItemsByTrim`;
  itemsByBarcodeApi = `${apiUrl}/XtraAndPos_GeneralLookups/GetItemByBarcode`;
  defaultSelected: any[] = [
    { field: 'productBarcode', header: 'Barcode' },
    { field: 'itemID', header: 'item' },
    { field: 'uniteId', header: 'unit' },
    { field: 'quantity', header: 'quantity' },
    { field: 'price', header: 'price' },
    { field: 'discount', header: 'discount' },
    { field: 'balance', header: 'balance' },
    { field: 'vat', header: 'vat' },
    { field: 'totalPriceAfterVat', header: 'TotalPriceAfterVat' },
  ];
  paymentTypes = [
    { name: 'cash', value: 1 },
    { name: 'debt', value: 2 },
  ];
  visaTrxTypes = [
    { name: 'Mada', value: 1 },
    { name: 'Transfer', value: 2 },
  ];
  invoiceLineKeys = [
    'price',
    'barcode',
    'item',
    'unit',
    'quantity',
    'balance',
    'vat',
    'discount',
    'TotalPriceAfterVat',
  ];
  set selectedColumns(val: any[]) {
    this._selectedColumns = this.defaultSelected.filter((col: any) =>
      val.includes(col)
    );
  }

  router = inject(Router);
  route = inject(ActivatedRoute);
  fb = inject(FormBuilder);
  toast = inject(ToastService);
  renderer = inject(Renderer2);
  elementRef = inject(ElementRef);
  helpers = inject(HelpersService);
  dataService = inject(DataService);
  tableService = inject(TableService);
  spinner = inject(NgxSpinnerService);
  translate = inject(TranslateService);
  offcanvasService = inject(NgbOffcanvas);

  async ngOnInit() {
    this.isRoundToTwoNumbers = this.helpers.salesSettings()?.RoundToTwoNumbers;
    firstValueFrom(
      this.route.data.pipe(
        tap((res) => {
          console.log(res.saleInvoice);
        })
      )
    );
    this.initForm();
    this.salesInvoiceInit();
    this.checkIfUserShiftOpened();
    this.getShiftInfo();
    await this.initTableColumns();
    this.subs.push(
      this.translate.onLangChange.subscribe(async () => {
        await this.initTableColumns();
      })
    );
  }

  initForm(): void {
    let clientId;
    let paymentType;
    let docDate = new Date();
    let notes;
    let bankId;
    let isPendingPayment;
    let treasuryId;
    let exchangePrice = 1;
    let clientType;
    let docType;
    let storeId;
    let isMobile = false;
    let visaTrxType;
    let visaTrxNo;
    let totalDisc = 0;
    let totalVat = 0;
    let totalNet = 0;
    let cash = 0;
    let visa = 0;
    let debt = 0;

    this.salesInvoiceForm = this.fb.group({
      clientId: [clientId, [Validators.required]],
      paymentType: [paymentType],
      docDate: [docDate],
      notes: [notes],
      totalDisc: [totalDisc],
      cash: [cash],
      visa: [visa],
      bankId: [bankId],
      debt: [debt],
      isPendingPayment: [isPendingPayment],
      treasuryId: [treasuryId],
      exchangePrice: [exchangePrice],
      clientType: [clientType],
      docType: [docType],
      storeId: [storeId],
      isMobile: [isMobile],
      visaTrxType: [visaTrxType],
      visaTrxNo: [visaTrxNo],
      saleInvoiceDetails: this.fb.array([this.newLine()]),
      totalVat: [totalVat],
      totalNet: [totalNet],
    });
  }

  get linesArray(): FormArray {
    return this.salesInvoiceForm.get('saleInvoiceDetails') as FormArray;
  }

  addNewLine(value?: any, i?: any): void {
    if (value) {
      this.linesArray.controls.splice(i, 0, this.newLine(value));
      return;
    }
    this.linesArray.push(this.newLine());
  }

  remove(i: number) {
    if (
      this.itemPriceList[i] &&
      this.linesArray.controls[i + 1]?.get('isProductFree')?.value
    ) {
      let itemUnites = this.itemPriceList[i]?.offers?.ItemUnites;
      for (let index = 1; index <= itemUnites?.length + 1; index++) {
        this.linesArray.removeAt(i);
        this.itemPriceList.splice(i, 1);
        this.items.splice(i, 1);
        this.units.splice(i, 1);
        this.barcodeItems.splice(i, 1);
      }
    } else {
      this.linesArray.removeAt(i);
    }
  }

  newLine(value?: any): FormGroup {
    let productBarcode;
    let itemID;
    let uniteId;
    let productId;
    let vat = 0;
    let vatAmount = 0;
    let quantity = 0;
    let balance = 0;
    let price = 0;
    let discount = 0;
    let totalPriceAfterVat = 0;
    let isProductFree = false;
    if (value) {
      productBarcode = value.ProductBarcode;
      itemID = value.ItemID;
      uniteId = value.UniteId;
      productId = value.ProductId;
      vat = value.Vat;
      vatAmount = value.VatAmount;
      quantity = value.Quantity;
      balance = value.Balance;
      price = value.Price;
      discount = value.Discount;
      totalPriceAfterVat = value.TotalPriceAfterVat;
      isProductFree = value.IsProductFree;
    }

    return this.fb.group({
      productBarcode: [productBarcode],
      itemID: [itemID],
      uniteId: [uniteId],
      vat: [vat],
      vatAmount: [vatAmount],
      productId: [productId],
      quantity: [quantity],
      balance: [balance],
      price: [price],
      discount: [discount],
      totalPriceAfterVat: [totalPriceAfterVat],
      isProductFree: [isProductFree],
    });
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

  salesInvoiceInit(): void {
    firstValueFrom(
      this.dataService
        .get(`${apiUrl}/XtraAndPos_GeneralLookups/SalesInvoiceInit`)
        .pipe(
          tap((res) => {
            if (res?.IsSuccess) {
              this.invoiceInitObj = res.Obj;
              this.salesInvoiceForm.patchValue({
                treasuryId: this.invoiceInitObj.empTreasury,
                storeId:
                  this.invoiceInitObj?.empStore > 0
                    ? this.invoiceInitObj.empStore
                    : null,
              });
              if (this.invoiceInitObj.isSalesPerson) {
                this.salesInvoiceForm.get('paymentType')?.setValue(2);
              }
              if (!this.invoiceInitObj.isSalesPerson) {
                this.salesInvoiceForm.get('paymentType')?.setValue(1);
              }
            }
          })
        )
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

  changePaymentType(ev: any) {
    this.fillPaymentMethodWithTotal();
  }

  selectedItemByBarcode(ev: any, i: number) {
    let form = this.linesArray.controls[i];
    if (!ev) {
      this.items[i] = [];
      this.units[i] = [];
      form.patchValue({
        uniteId: null,
        itemID: null,
        vat: null,
        productId: null,
      });
      return;
    }
    this.items[i] = [{ ...ev, NameAr: ev.Item?.NameAr }];
    this.units[i] = [{ unitId: ev?.UnitId, name: ev?.UnitName }];
    this.linesArray.controls[i].patchValue({
      itemID: ev.ItemId,
      uniteId: ev.UnitId,
      vat: ev.Vat,
      productId: ev.Id,
      quantity: 1,
    });
    this.getBalance(ev, i);
  }

  selectedItemByName(ev: any, i: number): void {
    let form = this.linesArray.controls[i];
    if (!ev) {
      this.units[i] = [];
      this.barcodeItems[i] = [];
      form.patchValue({
        uniteId: null,
        productBarcode: null,
      });
      return;
    }
    ev?.ItemUnits?.forEach((el: any) => {
      el.name = el.UnitName;
      el.unitId = el.UnitId;
    });
    this.units[i] = ev?.ItemUnits;
    form.patchValue({
      uniteId: this.units[i][0]?.unitId,
    });
    this.selectedUnit(this.units[i][0], i);
  }

  selectedUnit(ev: any, i: any): void {
    if (ev) {
      let form = this.linesArray.controls[i];
      this.barcodeItems[i] = [ev];
      form.patchValue({
        vat: ev?.Vat,
        productId: ev?.Id,
        quantity: 1,
        productBarcode: ev?.Barcode,
      });
      this.getBalance(ev, i);
    }
  }

  getBalance(ev: any, i: number): void {
    let params = {
      itemUnitId: ev.Id,
      storeId: this.salesInvoiceForm.get('storeId')!.value,
    };
    firstValueFrom(
      this.dataService
        .get(`${apiUrl}/XtraAndPos_GeneralLookups/GetItemBalanceFromStorage`, {
          params,
        })
        .pipe(
          tap((res) => {
            if (res?.IsSuccess) {
              this.linesArray.controls[i].patchValue({ balance: res.Obj });
              this.getPrice(ev, i);
            }
          })
        )
    );
  }

  getPrice(ev: any, i: number): void {
    let quantity = this.linesArray.controls[i].get('quantity')?.value;
    let balance = this.linesArray.controls[i].get('balance')?.value;
    firstValueFrom(
      this.dataService
        .get(`${apiUrl}/XtraAndPos_GeneralLookups/ItemPriceList`, {
          params: { barcode: ev.Barcode },
        })
        .pipe(
          tap((res) => {
            if (res?.IsSuccess) {
              if (balance < quantity && !this.invoiceInitObj.saleByMinus) {
                this.toast.show('itemBalanceNotAllowed', {
                  classname: Toast.error,
                });
                this.remove(i);
                this.items[i] = [];
                this.barcodeItems[i] = [];
                this.units[i] = [];
                this.addNewLine();
                return;
              }
              this.itemPriceList[i] = res.Obj;
              this.linesArray.controls[i].patchValue({ price: res.Obj.price });
              this.checkForOffers(i);
              this.addNewLine();
              setTimeout(() => {
                this.focusOnNextRow(i);
              });
            }
          })
        )
    );
  }

  focusOnNextRow(i: any): void {
    const ngSelectElements = this.renderer
      .selectRootElement(this.elementRef.nativeElement, true)
      .querySelectorAll('#productBarcode');
    const lastNgSelect = ngSelectElements[i + 1];
    if (lastNgSelect) {
      const inputElement = lastNgSelect.querySelector('input');
      if (inputElement) {
        inputElement.focus();
      }
    }
  }

  changeQuantity(ev: any, i: any): void {
    let balance = this.linesArray.controls[i].get('balance')?.value;
    if (ev.value) {
      if (balance < ev.value && !this.invoiceInitObj.saleByMinus) {
        this.toast.show('itemBalanceNotAllowed', {
          classname: Toast.error,
        });
        return;
      }
      this.checkForOffers(i);
    }
  }

  checkForOffers(i: number): void {
    let form = this.linesArray.controls[i];
    let quantity = form.get('quantity')?.value;
    let offers = this.itemPriceList[i]?.offers;
    let freeItems = this.itemPriceList[i]?.offers?.freeitems;
    let itemUnites = this.itemPriceList[i]?.offers?.ItemUnites;
    let freeItemsCount = Math.floor(quantity / offers?.ItemQty);

    if (offers.ItemDiscount > 0) {
      if (quantity >= this.itemPriceList[i]?.offers.ItemQty) {
        let discountValue = this.helpers.convertDiscountToValue(
          form,
          this.isRoundToTwoNumbers,
          this.itemPriceList[i]
        );
        form.patchValue({ discount: discountValue });
      } else {
        form.patchValue({ discount: 0 });
      }
    }

    if (freeItems?.length && itemUnites?.length) {
      let freeItemUnits: any = [];
      freeItems.forEach((item: any) => {
        let filterFreeItemUnit = itemUnites.find(
          (el: any) => el.ItemId == item.ItemId && el.UnitId === item.UniteId
        );
        freeItemUnits.push({
          ...filterFreeItemUnit,
          freeItemQuantity: item.FreeItemQuantity,
        });
      });
      if (quantity >= offers.ItemQty) {
        freeItemUnits.forEach((itemUnit: any, index: any) => {
          if (
            this.linesArray.controls[i + index + 1]?.get('isProductFree')?.value
          ) {
            this.linesArray.controls[i + index + 1].patchValue({
              quantity: itemUnit.freeItemQuantity * freeItemsCount,
            });
          } else {
            let newLine = {
              ProductBarcode: itemUnit.Barcode,
              ItemID: itemUnit.Id,
              UniteId: itemUnit.UnitId,
              Vat: 0,
              Price: 0,
              TotalPriceAfterVat: 0,
              Balance: 0,
              VatAmount: 0,
              Quantity: itemUnit.freeItemQuantity * freeItemsCount,
              Discount: 0,
              ProductId: itemUnit.Id,
              IsProductFree: true,
            };
            this.itemPriceList.splice(i + 1, 0, undefined);
            this.items.splice(i + index + 1, 0, [
              {
                ItemId: itemUnit.Id,
                NameAr: itemUnit.NameAr,
                NameEn: itemUnit.NameEn,
              },
            ]);
            this.units.splice(i + index + 1, 0, [
              {
                unitId: itemUnit.UnitId,
                name: itemUnit.UnitName,
              },
            ]);
            this.addNewLine(newLine, i + index + 1);
          }
        });
      }
      if (quantity < offers.ItemQty) {
        for (let index = 0; index < itemUnites?.length; index++) {
          if (this.linesArray.controls[i + 1]?.get('isProductFree')?.value) {
            this.linesArray.removeAt(i + 1);
            this.itemPriceList?.splice(i + 1, 1);
            this.items?.splice(i + 1, 1);
            this.units?.splice(i + 1, 1);
            this.barcodeItems?.splice(i + 1, 1);
          }
        }
      }
    }
    this.runCalculations(i);
  }

  runCalculations(i: number): void {
    let form = this.linesArray.controls[i];
    let price: any = form.get('price')?.value;
    let quantity: any = form.get('quantity')?.value;
    let discount: any = form.get('discount')?.value;
    let vat: any = form.get('vat')?.value;
    let totalPriceAfterVat: any = form.get('totalPriceAfterVat')?.value;
    let vatAmount: any;

    if (!this.isRoundToTwoNumbers) {
      let p1 = Math.round(price * quantity);
      let p2 = Math.round(p1 - discount);
      let p3 = Math.round(p2 * vat);
      vatAmount = Math.round(p3 / 100);
      totalPriceAfterVat = p2 + vatAmount;
    } else {
      let part1 = Math.round(price * quantity * 100) / 100;
      let part2 = Math.round((part1 - discount) * 100) / 100;
      let part3 = Math.round(part2 * vat * 100) / 100;
      vatAmount = Math.round((part3 / 100) * 100) / 100;
      totalPriceAfterVat = Math.round((part2 + vatAmount) * 100) / 100;
    }
    form.patchValue({
      totalPriceAfterVat: totalPriceAfterVat,
      vatAmount: vatAmount,
    });
    this.getTotalsOfInvoice();
  }

  getTotalsOfInvoice(): void {
    let totalNet = this.linesArray.controls
      .map((line: any) => +line.value?.totalPriceAfterVat)
      .reduce((acc, curr) => acc + curr, 0);

    let totalVat = this.linesArray.controls
      .map((line: any) => +line.value?.vatAmount)
      .reduce((acc, curr) => acc + curr, 0);

    let totalDisc = this.linesArray.controls
      .map((line: any) => +line.value?.discount)
      .reduce((acc, curr) => acc + curr, 0);

    if (!this.isRoundToTwoNumbers) {
      this.salesInvoiceForm.patchValue({
        totalNet: Math.round(totalNet),
        totalVat: Math.round(totalVat),
        totalDisc: Math.round(totalDisc),
      });
    } else {
      this.salesInvoiceForm.patchValue({
        totalNet: Math.round(totalNet * 100) / 100,
        totalVat: Math.round(totalVat * 100) / 100,
        totalDisc: Math.round(totalDisc * 100) / 100,
      });
    }

    this.fillPaymentMethodWithTotal();
  }

  fillPaymentMethodWithTotal(): void {
    let paymentType = this.salesInvoiceForm.get('paymentType')!.value;
    let totalNet = this.salesInvoiceForm.get('totalNet')!.value;
    let visa = this.salesInvoiceForm.get('visa')!.value;
    let cash = this.salesInvoiceForm.get('cash')!.value;
    if (paymentType === 1) {
      this.salesInvoiceForm.patchValue({ cash: totalNet - visa, debt: 0 });
    }
    if (paymentType === 2) {
      this.salesInvoiceForm.patchValue({
        debt: totalNet - visa,
        cash: 0,
      });
    }
  }

  changeInVisa(ev: any): void {
    if (ev.value >= 0) {
      let val = ev.value;
      let paymentType = this.salesInvoiceForm.get('paymentType')!.value;
      let totalNet = this.salesInvoiceForm.get('totalNet')!.value;
      let cash = this.salesInvoiceForm.get('cash')!.value;
      let debt = this.salesInvoiceForm.get('debt')!.value;
      if (paymentType === 1) {
        this.salesInvoiceForm.patchValue({
          cash: totalNet - debt - val,
        });
      }
      if (paymentType === 2) {
        this.salesInvoiceForm.patchValue({
          debt: totalNet - cash - val,
        });
      }
      return;
    }
    this.salesInvoiceForm.patchValue({
      bankId: null,
      visaTrxType: null,
      visaTrxNo: null,
    });
  }

  changeInCash(ev: any): void {
    if (ev.value >= 0) {
      let val = ev.value;
      let totalNet = this.salesInvoiceForm.get('totalNet')!.value;
      let visa = this.salesInvoiceForm.get('visa')!.value;
      this.salesInvoiceForm.patchValue({
        debt: totalNet - visa - val,
      });
    }
  }

  checkIfUserShiftOpened(): void {
    firstValueFrom(
      this.dataService
        .get(`${apiUrl}/ExtraAndPOS_Shift/IsUserShiftOpened`)
        .pipe(
          tap((res) => {
            if (
              res?.Obj?.IsUserShiftOpened &&
              (res?.Obj?.IsMustOpenShift ||
                res?.Obj?.IsMustOpenShift == undefined)
            ) {
              this.IsMustOpenShift = true;
            }
          })
        )
    );
  }

  getShiftInfo(): void {
    firstValueFrom(
      this.dataService.get(`${apiUrl}/ExtraAndPOS_Shift/GetShiftInfo`).pipe(
        tap((res) => {
          if (res?.IsSuccess) {
            this.shiftData = res.Obj;
          }
        })
      )
    );
  }

  openShiftDetails(): void {
    const offCanvasRef = this.offcanvasService.open(
      ShiftDetailsDrawerComponent,
      {
        position: this.translate.currentLang == 'ar' ? 'start' : 'end',
        scroll: true,
        panelClass: 'w-100 w-md-75 w-lg-50',
      }
    );
    offCanvasRef.componentInstance.shiftData = this.shiftData;
  }

  submit(): void {
    this.spinner.show();
    let formValue = {
      ...this.salesInvoiceForm.value,
      saleInvoiceDetails: this.helpers.removeEmptyLines(this.linesArray),
    };
    if (
      this.helpers.getItemFromLocalStorage(this.userRole) === 'Admin' ||
      this.invoiceInitObj?.isSalesPerson
    ) {
      formValue.docDate = formValue.docDate.toISOString();
    } else {
      delete formValue.docDate;
    }

    firstValueFrom(
      this.dataService
        .post(
          `${apiUrl}/XtraAndPos_StoreInvoices/CreateInvoiceForMobile`,
          formValue
        )
        .pipe(
          tap((res) => {
            if (res?.IsSuccess) {
              this.spinner.hide();
              this.toast.show(Toast.added, { classname: Toast.success });
              this.router.navigateByUrl('/sales-invoice');
            }
          })
        )
    );
  }

  ngOnDestroy(): void {
    this.subs.forEach((sub) => sub.unsubscribe());
  }
}
