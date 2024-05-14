import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { apiUrl } from '@constants/api.constant';
import { DataService } from '@services/data.service';
import { TranslateService } from '@ngx-translate/core';
import { TableService } from '@services/table.service';
import { E_USER_ROLE } from '@constants/general.constant';
import { NgbOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { HelpersService } from '@services/helpers.service';
import { Subscription, firstValueFrom, map, tap } from 'rxjs';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ShiftDetailsDrawerComponent } from '../shift-details-drawer/shift-details-drawer.component';
import { ToastService } from '@services/toast-service';
import { Toast } from '@enums/toast.enum';
import { NgxSpinnerService } from 'ngx-spinner';
import { Router } from '@angular/router';

@Component({
  selector: 'app-add-new-sales-invoice',
  templateUrl: './add-new-sales-invoice.component.html',
})
export class AddNewSalesInvoiceComponent implements OnInit, OnDestroy {
  shiftData: any;
  items: any = [];
  invoiceInitObj: any;
  changedColumns: any;
  itemsUnits: any = [];
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
    { field: 'Barcode', header: 'Barcode' },
    { field: 'itemID', header: 'itemID' },
    { field: 'uniteId', header: 'uniteId' },
    { field: 'quantity', header: 'quantity' },
    { field: 'balance', header: 'balance' },
    { field: 'price', header: 'price' },
    { field: 'vat', header: 'vat' },
    { field: 'discount', header: 'discount' },
    { field: 'total', header: 'total' },
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
    'Price',
    'Barcode',
    'Item',
    'Unit',
    'Quantity',
    'Balance',
    'Vat',
    'Discount',
    'Total',
  ];
  set selectedColumns(val: any[]) {
    this._selectedColumns = this.defaultSelected.filter((col: any) =>
      val.includes(col)
    );
  }

  router = inject(Router);
  fb = inject(FormBuilder);
  toast = inject(ToastService);
  helpers = inject(HelpersService);
  dataService = inject(DataService);
  tableService = inject(TableService);
  spinner = inject(NgxSpinnerService);
  translate = inject(TranslateService);
  offcanvasService = inject(NgbOffcanvas);

  async ngOnInit() {
    this.salesInvoiceInit();
    this.checkIfUserShiftOpened();
    this.getShiftInfo();
    this.initForm();
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
    let exchangePrice;
    let clientType;
    let docType;
    let storeId;
    let isMobile;
    let visaTrxType;
    let visaTrxNo;
    let totalDisc = 0;
    let totalVat = 0;
    let totalNet = 0;
    let cash = 0;
    let visa = 0;
    let debt = 0;

    this.salesInvoiceForm = this.fb.group({
      clientId: [clientId],
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
    let barcode;
    let itemID;
    let uniteId;
    let productId;
    let vat = 0;
    let vatAmount = 0;
    let quantity = 0;
    let balance = 0;
    let price = 0;
    let discount = 0;
    let total = 0;
    return this.fb.group({
      barcode: [barcode],
      itemID: [itemID],
      uniteId: [uniteId],
      vat: [vat],
      vatAmount: [vatAmount],
      productId: [productId],
      quantity: [quantity],
      balance: [balance],
      price: [price],
      discount: [discount],
      total: [total],
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
            this.invoiceInitObj = res.Obj;
            if (this.invoiceInitObj.isSalesPerson) {
              this.salesInvoiceForm.get('paymentType')?.setValue(2);
            }
            if (!this.invoiceInitObj.isSalesPerson) {
              this.salesInvoiceForm.get('paymentType')?.setValue(1);
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
      this.itemsUnits[i] = [];
      form.patchValue({
        uniteId: null,
        itemID: null,
        vat: null,
        productId: null,
      });
      return;
    }
    this.items[i] = [{ ...ev, NameAr: ev.Item?.NameAr }];
    this.itemsUnits[i] = [{ unitId: ev?.UnitId, name: ev?.UnitName }];
    this.linesArray.controls[i].patchValue({
      itemID: ev.ItemId,
      uniteId: ev.UnitId,
      vat: ev.Vat,
      productId: ev.Id,
      quantity: 1,
    });
    this.getBalance(ev, i);
    this.getPrice(ev, i);
  }

  selectedItemByName(ev: any, i: number): void {
    let form = this.linesArray.controls[i];
    if (!ev) {
      this.itemsUnits[i] = [];
      this.barcodeItems[i] = [];
      form.patchValue({
        uniteId: null,
        barcode: null,
      });
      return;
    }
    ev?.ItemUnits?.forEach((el: any) => {
      el.name = el.UnitName;
      el.unitId = el.UnitId;
    });
    this.itemsUnits[i] = ev?.ItemUnits;
    form.patchValue({
      uniteId: this.itemsUnits[i][0]?.unitId,
    });
    this.selectedUnit(this.itemsUnits[i][0], i);
  }

  selectedUnit(ev: any, i: any) {
    if (ev) {
      let form = this.linesArray.controls[i];
      this.barcodeItems[i] = [ev];
      form.patchValue({
        vat: ev?.Vat,
        productId: ev?.Id,
        quantity: 1,
        barcode: ev?.Barcode,
      });
      this.getBalance(ev, i);
      this.getPrice(ev, i);
    }
  }

  getBalance(ev: any, i: number): void {
    let params = {
      itemUnitId: ev.Id,
      storeId: this.invoiceInitObj.empStore,
    };
    firstValueFrom(
      this.dataService
        .get(`${apiUrl}/XtraAndPos_GeneralLookups/GetItemBalanceFromStorage`, {
          params,
        })
        .pipe(
          tap((res) => {
            this.linesArray.controls[i].patchValue({ balance: res.Obj });
          })
        )
    );
  }

  getPrice(ev: any, i: number): void {
    firstValueFrom(
      this.dataService
        .get(`${apiUrl}/XtraAndPos_GeneralLookups/ItemPriceList`, {
          params: { barcode: ev.Barcode },
        })
        .pipe(
          tap((res) => {
            this.linesArray.controls[i].patchValue({ price: res.Obj.price });
            this.checkForOffers(res.Obj, i);
          })
        )
    );
  }

  checkForOffers(itemPriceObj: any, i: number) {
    let form = this.linesArray.controls[i];
    let quantity = form.get('quantity')?.value;
    let balance = form.get('balance')?.value;
    let price = form.get('price')?.value;
    if (balance < quantity && this.invoiceInitObj.saleByMinus) {
      this.addNewLine();
    } else {
      this.toast.show('Item Balance Not Allowed', {
        classname: Toast.error,
      });
    }
    if (itemPriceObj.offers.ItemDiscount > 0) {
      if (quantity == itemPriceObj.offers.ItemQty) {
        let discountValue =
          quantity * price * (itemPriceObj.offers.ItemDiscount / 100);
        form.patchValue({ discount: discountValue });
      } else {
        form.patchValue({ discount: 0 });
      }
    }
    if (itemPriceObj.offers.freeitems.length > 0) {
      if (quantity == itemPriceObj.offers.ItemQty) {
      }
    }
    this.runCalculations(i);
  }

  runCalculations(i: number) {
    let form = this.linesArray.controls[i];
    let quantity = form.get('quantity')?.value;
    let price = form.get('price')?.value;
    let vat = form.get('vat')?.value;
    let total = form.get('total')?.value;
    let discount = form.get('discount')?.value;
    let vatAmount = ((price * quantity - discount) * vat) / 100;
    total = price * quantity - discount + vatAmount;
    form.patchValue({
      total: total,
      vatAmount: vatAmount,
    });
    this.getTotalsOfInvoice();
  }

  getTotalsOfInvoice(): void {
    const totalNet = this.linesArray.controls
      .map((line: any) => +line.value?.total)
      .reduce((acc, curr) => acc + curr, 0);

    const totalVat = this.linesArray.controls
      .map((line: any) => +line.value?.vatAmount)
      .reduce((acc, curr) => acc + curr, 0);

    const totalDisc = this.linesArray.controls
      .map((line: any) => +line.value?.discount)
      .reduce((acc, curr) => acc + curr, 0);

    this.salesInvoiceForm.patchValue({
      totalNet,
      totalVat,
      totalDisc,
    });
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
    let paymentType = this.salesInvoiceForm.get('paymentType')!.value;
    let totalNet = this.salesInvoiceForm.get('totalNet')!.value;
    let cash = this.salesInvoiceForm.get('cash')!.value;
    let debt = this.salesInvoiceForm.get('debt')!.value;
    let val = +ev.target.value;
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
  }

  changeInCash(ev: any): void {
    let val = +ev.target.value;
    let totalNet = this.salesInvoiceForm.get('totalNet')!.value;
    let visa = this.salesInvoiceForm.get('visa')!.value;
    this.salesInvoiceForm.patchValue({
      debt: totalNet - visa - val,
    });
  }

  checkIfUserShiftOpened(): void {
    firstValueFrom(
      this.dataService
        .get(`${apiUrl}/ExtraAndPOS_Shift/IsUserShiftOpened`)
        .pipe(
          tap((res) => {
            if (
              res.Obj.IsUserShiftOpened &&
              (res.Obj.IsMustOpenShift || res.Obj?.IsMustOpenShift == undefined)
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
          this.shiftData = res.Obj;
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
        panelClass: 'w-100 w-md-50',
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
      this.helpers.getItemFromLocalStorage(this.userRole) !== 'Admin' ||
      !this.invoiceInitObj?.isSalesPerson
    ) {
      delete formValue.docDate;
    }
    console.log(formValue);

    // firstValueFrom(
    //   this.dataService
    //     .post(
    //       `${apiUrl}/XtraAndPos_StoreInvoices/CreateInvoiceForMobile`,
    //       formValue
    //     )
    //     .pipe(
    //       tap((_) => {
    //         this.spinner.hide();
    //         this.toast.show(Toast.added, { classname: Toast.success });
    //         this.router.navigateByUrl('/sales-invoice');
    //       })
    //     )
    // );
  }

  ngOnDestroy(): void {
    this.subs.forEach((sub) => sub.unsubscribe());
  }
}
