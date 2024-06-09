import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  inject,
} from '@angular/core';
import { Toast } from '@enums/toast.enum';
import { NgxSpinnerService } from 'ngx-spinner';
import { DataService } from '@services/data.service';
import { TranslateService } from '@ngx-translate/core';
import { TableService } from '@services/table.service';
import { ToastService } from '@services/toast-service';
import { ActivatedRoute, Router } from '@angular/router';
import { E_USER_ROLE } from '@constants/general.constant';
import { NgbOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { HelpersService } from '@services/helpers.service';
import { Subscription, firstValueFrom, map, tap } from 'rxjs';
import { apiUrl, generalLookupsApi } from '@constants/api.constant';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ShiftDetailsDrawerComponent } from '../shift-details-drawer/shift-details-drawer.component';

@Component({
  selector: 'app-add-new-sales-invoice',
  templateUrl: './add-new-sales-invoice.component.html',
})
export class AddNewSalesInvoiceComponent implements OnInit, OnDestroy {
  shiftData: any;
  saleInvoice: any;
  items: any[] = [];
  invoiceLineKeys: any[];
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
  clientsApi = `${generalLookupsApi}/CustomerByTerm`;
  itemsByTermApi = `${generalLookupsApi}/GetItemsByTrim`;
  itemsByBarcodeApi = `${generalLookupsApi}/GetItemByBarcode`;
  paymentTypes = [
    { name: 'cash', value: 1 },
    { name: 'debt', value: 2 },
  ];
  visaTrxTypes = [
    { name: 'Mada', value: 1 },
    { name: 'Transfer', value: 2 },
  ];
  defaultSelected: any[] = [
    { field: 'ProductBarcode', header: 'Barcode' },
    { field: 'ItemID', header: 'item' },
    { field: 'UniteId', header: 'unit' },
    { field: 'Quantity', header: 'quantity' },
    { field: 'Price', header: 'price' },
    { field: 'Discount', header: 'discount' },
    { field: 'Balance', header: 'balance' },
    { field: 'Vat', header: 'vat' },
    { field: 'TotalPriceAfterVat', header: 'TotalPriceAfterVat' },
  ];

  router = inject(Router);
  fb = inject(FormBuilder);
  toast = inject(ToastService);
  route = inject(ActivatedRoute);
  elementRef = inject(ElementRef);
  helpers = inject(HelpersService);
  dataService = inject(DataService);
  spinner = inject(NgxSpinnerService);
  tableService = inject(TableService);
  translate = inject(TranslateService);
  offcanvasService = inject(NgbOffcanvas);

  async ngOnInit() {
    this.salesInvoiceInit();
    this.isRoundToTwoNumbers = this.helpers.salesSettings()?.RoundToTwoNumbers;
    firstValueFrom(
      this.route.data.pipe(
        map((res) => res.saleInvoice),
        tap(async (res) => {
          if (res?.IsSuccess) {
            this.saleInvoice = res?.Obj;
          }
        })
      )
    );
    this.initForm();
    this.checkIfUserShiftOpened();
    this.getShiftInfo();
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
      this.invoiceLineKeys,
      this.defaultSelected
    );
    [this.changedColumns, this._selectedColumns] =
      await this.tableService.storageFn(
        this.defaultSelected,
        this.defaultStorage,
        this._selectedColumns
      );
  }

  salesInvoiceInit(): void {
    firstValueFrom(
      this.dataService.get(`${generalLookupsApi}/SalesInvoiceInit?Trx=1`).pipe(
        tap(async (res) => {
          if (res?.IsSuccess) {
            this.invoiceInitObj = res.Obj;
            this.invoiceLineKeys = this.invoiceInitObj.DetailsColumns;
            await this.InitTable();
            this.salesInvoiceForm.patchValue({
              treasuryId: this.invoiceInitObj.empTreasury,
            });
            if (!this.saleInvoice) {
              let matchingStore = this.invoiceInitObj.stores.find(
                (el: any) => el.Id === this.invoiceInitObj?.empStore
              );
              this.salesInvoiceForm.patchValue({
                paymentType: this.invoiceInitObj.isSalesPerson ? 2 : 1,
                storeId:
                  this.invoiceInitObj?.empStore > 0 && matchingStore
                    ? this.invoiceInitObj.empStore
                    : null,
              });
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
    if (this.saleInvoice) {
      clientId = { Id: this.saleInvoice.inv?.ClientId };
      docDate = new Date(this.saleInvoice.inv?.DocDate);
      notes = this.saleInvoice.inv?.Notes;
      bankId = { Id: this.saleInvoice.inv?.BankId };
      isPendingPayment = this.saleInvoice.inv?.IsPendingPayment;
      exchangePrice = this.saleInvoice.inv?.ExchangePrice;
      clientType = this.saleInvoice.inv?.ClientType;
      docType = this.saleInvoice.inv.DocType;
      isMobile = this.saleInvoice.inv.IsMobile;
      visaTrxType = this.saleInvoice.inv.VisaTrxType;
      visaTrxNo = this.saleInvoice.inv.VisaTrxNo;
      totalDisc = this.saleInvoice.inv.TotalDisc;
      totalVat = this.saleInvoice.inv.TotalInvoiceVatAmount;
      totalNet = this.saleInvoice.inv.TotalInvoiceAfterVat;
      cash = this.saleInvoice.inv.Cash;
      visa = this.saleInvoice.inv.Visa;
      debt = this.saleInvoice.inv.Debt;
    }
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
      storeId: [storeId, [Validators.required]],
      isMobile: [isMobile],
      visaTrxType: [visaTrxType],
      visaTrxNo: [visaTrxNo],
      saleInvoiceDetails: this.fb.array([this.newLine()]),
      totalVat: [totalVat],
      totalNet: [totalNet],
    });
    if (this.saleInvoice?.inv?.SaleInvoiceDetails?.length) {
      this.saleInvoice.inv.SaleInvoiceDetails.forEach(
        (line: any, i: number) => {
          this.items[i] = [
            {
              ItemId: this.saleInvoice.ItemList[i].Id,
              NameAr: this.saleInvoice.ItemList[i]?.NameAr,
              NameEn: this.saleInvoice.ItemList[i]?.NameAr,
            },
          ];
          let unitObj = this.saleInvoice.ItemList[i].ItemUnits.find(
            (el: any) => el.UnitId === line?.UniteId
          );
          this.units[i] = [
            { unitId: unitObj?.UnitId, name: unitObj?.UnitName },
          ];
          let newLine = {
            ...line,
            ItemID: {
              ItemId: this.saleInvoice.ItemList[i].Id,
            },
            ProductBarcode: { Barcode: line.ProductBarcode },
          };
          this.addNewLine(newLine, i);
          setTimeout(() => {
            this.getBalance({ Id: this.saleInvoice.ItemUnitList[i].Id }, i);
          }, 0);
        }
      );
    }
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
      this.getTotalsOfInvoice();
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
    if (!this.salesInvoiceForm.get('storeId')!.value) {
      this.toast.show('selectStoreFirst', {
        classname: Toast.error,
      });
      form.patchValue({ productBarcode: null });
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
      form.reset();
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
    let form = this.linesArray.controls[i];
    if (!this.salesInvoiceForm.get('storeId')!.value) {
      this.toast.show('selectStoreFirst', {
        classname: Toast.error,
      });
      form.patchValue({ itemID: null, uniteId: null });
      return;
    }
    if (ev && !form.get('productBarcode')!.value) {
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
        .get(`${generalLookupsApi}/GetItemBalanceFromStorage`, {
          params,
        })
        .pipe(
          tap((res) => {
            if (res?.IsSuccess) {
              this.linesArray.controls[i].patchValue({ balance: res.Obj });
              if (!this.saleInvoice) {
                this.getPrice(ev, i);
              }
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
        .get(`${generalLookupsApi}/ItemPriceList`, {
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
                this.helpers.focusOnNextRow(
                  i + 1,
                  'productBarcode',
                  this.elementRef
                );
              });
            }
          })
        )
    );
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

    if (offers?.ItemDiscount > 0) {
      if (quantity >= this.itemPriceList[i]?.offers.ItemQty) {
        let discountValue = this.convertDiscountToValue(
          form,
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

  convertDiscountToValue(form: any, itemPriceObj: any): any {
    let quantity = form.get('quantity')?.value;
    let price = form.get('price')?.value;
    let discountValue: any;

    if (!this.isRoundToTwoNumbers) {
      let p1 = Math.round(price * quantity);
      let p2 = Math.round(itemPriceObj.offers.ItemDiscount / 100);
      discountValue = Math.round(p1 * p2);
    } else {
      let part1 = Math.round(quantity * price * 100) / 100;
      let part2 =
        Math.round((itemPriceObj.offers.ItemDiscount / 100) * 100) / 100;
      discountValue = Math.round(part1 * part2 * 100) / 100;
    }
    return discountValue;
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
